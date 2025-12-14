import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Eye, Plus, Clock, Star, ChevronLeft, Play, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/films/StarRating";
import { FilmCard } from "@/components/films/FilmCard";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  isFilmWatched,
  isFilmLiked,
  isFilmInWatchlist,
  addWatchedFilm,
  removeWatchedFilm,
  addLikedFilm,
  removeLikedFilm,
  addWatchlistFilm,
  removeWatchlistFilm,
  updateWatchedFilmRating,
  getWatchedFilms,
} from "@/lib/filmStorage";

interface CastMember {
  name: string;
  character: string;
  profile: string | null;
}

interface SimilarFilm {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  poster: string | null;
  rating: number;
}

interface MovieDetail {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  synopsis: string;
  genres: string[];
  director: string;
  cast: CastMember[];
  runtime: number;
  reviewCount: number;
  trailer: string | null;
  trailerKey: string | null;
  similar: SimilarFilm[];
}

const FilmDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [film, setFilm] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract tmdbId
  const tmdbId = id?.startsWith('tmdb-') ? parseInt(id.replace('tmdb-', '')) : parseInt(id || '0');
  
  const [isLiked, setIsLiked] = useState(() => isFilmLiked(tmdbId));
  const [isWatched, setIsWatched] = useState(() => isFilmWatched(tmdbId));
  const [inWatchlist, setInWatchlist] = useState(() => isFilmInWatchlist(tmdbId));
  const [userRating, setUserRating] = useState<number>(0);
  const [showTrailer, setShowTrailer] = useState(false);

  // Get saved rating
  useEffect(() => {
    const watchedFilms = getWatchedFilms();
    const savedFilm = watchedFilms.find(f => f.tmdbId === tmdbId);
    if (savedFilm?.userRating) {
      setUserRating(savedFilm.userRating);
    }
  }, [tmdbId]);

  // Sync state with localStorage
  useEffect(() => {
    setIsLiked(isFilmLiked(tmdbId));
    setIsWatched(isFilmWatched(tmdbId));
    setInWatchlist(isFilmInWatchlist(tmdbId));
  }, [tmdbId]);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const tmdbIdStr = id.startsWith('tmdb-') ? id.replace('tmdb-', '') : id;
        
        const { data, error: fetchError } = await supabase.functions.invoke('tmdb', {
          body: { action: 'getMovieDetail', movieId: tmdbIdStr }
        });

        if (fetchError) throw fetchError;
        if (data?.result) {
          setFilm(data.result);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [id]);

  const handleBack = () => {
    const browseState = location.state?.browseState;
    if (browseState) {
      navigate('/browse', { state: browseState });
    } else {
      navigate('/browse');
    }
  };

  const filmData = film ? {
    id: film.id,
    tmdbId: film.tmdbId,
    title: film.title,
    year: film.year,
    poster: film.poster,
    rating: film.rating,
  } : null;

  const handleWatchedToggle = () => {
    if (!filmData) return;
    if (isWatched) {
      removeWatchedFilm(filmData.tmdbId);
      setIsWatched(false);
      toast({ description: `Removed "${film?.title}" from watched` });
    } else {
      addWatchedFilm(filmData);
      setIsWatched(true);
      toast({ description: `Added "${film?.title}" to watched` });
    }
  };

  const handleLikedToggle = () => {
    if (!filmData) return;
    if (isLiked) {
      removeLikedFilm(filmData.tmdbId);
      setIsLiked(false);
      toast({ description: `Removed "${film?.title}" from liked` });
    } else {
      addLikedFilm(filmData);
      setIsLiked(true);
      toast({ description: `Added "${film?.title}" to liked` });
    }
  };

  const handleWatchlistToggle = () => {
    if (!filmData) return;
    if (inWatchlist) {
      removeWatchlistFilm(filmData.tmdbId);
      setInWatchlist(false);
      toast({ description: `Removed "${film?.title}" from watchlist` });
    } else {
      addWatchlistFilm(filmData);
      setInWatchlist(true);
      toast({ description: `Added "${film?.title}" to watchlist` });
    }
  };

  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
    if (filmData && isWatched) {
      updateWatchedFilmRating(filmData.tmdbId, rating);
      toast({ description: `Rated "${film?.title}" ${rating} stars` });
    } else if (filmData && !isWatched) {
      // Auto-add to watched when rating
      addWatchedFilm({ ...filmData, userRating: rating });
      setIsWatched(true);
      toast({ description: `Added "${film?.title}" to watched with ${rating} star rating` });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-foreground mb-4">{error || 'Film not found'}</h1>
          <Button variant="blue" onClick={() => navigate('/browse')}>Back to Browse</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Backdrop */}
      <section className="relative h-[55vh] overflow-hidden">
        {film.backdrop ? (
          <img
            src={film.backdrop}
            alt={film.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="absolute top-24 left-4 md:left-8 z-10"
        >
          <Button variant="glass" size="sm" className="gap-2 click-scale">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </button>
      </section>

      {/* Film Info */}
      <section className="container mx-auto px-4 -mt-44 relative z-10 pb-28 md:pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0 animate-slide-up">
            <div className="w-52 md:w-60 rounded-2xl overflow-hidden film-card-shadow blue-glow mx-auto md:mx-0">
              {film.poster ? (
                <img
                  src={film.poster}
                  alt={film.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-secondary flex items-center justify-center">
                  <span className="text-muted-foreground">No Poster</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="space-y-3">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                {film.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                <span className="text-lg font-medium text-foreground">{film.year}</span>
                {film.director && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span>{film.director}</span>
                  </>
                )}
                {film.runtime > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.floor(film.runtime / 60)}h {film.runtime % 60}m
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {film.genres.map((genre) => (
                <span 
                  key={genre} 
                  className="px-3.5 py-1.5 bg-secondary rounded-xl text-sm font-medium text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 blue-gradient rounded-xl px-4 py-2">
                <Star className="w-6 h-6 text-white fill-white" />
                <span className="text-2xl font-bold text-white">{film.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {film.reviewCount.toLocaleString()} ratings
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {film.trailerKey && (
                <Button 
                  variant="blue" 
                  size="lg" 
                  className="gap-2 click-bounce"
                  onClick={() => setShowTrailer(true)}
                >
                  <Play className="w-5 h-5" />
                  Watch Trailer
                </Button>
              )}
              <Button 
                variant={isWatched ? "blue" : "glass"} 
                size="lg" 
                className="gap-2 click-bounce"
                onClick={handleWatchedToggle}
              >
                <Eye className="w-5 h-5" />
                {isWatched ? "Watched" : "Mark Watched"}
              </Button>
              <Button 
                variant={isLiked ? "default" : "glass"} 
                size="lg" 
                className={cn("gap-2 click-bounce", isLiked && "bg-destructive hover:bg-destructive/90")}
                onClick={handleLikedToggle}
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                {isLiked ? "Loved" : "Love"}
              </Button>
              <Button 
                variant={inWatchlist ? "blue" : "glass"} 
                size="lg" 
                className="gap-2 click-bounce"
                onClick={handleWatchlistToggle}
              >
                <Plus className="w-5 h-5" />
                Watchlist
              </Button>
            </div>

            {/* User Rating */}
            <div className="glass rounded-2xl p-5 inline-block">
              <p className="text-sm text-muted-foreground mb-3 font-medium">Your Rating</p>
              <StarRating 
                rating={userRating} 
                interactive 
                size="lg"
                onRatingChange={handleRatingChange}
              />
            </div>

            {/* Synopsis */}
            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed">
                {film.synopsis || 'No synopsis available.'}
              </p>
            </div>

            {/* Cast */}
            {film.cast.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-display text-xl font-semibold text-foreground">Cast</h2>
                <div className="flex flex-wrap gap-3">
                  {film.cast.map((actor) => (
                    <div 
                      key={actor.name} 
                      className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-xl hover:bg-primary/10 transition-colors"
                    >
                      {actor.profile ? (
                        <img src={actor.profile} alt={actor.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                          {actor.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{actor.name}</p>
                        <p className="text-xs text-muted-foreground">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trailer Modal */}
        {showTrailer && film.trailerKey && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowTrailer(false)}
          >
            <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={`https://www.youtube.com/embed/${film.trailerKey}?autoplay=1`}
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Similar Films */}
        {film.similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Similar Films
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {film.similar.map((similarFilm) => (
                <Link key={similarFilm.id} to={`/film/${similarFilm.id}`}>
                  <div className="group cursor-pointer">
                    <div className="rounded-xl overflow-hidden film-card-shadow transition-transform group-hover:scale-105">
                      <img
                        src={similarFilm.poster || ''}
                        alt={similarFilm.title}
                        className="w-full aspect-[2/3] object-cover"
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground truncate">{similarFilm.title}</p>
                    <p className="text-xs text-muted-foreground">{similarFilm.year}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default FilmDetail;
