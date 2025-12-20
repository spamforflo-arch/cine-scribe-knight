import { Link, useNavigate } from "react-router-dom";
import { Star, Heart, Eye, BookOpen, X } from "lucide-react";
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

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleAction = (action: 'watched' | 'liked' | 'watchlist') => {
    triggerHaptic();
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
    // Navigate with state to remember browse position and media type
    navigate(`/film/${film.id}`, { 
      state: { 
        browseState,
        mediaType: film.mediaType || 'movie'
      } 
    });
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
                  <BookOpen className="w-3.5 h-3.5 text-accent-foreground" />
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
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowMenu(false)}
        >
          <div 
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Poster-focused action menu (buttons sit on poster, blurred poster behind) */}
            <div className="relative w-[320px] max-w-[92vw] rounded-3xl overflow-hidden shadow-2xl">
              {film.poster ? (
                <img
                  src={film.poster}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl"
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 bg-secondary" aria-hidden="true" />
              )}
              <div className="absolute inset-0 bg-background/60" aria-hidden="true" />

              <div className="relative p-5">
                <div className="relative mx-auto w-44 sm:w-48 aspect-[2/3] rounded-2xl overflow-hidden film-card-shadow">
                  {film.poster ? (
                    <img
                      src={film.poster}
                      alt={film.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                      <span className="text-muted-foreground">No Poster</span>
                    </div>
                  )}

                  {/* Blur layer on the poster to make actions readable */}
                  <div
                    className="absolute inset-0 bg-background/30 backdrop-blur-md"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent"
                    aria-hidden="true"
                  />

                  {/* Action buttons ON the poster */}
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <button
                      type="button"
                      aria-label={isWatched ? "Remove from watched" : "Add to watched"}
                      onClick={() => handleAction('watched')}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl",
                        "animate-bounce-in animate-pulse-subtle",
                        isWatched
                          ? "bg-primary text-primary-foreground"
                          : "bg-background/80 text-foreground border-2 border-border backdrop-blur-md"
                      )}
                      style={{ animationDelay: '50ms' }}
                    >
                      <Eye className="w-7 h-7" />
                    </button>

                    <button
                      type="button"
                      aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                      onClick={() => handleAction('watchlist')}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl",
                        "animate-bounce-in animate-pulse-subtle",
                        inWatchlist
                          ? "bg-primary text-primary-foreground"
                          : "bg-background/80 text-foreground border-2 border-border backdrop-blur-md"
                      )}
                      style={{ animationDelay: '100ms' }}
                    >
                      <BookOpen className="w-7 h-7" />
                    </button>
                  </div>
                </div>

                {/* Film Title */}
                <p className="text-center font-display text-lg font-semibold text-foreground max-w-[280px] truncate mt-5 mx-auto">
                  {film.title}
                </p>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  {film.year}
                </p>

                {/* Tap to close hint */}
                <p className="text-center text-xs text-muted-foreground/60 mt-4">
                  Tap anywhere to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
