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

// Keywords to filter out adult/porn content
const blockedKeywords = [
  'erotic', 'erotica', 'softcore', 'adult film', 'pornographic', 
  'sex film', 'sexploitation', 'nudity', 'adult entertainment'
];

// Filter results to remove potentially inappropriate content
function filterContent(results: any[]): any[] {
  return results.filter((item: any) => {
    // Filter out adult content
    if (item.adult === true) return false;
    
    // Filter out items with no poster (often low quality or inappropriate)
    if (!item.poster_path) return false;
    
    // Filter out items with suspicious titles
    const title = (item.title || item.name || '').toLowerCase();
    const overview = (item.overview || '').toLowerCase();
    
    for (const keyword of blockedKeywords) {
      if (title.includes(keyword) || overview.includes(keyword)) {
        return false;
      }
    }
    
    // Require some minimum popularity/vote count to filter out obscure content
    if (item.vote_count < 5) return false;
    
    return true;
  });
}

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
    const { action, category, genre, sortBy = "popularity", movieId, page = 1, query } = body;
    
    // Handle search request
    if (action === "search" && query) {
      console.log(`Searching for: ${query}`);
      
      const searchRes = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&page=1`
      );
      
      if (!searchRes.ok) {
        throw new Error(`Search failed: ${searchRes.status}`);
      }
      
      const searchData = await searchRes.json();
      
      const results = filterContent(searchData.results || [])
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, 20)
        .map((item: any) => ({
          id: `tmdb-${item.id}`,
          tmdbId: item.id,
          title: item.title || item.name,
          year: new Date(item.release_date || item.first_air_date || "").getFullYear() || 0,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          rating: Math.round((item.vote_average / 2) * 10) / 10,
          mediaType: item.media_type,
        }))
        .filter((item: any) => item.year > 0);
      
      console.log(`Found ${results.length} results`);
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
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
      const director = credits.crew?.find((c: any) => c.job === "Director");
      
      const filteredSimilar = filterContent(similar.results || []);
      
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
        director: director ? { id: director.id, name: director.name } : null,
        cast: credits.cast?.slice(0, 10).map((c: any) => ({ id: c.id, name: c.name, character: c.character, profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null })) || [],
        runtime: movie.runtime || 0,
        reviewCount: movie.vote_count,
        trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
        trailerKey: trailer?.key || null,
        mediaType: 'movie',
        similar: filteredSimilar.slice(0, 8).map((item: any) => ({
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

    // Handle TV show detail request
    if (action === "getTVDetail" && movieId) {
      console.log(`Fetching TV detail for ID: ${movieId}`);
      
      const [tvRes, creditsRes, videosRes, similarRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/tv/${movieId}?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/tv/${movieId}/credits?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/tv/${movieId}/videos?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/tv/${movieId}/similar?api_key=${TMDB_API_KEY}&page=1`),
      ]);

      if (!tvRes.ok) {
        throw new Error(`TV show not found: ${tvRes.status}`);
      }

      const [tv, credits, videos, similar] = await Promise.all([
        tvRes.json(),
        creditsRes.json(),
        videosRes.json(),
        similarRes.json(),
      ]);

      const trailer = videos.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
      const creator = tv.created_by?.[0] || null;
      
      const filteredSimilar = filterContent(similar.results || []);
      
      const result = {
        id: `tmdb-${tv.id}`,
        tmdbId: tv.id,
        title: tv.name,
        year: new Date(tv.first_air_date || "").getFullYear() || 0,
        poster: tv.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : null,
        backdrop: tv.backdrop_path ? `https://image.tmdb.org/t/p/original${tv.backdrop_path}` : null,
        rating: Math.round((tv.vote_average / 2) * 10) / 10,
        synopsis: tv.overview,
        genres: tv.genres?.map((g: any) => g.name) || [],
        director: creator ? { id: creator.id, name: creator.name } : null,
        cast: credits.cast?.slice(0, 10).map((c: any) => ({ id: c.id, name: c.name, character: c.character, profile: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null })) || [],
        runtime: tv.episode_run_time?.[0] || 0,
        reviewCount: tv.vote_count,
        trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
        trailerKey: trailer?.key || null,
        mediaType: 'tv',
        seasons: tv.number_of_seasons || 0,
        episodes: tv.number_of_episodes || 0,
        similar: filteredSimilar.slice(0, 8).map((item: any) => ({
          id: `tmdb-${item.id}`,
          tmdbId: item.id,
          title: item.name,
          year: new Date(item.first_air_date || "").getFullYear() || 0,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          rating: Math.round((item.vote_average / 2) * 10) / 10,
          mediaType: 'tv',
        })).filter((item: any) => item.poster) || [],
      };

      console.log(`Returning TV detail for: ${result.title}`);
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle season episodes request
    if (action === "getSeasonEpisodes" && body.tvId && body.seasonNumber) {
      const { tvId, seasonNumber } = body;
      console.log(`Fetching episodes for TV ${tvId} Season ${seasonNumber}`);
      
      const seasonRes = await fetch(
        `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
      );

      if (!seasonRes.ok) {
        throw new Error(`Season not found: ${seasonRes.status}`);
      }

      const seasonData = await seasonRes.json();
      
      const episodes = (seasonData.episodes || []).map((ep: any) => ({
        id: ep.id,
        episode_number: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        still_path: ep.still_path,
        air_date: ep.air_date,
        runtime: ep.runtime,
      }));

      console.log(`Returning ${episodes.length} episodes`);
      return new Response(JSON.stringify({ episodes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle person detail + filmography request
    if (action === "getPersonDetail" && body.personId) {
      const personId = body.personId;
      console.log(`Fetching person detail for ID: ${personId}`);

      const [personRes, creditsRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/person/${personId}/combined_credits?api_key=${TMDB_API_KEY}`),
      ]);

      if (!personRes.ok) {
        throw new Error(`Person not found: ${personRes.status}`);
      }

      const person = await personRes.json();
      const credits = creditsRes.ok ? await creditsRes.json() : { cast: [], crew: [] };

      const merged: any[] = [...(credits.cast || []), ...(credits.crew || [])]
        .filter((item: any) => item && (item.media_type === "movie" || item.media_type === "tv"))
        .filter((item: any) => {
          if (item.adult === true) return false;
          if (!item.poster_path) return false;

          const title = (item.title || item.name || '').toLowerCase();
          const overview = (item.overview || '').toLowerCase();
          for (const keyword of blockedKeywords) {
            if (title.includes(keyword) || overview.includes(keyword)) return false;
          }
          return true;
        });

      // de-dupe by media_type + id (cast/crew can overlap)
      const byKey = new Map<string, any>();
      for (const item of merged) {
        const k = `${item.media_type}-${item.id}`;
        if (!byKey.has(k)) byKey.set(k, item);
      }

      const filmography = Array.from(byKey.values())
        .map((item: any) => ({
          id: `tmdb-${item.id}`,
          tmdbId: item.id,
          title: item.title || item.name,
          year: new Date(item.release_date || item.first_air_date || "").getFullYear() || 0,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          rating: Math.round((item.vote_average / 2) * 10) / 10,
          mediaType: item.media_type,
        }))
        .filter((i: any) => i.year > 0)
        .sort((a: any, b: any) => b.year - a.year);

      const result = {
        person: {
          id: person.id,
          name: person.name,
          profile: person.profile_path ? `https://image.tmdb.org/t/p/w300${person.profile_path}` : null,
          biography: person.biography || "",
          department: person.known_for_department || "",
        },
        filmography,
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle discover/browse request - include all languages
    const { language } = body;
    console.log(`Fetching ${category} with genre ${genre || 'all'}, sort: ${sortBy}, page: ${page}, language: ${language || 'all'}`);

    let endpoint = "";
    let sortParam = "popularity.desc";

    // Handle trending vs other sort options
    if (sortBy === "trending") {
      // Use trending endpoint for trending sort
      const mediaType = category === "films" ? "movie" : "tv";
      const langParam = language ? `&language=${language}` : '';
      
      if (category === "anime") {
        // For anime, we still need discover to filter by origin country
        sortParam = "popularity.desc";
      } else {
        const trendingEndpoint = `${TMDB_BASE_URL}/trending/${mediaType}/week?api_key=${TMDB_API_KEY}&page=${page}${langParam}`;
        console.log(`Fetching trending from: ${trendingEndpoint.replace(TMDB_API_KEY, "***")}`);
        
        const response = await fetch(trendingEndpoint);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("TMDB API error:", response.status, errorText);
          throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();
        
        let filteredResults = filterContent(data.results || []);
        
        // Apply language filter if specified
        if (language) {
          filteredResults = filteredResults.filter((item: any) => item.original_language === language);
        }
        
        // Apply genre filter if specified
        if (genre) {
          const genreId = category === "films" ? genreMap[genre] : tvGenreMap[genre];
          if (genreId) {
            filteredResults = filteredResults.filter((item: any) => 
              item.genre_ids?.includes(genreId)
            );
          }
        }
        
        const results = filteredResults.map((item: any) => ({
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
          mediaType: category === 'films' ? 'movie' : category === 'anime' ? 'anime' : 'tv',
        })).filter((item: any) => item.year > 0) || [];

        console.log(`Returning ${results.length} trending results, page ${page}, total pages: ${data.total_pages}`);

        return new Response(JSON.stringify({ results, totalPages: data.total_pages, currentPage: page }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (sortBy === "newest") {
      sortParam = "primary_release_date.desc";
    } else if (sortBy === "rating") {
      sortParam = "vote_average.desc";
    }

    // Build language filter
    const langFilter = language ? `&with_original_language=${language}` : '';

    // Build endpoint - genre is optional
    if (category === "films") {
      const genreId = genre ? genreMap[genre] : undefined;
      const genreFilter = genreId ? `&with_genres=${genreId}` : '';
      endpoint = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}${genreFilter}&without_genres=99&sort_by=${sortParam}&vote_count.gte=5&page=${page}&include_adult=false${langFilter}`;
    } else if (category === "tv") {
      const genreId = genre ? tvGenreMap[genre] : undefined;
      const genreFilter = genreId ? `&with_genres=${genreId}` : '';
      const tvSortParam = sortBy === "newest" ? "first_air_date.desc" : sortParam;
      endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}${genreFilter}&sort_by=${tvSortParam}&vote_count.gte=5&page=${page}&include_adult=false${langFilter}`;
    } else if (category === "anime") {
      // For anime, always use Animation genre (16) with origin_country=JP
      const tvAnimeGenreId = genre ? tvGenreMap[genre] : undefined;
      const tvSortParam = sortBy === "newest" ? "first_air_date.desc" : sortParam;
      
      if (!genre || genre === "Animation") {
        endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_origin_country=JP&sort_by=${tvSortParam}&vote_count.gte=5&page=${page}&include_adult=false`;
      } else {
        // For other genres, search for Japanese animation with that genre
        endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16,${tvAnimeGenreId}&with_origin_country=JP&sort_by=${tvSortParam}&vote_count.gte=5&page=${page}&include_adult=false`;
      }
    }

    console.log(`Fetching from: ${endpoint.replace(TMDB_API_KEY, "***")}`);

    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("TMDB API error:", response.status, errorText);
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter and map results
    const filteredResults = filterContent(data.results || []);
    
    const results = filteredResults.map((item: any) => ({
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
      mediaType: category === 'films' ? 'movie' : category === 'anime' ? 'anime' : 'tv',
    })).filter((item: any) => item.year > 0) || [];

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
