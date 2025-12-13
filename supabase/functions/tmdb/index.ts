import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const genreMap: Record<string, number> = {
  "Action": 28,
  "Adventure": 12,
  "Animation": 16,
  "Comedy": 35,
  "Crime": 80,
  "Documentary": 99,
  "Drama": 18,
  "Fantasy": 14,
  "Horror": 27,
  "Mystery": 9648,
  "Romance": 10749,
  "Sci-Fi": 878,
  "Thriller": 53,
};

const tvGenreMap: Record<string, number> = {
  "Action": 10759,
  "Adventure": 10759,
  "Animation": 16,
  "Comedy": 35,
  "Crime": 80,
  "Documentary": 99,
  "Drama": 18,
  "Fantasy": 10765,
  "Horror": 9648,
  "Mystery": 9648,
  "Romance": 10749,
  "Sci-Fi": 10765,
  "Thriller": 9648,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not configured");
    }

    const body = await req.json();
    const { action, category, genre, sortBy = "popularity", movieId, page = 1 } = body;
    
    // Handle movie detail request
    if (action === "getMovieDetail" && movieId) {
      console.log(`Fetching movie detail for ID: ${movieId}`);
      
      const [movieRes, creditsRes, videosRes, similarRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&page=1`),
      ]);

      if (!movieRes.ok) {
        throw new Error(`Movie not found: ${movieRes.status}`);
      }

      const [movie, credits, videos, similar] = await Promise.all([
        movieRes.json(),
        creditsRes.json(),
        videosRes.json(),
        similarRes.json(),
      ]);

      const trailer = videos.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
      
      const result = {
        id: `tmdb-${movie.id}`,
        tmdbId: movie.id,
        title: movie.title,
        year: new Date(movie.release_date || "").getFullYear() || 0,
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
        rating: Math.round((movie.vote_average / 2) * 10) / 10,
        synopsis: movie.overview,
        genres: movie.genres?.map((g: any) => g.name) || [],
        director: credits.crew?.find((c: any) => c.job === "Director")?.name || "",
        cast: credits.cast?.slice(0, 10).map((c: any) => ({ name: c.name, character: c.character, profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null })) || [],
        runtime: movie.runtime || 0,
        reviewCount: movie.vote_count,
        trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
        trailerKey: trailer?.key || null,
        similar: similar.results?.slice(0, 8).map((item: any) => ({
          id: `tmdb-${item.id}`,
          tmdbId: item.id,
          title: item.title,
          year: new Date(item.release_date || "").getFullYear() || 0,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          rating: Math.round((item.vote_average / 2) * 10) / 10,
        })).filter((item: any) => item.poster) || [],
      };

      console.log(`Returning movie detail for: ${result.title}`);
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle discover/browse request
    console.log(`Fetching ${category} with genre ${genre}, sort: ${sortBy}, page: ${page}`);

    let endpoint = "";
    let genreId: number | undefined;
    let sortParam = "popularity.desc";

    if (sortBy === "newest") {
      sortParam = "primary_release_date.desc";
    } else if (sortBy === "rating") {
      sortParam = "vote_average.desc";
    }

    if (category === "films") {
      genreId = genreMap[genre];
      endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=${sortParam}&vote_count.gte=100&page=${page}`;
    } else if (category === "tv") {
      genreId = tvGenreMap[genre];
      const tvSortParam = sortBy === "newest" ? "first_air_date.desc" : sortParam;
      endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=${tvSortParam}&vote_count.gte=50&page=${page}`;
    } else if (category === "anime") {
      genreId = genreMap[genre] || 16;
      endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&with_keywords=210024&sort_by=${sortBy === "newest" ? "first_air_date.desc" : sortParam}&vote_count.gte=20&page=${page}`;
    }

    console.log(`Fetching from: ${endpoint.replace(TMDB_API_KEY, "***")}`);

    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("TMDB API error:", response.status, errorText);
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    const results = data.results?.map((item: any) => ({
      id: `tmdb-${item.id}`,
      tmdbId: item.id,
      title: item.title || item.name,
      year: new Date(item.release_date || item.first_air_date || "").getFullYear() || 0,
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
      rating: Math.round((item.vote_average / 2) * 10) / 10,
      synopsis: item.overview,
      genres: [genre],
      director: "",
      cast: [],
      runtime: 0,
      reviewCount: item.vote_count,
    })).filter((item: any) => item.poster && item.year > 0) || [];

    console.log(`Returning ${results.length} results, page ${page}, total pages: ${data.total_pages}`);

    return new Response(JSON.stringify({ results, totalPages: data.total_pages, currentPage: page }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("TMDB function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
