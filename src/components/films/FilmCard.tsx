import { Link } from "react-router-dom";
import { Star, Heart, Eye, Plus } from "lucide-react";
import { Film } from "@/data/films";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FilmCardProps {
  film: Film;
  size?: "sm" | "md" | "lg";
  showActions?: boolean;
}

export function FilmCard({ film, size = "md", showActions = true }: FilmCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  const sizeClasses = {
    sm: "w-[120px]",
    md: "w-[180px]",
    lg: "w-[220px]",
  };

  const aspectClasses = {
    sm: "aspect-[2/3]",
    md: "aspect-[2/3]",
    lg: "aspect-[2/3]",
  };

  return (
    <div
      className={cn("group relative", sizeClasses[size])}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/film/${film.id}`}>
        <div
          className={cn(
            "relative overflow-hidden rounded-lg film-card-shadow transition-all duration-300",
            aspectClasses[size],
            isHovered && "scale-105 shadow-xl"
          )}
        >
          <img
            src={film.poster}
            alt={film.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 transition-opacity duration-300",
              isHovered && "opacity-100"
            )}
          />

          {/* Rating Badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-xs font-medium text-foreground">{film.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>

      {/* Quick Actions */}
      {showActions && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-2 flex justify-center gap-1 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWatched(!isWatched);
            }}
            className={cn(
              "p-2 rounded-full backdrop-blur-md transition-all duration-200",
              isWatched 
                ? "bg-primary text-primary-foreground" 
                : "bg-card/80 text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className={cn(
              "p-2 rounded-full backdrop-blur-md transition-all duration-200",
              isLiked 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-card/80 text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setInWatchlist(!inWatchlist);
            }}
            className={cn(
              "p-2 rounded-full backdrop-blur-md transition-all duration-200",
              inWatchlist 
                ? "bg-accent text-accent-foreground" 
                : "bg-card/80 text-muted-foreground hover:text-foreground"
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title */}
      <div className="mt-2 space-y-0.5">
        <Link to={`/film/${film.id}`}>
          <h3 className="font-medium text-sm text-foreground truncate hover:text-primary transition-colors">
            {film.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground">{film.year}</p>
      </div>
    </div>
  );
}
