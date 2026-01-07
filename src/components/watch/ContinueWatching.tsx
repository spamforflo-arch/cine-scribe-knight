import { useState, useEffect, useRef, useCallback } from "react";
import { Play, X, TrendingUp, Clock, Star, History } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getContinueWatching, WatchProgress, removeWatchProgress } from "@/lib/watchProgress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface ContinueWatchingProps {
  variant?: 'section' | 'sheet';
  onRefresh?: () => void;
}

export function ContinueWatching({ variant = 'section', onRefresh }: ContinueWatchingProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<WatchProgress[]>([]);
  const [longPressItem, setLongPressItem] = useState<string | null>(null);
  
  // Long press detection
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const LONG_PRESS_DURATION = 700;
  const MOVE_THRESHOLD = 15;

  useEffect(() => {
    setItems(getContinueWatching());
  }, []);

  const getItemKey = (item: WatchProgress) => 
    `${item.tmdbId}-${item.season || 0}-${item.episode || 0}`;

  const triggerHaptic = useCallback(async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Haptics not available
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent, item: WatchProgress) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    longPressTimer.current = setTimeout(() => {
      triggerHaptic();
      setLongPressItem(getItemKey(item));
    }, LONG_PRESS_DURATION);
  }, [triggerHaptic]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
  }, []);

  const handleRemove = useCallback((item: WatchProgress, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    removeWatchProgress(item.tmdbId, item.season, item.episode);
    setItems(prev => prev.filter(p => getItemKey(p) !== getItemKey(item)));
    setLongPressItem(null);
    triggerHaptic();
    onRefresh?.();
  }, [triggerHaptic, onRefresh]);

  const handlePlay = useCallback((item: WatchProgress) => {
    if (longPressItem) {
      setLongPressItem(null);
      return;
    }
    
    navigate(`/film/tmdb-${item.tmdbId}`, {
      state: {
        mediaType: item.mediaType,
        autoPlay: true,
        season: item.season,
        episode: item.episode,
      }
    });
  }, [longPressItem, navigate]);

  if (items.length === 0) return null;

  const isSheet = variant === 'sheet';

  return (
    <section className="space-y-4">
      {!isSheet && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl blue-gradient flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Continue Watching
            </h2>
          </div>
        </div>
      )}
      
      <div className={cn(
        "flex gap-3 overflow-x-auto pb-4 scrollbar-hide",
        !isSheet && "-mx-4 px-4"
      )}>
        {items.map((item) => {
          const key = getItemKey(item);
          const isLongPressed = longPressItem === key;
          
          return (
            <div
              key={key}
              className="shrink-0 group relative"
              onTouchStart={(e) => handleTouchStart(e, item)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => handlePlay(item)}
            >
              <div className="relative w-36 md:w-40 rounded-xl overflow-hidden film-card-shadow cursor-pointer">
                {/* Poster */}
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No Poster</span>
                  </div>
                )}

                {/* Long press overlay with remove button */}
                {isLongPressed && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center animate-fade-in z-10">
                    <button
                      onClick={(e) => handleRemove(item, e)}
                      className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <X className="w-7 h-7 text-destructive-foreground" />
                    </button>
                  </div>
                )}

                {/* Play overlay (on hover for desktop) */}
                {!isLongPressed && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              {/* Title */}
              <div className="mt-2 px-0.5">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.title}
                </p>
                {item.season && item.episode && (
                  <p className="text-xs text-muted-foreground">
                    S{item.season} E{item.episode}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {longPressItem && (
        <p className="text-xs text-muted-foreground text-center">
          Tap the X to remove from continue watching
        </p>
      )}
    </section>
  );
}
