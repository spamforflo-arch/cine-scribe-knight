import { Link } from "react-router-dom";
import { Heart, MessageSquare } from "lucide-react";
import { reviews, getFilmById } from "@/data/films";
import { StarRating } from "@/components/films/StarRating";

export function RecentActivity() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Recent Reviews
        </h2>
        <Link 
          to="/activity" 
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="grid gap-4">
        {reviews.map((review, index) => {
          const film = getFilmById(review.filmId);
          if (!film) return null;

          return (
            <article
              key={review.id}
              className="group glass rounded-xl p-4 transition-all duration-300 hover:border-primary/30 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-4">
                {/* Film Poster */}
                <Link to={`/film/${film.id}`} className="shrink-0">
                  <div className="w-16 rounded-lg overflow-hidden film-card-shadow transition-transform group-hover:scale-105">
                    <img
                      src={film.poster}
                      alt={film.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </div>
                </Link>

                {/* Review Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium text-foreground">
                          {review.userName}
                        </span>
                        <span className="text-sm text-muted-foreground">reviewed</span>
                      </div>
                      <Link to={`/film/${film.id}`}>
                        <h3 className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors">
                          {film.title}
                          <span className="text-muted-foreground font-normal ml-2">{film.year}</span>
                        </h3>
                      </Link>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {review.content}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Heart className="w-3.5 h-3.5" />
                      {review.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Reply
                    </button>
                    <span>{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
