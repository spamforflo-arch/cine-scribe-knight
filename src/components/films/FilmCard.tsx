import { Link, useNavigate } from "react-router-dom";
import { Star, Heart, Eye, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import { 
  isFilmWatched, 
  isFilmLiked, 
  isFilmInWatchlist,
  addWatchedFilm,
  removeWatchedFilm,
  addLikedFilm,
  removeLikedFilm,
  addWatchlistFilm,
  removeWatchlistFilm
} from "@/lib/filmStorage";
import { useToast } from "@/hooks/use-toast";

interface FilmCardProps {
  film: {
    id: string;
    tmdbId?: number;
    title: string;
    year: number;
    poster: string | null;
    rating: number;
    mediaType?: 'movie' | 'tv' | 'anime';
  };
  size?: "sm" | "md" | "lg";
  showRating?: boolean;
  browseState?: { category: string; genre: string };
}

export function FilmCard({ film, size = "md", showRating = true, browseState }: FilmCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Extract tmdbId from id if not provided
  const tmdbId = film.tmdbId || parseInt(film.id.replace('tmdb-', ''));
  
  const [isLiked, setIsLiked] = useState(() => isFilmLiked(tmdbId));
  const [isWatched, setIsWatched] = useState(() => isFilmWatched(tmdbId));
  const [inWatchlist, setInWatchlist] = useState(() => isFilmInWatchlist(tmdbId));
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Sync state with localStorage
  useEffect(() => {
    setIsLiked(isFilmLiked(tmdbId));
    setIsWatched(isFilmWatched(tmdbId));
    setInWatchlist(isFilmInWatchlist(tmdbId));
  }, [tmdbId]);

  const sizeClasses = {
    sm: "w-[100px]",
    md: "w-[140px] sm:w-[160px]",
    lg: "w-[180px] sm:w-[200px]",
  };

  const handleLongPressStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const filmData = {
    id: film.id,
    tmdbId,
    title: film.title,
    year: film.year,
    poster: film.poster,
    rating: film.rating,
    mediaType: film.mediaType,
  };

  const handleAction = (action: 'watched' | 'liked' | 'watchlist') => {
    switch (action) {
      case 'watched':
        if (isWatched) {
          removeWatchedFilm(tmdbId);
          setIsWatched(false);
          toast({ description: `Removed "${film.title}" from watched` });
        } else {
          addWatchedFilm(filmData);
          setIsWatched(true);
          toast({ description: `Added "${film.title}" to watched` });
        }
        break;
      case 'liked':
        if (isLiked) {
          removeLikedFilm(tmdbId);
          setIsLiked(false);
          toast({ description: `Removed "${film.title}" from liked` });
        } else {
          addLikedFilm(filmData);
          setIsLiked(true);
          toast({ description: `Added "${film.title}" to liked` });
        }
        break;
      case 'watchlist':
        if (inWatchlist) {
          removeWatchlistFilm(tmdbId);
          setInWatchlist(false);
          toast({ description: `Removed "${film.title}" from watchlist` });
        } else {
          addWatchlistFilm(filmData);
          setInWatchlist(true);
          toast({ description: `Added "${film.title}" to watchlist` });
        }
        break;
    }
    setShowMenu(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (showMenu) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    // Navigate with state to remember browse position
    navigate(`/film/${film.id}`, { state: { browseState } });
  };

  return (
    <>
      <div
        ref={cardRef}
        className={cn("group relative select-none", sizeClasses[size])}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleLongPressEnd();
        }}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div 
          onClick={handleClick}
          className="cursor-pointer"
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl film-card-shadow transition-all duration-300 click-scale",
              "aspect-[2/3]",
              isHovered && "scale-[1.03] shadow-xl"
            )}
          >
            {film.poster ? (
              <img
                src={film.poster}
                alt={film.title}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <span className="text-muted-foreground text-xs">No Poster</span>
              </div>
            )}
            
            {/* Gradient Overlay on Hover */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300",
                isHovered && "opacity-100"
              )}
            />

            {/* Status Indicators */}
            <div className="absolute top-2 left-2 flex gap-1.5">
              {isWatched && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-pop-in">
                  <Eye className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              {isLiked && (
                <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center animate-pop-in">
                  <Heart className="w-3.5 h-3.5 text-destructive-foreground fill-current" />
                </div>
              )}
              {inWatchlist && (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center animate-pop-in">
                  <Plus className="w-3.5 h-3.5 text-accent-foreground" />
                </div>
              )}
            </div>

            {/* Rating Badge */}
            {showRating && (
              <div className={cn(
                "absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300",
                isHovered && "bg-primary text-primary-foreground"
              )}>
                <Star className={cn(
                  "w-3 h-3",
                  isHovered ? "fill-primary-foreground text-primary-foreground" : "fill-primary text-primary"
                )} />
                <span className="text-xs font-bold">{film.rating.toFixed(1)}</span>
              </div>
            )}

            {/* Long Press Hint */}
            <div
              className={cn(
                "absolute bottom-2 left-2 right-2 text-center transition-all duration-300",
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}
            >
              <span className="text-[10px] text-foreground/70 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-full">
                Hold to add
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mt-2.5 space-y-0.5 px-0.5">
          <div onClick={handleClick} className="cursor-pointer">
            <h3 className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors">
              {film.title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">{film.year}</p>
        </div>
      </div>

      {/* Long Press Menu Overlay */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowMenu(false)}
        >
          <div 
            className="absolute animate-pop-in"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Film Preview */}
            <div className="relative mb-4">
              {film.poster ? (
                <img
                  src={film.poster}
                  alt={film.title}
                  className="w-32 h-48 object-cover rounded-2xl shadow-2xl mx-auto"
                />
              ) : (
                <div className="w-32 h-48 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
                  <span className="text-muted-foreground">No Poster</span>
                </div>
              )}
              <button
                onClick={() => setShowMenu(false)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors click-scale"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions - Love, Watched, Watchlist */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleAction('liked')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all click-bounce",
                  isLiked 
                    ? "bg-destructive text-destructive-foreground" 
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                <span className="text-xs font-medium">Love</span>
              </button>
              
              <button
                onClick={() => handleAction('watched')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all click-bounce",
                  isWatched 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="w-6 h-6" />
                <span className="text-xs font-medium">Watched</span>
              </button>
              
              <button
                onClick={() => handleAction('watchlist')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all click-bounce",
                  inWatchlist 
                    ? "blue-gradient text-primary-foreground" 
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-medium">Watchlist</span>
              </button>
            </div>

            {/* Film Title */}
            <p className="text-center mt-4 font-display text-lg font-semibold text-foreground">
              {film.title}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
