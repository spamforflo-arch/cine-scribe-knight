import { useState, useEffect, useRef, useCallback } from "react";
import { Play, X, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getContinueWatching, WatchProgress, removeWatchProgress } from "@/lib/watchProgress";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface ContinueWatchingSheetProps {
  trigger?: React.ReactNode;
}

export function ContinueWatchingSheet({ trigger }: ContinueWatchingSheetProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<WatchProgress[]>([]);
  const [open, setOpen] = useState(false);
  const [longPressItem, setLongPressItem] = useState<string | null>(null);
  
  // Long press detection
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const LONG_PRESS_DURATION = 700;
  const MOVE_THRESHOLD = 15;

  useEffect(() => {
    if (open) {
      setItems(getContinueWatching());
      setLongPressItem(null);
    }
  }, [open]);

  if (items.length === 0 && !open) {
    const checkItems = getContinueWatching();
    if (checkItems.length === 0) return null;
  }

  const getItemKey = (item: WatchProgress) => 
    `${item.tmdbId}-${item.season || 0}-${item.episode || 0}`;

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Haptics not available
    }
  };

  const handleTouchStart = (e: React.TouchEvent, item: WatchProgress) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    longPressTimer.current = setTimeout(() => {
      triggerHaptic();
      setLongPressItem(getItemKey(item));
    }, LONG_PRESS_DURATION);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
  };

  const handleRemove = (item: WatchProgress, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    removeWatchProgress(item.tmdbId, item.season, item.episode);
    setItems(prev => prev.filter(p => getItemKey(p) !== getItemKey(item)));
    setLongPressItem(null);
    triggerHaptic();
  };

  const handlePlay = (item: WatchProgress) => {
    if (longPressItem) {
      setLongPressItem(null);
      return;
    }
    
    setOpen(false);
    navigate(`/film/tmdb-${item.tmdbId}`, {
      state: {
        mediaType: item.mediaType,
        autoPlay: true,
        season: item.season,
        episode: item.episode,
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="glass" size="sm" className="gap-2">
            <History className="w-4 h-4" />
            Continue
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] bg-background border-border">
        <SheetHeader>
          <SheetTitle className="font-display text-xl font-bold text-foreground">
            Continue Watching
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 overflow-y-auto max-h-[calc(70vh-100px)]">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No content to continue watching</p>
              <p className="text-sm mt-2">Start watching something to see it here!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((item) => {
                  const key = getItemKey(item);
                  const isLongPressed = longPressItem === key;
                  
                  return (
                    <div
                      key={key}
                      className="group cursor-pointer"
                      onTouchStart={(e) => handleTouchStart(e, item)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onClick={() => handlePlay(item)}
                    >
                      <div className="relative rounded-xl overflow-hidden film-card-shadow">
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
                        
                        {!isLongPressed && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                              <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 px-0.5">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </p>
                        {item.season && item.episode && (
                          <p className="text-xs text-muted-foreground">
                            S{item.season} E{item.episode}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {Math.round(item.progress)}% watched
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {longPressItem && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Tap the X to remove from continue watching
                </p>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
