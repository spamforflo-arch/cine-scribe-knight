import { Link } from "react-router-dom";
import { Star, Heart, Eye, Plus, X } from "lucide-react";
import { Film } from "@/data/films";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";

interface FilmCardProps {
  film: Film;
  size?: "sm" | "md" | "lg";
  showRating?: boolean;
}

export function FilmCard({ film, size = "md", showRating = true }: FilmCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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
      // Haptic feedback on mobile
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

  const handleAction = (action: 'watched' | 'liked' | 'watchlist') => {
    switch (action) {
      case 'watched':
        setIsWatched(!isWatched);
        break;
      case 'liked':
        setIsLiked(!isLiked);
        break;
      case 'watchlist':
        setInWatchlist(!inWatchlist);
        break;
    }
    setShowMenu(false);
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
        <Link 
          to={`/film/${film.id}`}
          onClick={(e) => {
            if (showMenu) {
              e.preventDefault();
            }
          }}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl film-card-shadow transition-all duration-300 click-scale",
              "aspect-[2/3]",
              isHovered && "scale-[1.03] shadow-xl"
            )}
          >
            <img
              src={film.poster}
              alt={film.title}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
            
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
        </Link>

        {/* Title */}
        <div className="mt-2.5 space-y-0.5 px-0.5">
          <Link to={`/film/${film.id}`}>
            <h3 className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors">
              {film.title}
            </h3>
          </Link>
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
              <img
                src={film.poster}
                alt={film.title}
                className="w-32 h-48 object-cover rounded-2xl shadow-2xl mx-auto"
              />
              <button
                onClick={() => setShowMenu(false)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors click-scale"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
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
                onClick={() => handleAction('liked')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all click-bounce",
                  isLiked 
                    ? "bg-destructive text-destructive-foreground" 
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                <span className="text-xs font-medium">Like</span>
              </button>
              
              <button
                onClick={() => handleAction('watchlist')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all click-bounce",
                  inWatchlist 
                    ? "bg-peach-gradient text-primary-foreground" 
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
