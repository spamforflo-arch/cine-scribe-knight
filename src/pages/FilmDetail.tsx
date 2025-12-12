import { useParams, Link } from "react-router-dom";
import { Heart, Eye, Plus, Clock, Star, ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/films/StarRating";
import { getFilmById, films } from "@/data/films";
import { FilmCard } from "@/components/films/FilmCard";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FilmDetail = () => {
  const { id } = useParams<{ id: string }>();
  const film = getFilmById(id || "");
  
  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);

  if (!film) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-foreground mb-4">Film not found</h1>
          <Link to="/films">
            <Button variant="blue">Back to Films</Button>
          </Link>
        </div>
      </div>
    );
  }

  const similarFilms = films.filter(f => 
    f.id !== film.id && f.genres.some(g => film.genres.includes(g))
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Backdrop */}
      <section className="relative h-[55vh] overflow-hidden">
        <img
          src={film.backdrop}
          alt={film.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        
        {/* Back Button */}
        <Link 
          to="/films" 
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
              <img
                src={film.poster}
                alt={film.title}
                className="w-full aspect-[2/3] object-cover"
              />
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
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                <span>{film.director}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(film.runtime / 60)}h {film.runtime % 60}m
                </span>
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
                {film.synopsis}
              </p>
            </div>

            {/* Cast */}
            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Cast</h2>
              <div className="flex flex-wrap gap-2">
                {film.cast.map((actor) => (
                  <span 
                    key={actor} 
                    className="px-4 py-2 bg-secondary rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer click-scale"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Films */}
        {similarFilms.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Similar Films
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {similarFilms.map((film) => (
                <div key={film.id} className="shrink-0">
                  <FilmCard film={film} size="md" />
                </div>
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
