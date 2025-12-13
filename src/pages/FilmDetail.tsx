import { useParams, Link } from "react-router-dom";
import { Heart, Eye, Plus, Clock, Star, ChevronLeft, Play, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/films/StarRating";
import { FilmCard } from "@/components/films/FilmCard";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
  const [film, setFilm] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Extract TMDB ID from the id parameter (format: tmdb-123456)
        const tmdbId = id.startsWith('tmdb-') ? id.replace('tmdb-', '') : id;
        
        const { data, error: fetchError } = await supabase.functions.invoke('tmdb', {
          body: { action: 'getMovieDetail', movieId: tmdbId }
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
          <Link to="/browse">
            <Button variant="blue">Back to Browse</Button>
          </Link>
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
        <Link 
          to="/browse" 
          className="absolute top-24 left-4 md:left-8 z-10"
        >
          <Button variant="glass" size="sm" className="gap-2 click-scale">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
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
                onClick={() => setIsWatched(!isWatched)}
              >
                <Eye className="w-5 h-5" />
                {isWatched ? "Watched" : "Mark Watched"}
              </Button>
              <Button 
                variant={isLiked ? "default" : "glass"} 
                size="lg" 
                className={cn("gap-2 click-bounce", isLiked && "bg-destructive hover:bg-destructive/90")}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button 
                variant={inWatchlist ? "blue" : "glass"} 
                size="lg" 
                className="gap-2 click-bounce"
                onClick={() => setInWatchlist(!inWatchlist)}
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
                onRatingChange={setUserRating}
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