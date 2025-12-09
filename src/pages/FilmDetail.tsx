import { useParams, Link } from "react-router-dom";
import { Heart, Eye, Plus, Clock, Star, Calendar, ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/films/StarRating";
import { getFilmById, getReviewsByFilmId, films } from "@/data/films";
import { FilmCard } from "@/components/films/FilmCard";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FilmDetail = () => {
  const { id } = useParams<{ id: string }>();
  const film = getFilmById(id || "");
  const reviews = getReviewsByFilmId(id || "");
  
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
            <Button variant="cinema">Back to Films</Button>
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
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={film.backdrop}
          alt={film.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        
        {/* Back Button */}
        <Link 
          to="/films" 
          className="absolute top-24 left-4 md:left-8 z-10"
        >
          <Button variant="glass" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </section>

      {/* Film Info */}
      <section className="container mx-auto px-4 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0 animate-slide-up">
            <div className="w-64 rounded-xl overflow-hidden film-card-shadow glow">
              <img
                src={film.poster}
                alt={film.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="space-y-2">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                {film.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="text-lg">{film.year}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>Directed by <span className="text-foreground">{film.director}</span></span>
                <span className="text-muted-foreground/50">•</span>
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
                  className="px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-8 h-8 text-primary fill-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{film.rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">{film.reviewCount.toLocaleString()} reviews</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Button 
                variant={isWatched ? "cinema" : "glass"} 
                size="lg" 
                className="gap-2"
                onClick={() => setIsWatched(!isWatched)}
              >
                <Eye className="w-5 h-5" />
                {isWatched ? "Watched" : "Mark as Watched"}
              </Button>
              <Button 
                variant={isLiked ? "default" : "glass"} 
                size="lg" 
                className="gap-2"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button 
                variant={inWatchlist ? "default" : "glass"} 
                size="lg" 
                className="gap-2"
                onClick={() => setInWatchlist(!inWatchlist)}
              >
                <Plus className="w-5 h-5" />
                Watchlist
              </Button>
            </div>

            {/* User Rating */}
            <div className="glass rounded-xl p-4 inline-block">
              <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
              <StarRating 
                rating={userRating} 
                interactive 
                size="lg"
                onRatingChange={setUserRating}
              />
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
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
                    className="px-3 py-1.5 bg-secondary rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
          Recent Reviews
        </h2>
        
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article 
                key={review.id} 
                className="glass rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-foreground">{review.userName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="text-muted-foreground">{review.content}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Heart className="w-4 h-4" />
                    {review.likes}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        )}
      </section>

      {/* Similar Films */}
      {similarFilms.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            Similar Films
          </h2>
          <div className="flex flex-wrap gap-4 md:gap-6">
            {similarFilms.map((film) => (
              <FilmCard key={film.id} film={film} size="md" />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default FilmDetail;
