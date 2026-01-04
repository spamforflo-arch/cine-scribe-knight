import { useState, useEffect } from "react";
import { Play, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getContinueWatching, WatchProgress } from "@/lib/watchProgress";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ContinueWatchingSheetProps {
  trigger?: React.ReactNode;
}

export function ContinueWatchingSheet({ trigger }: ContinueWatchingSheetProps) {
  const [items, setItems] = useState<WatchProgress[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setItems(getContinueWatching());
    }
  }, [open]);

  if (items.length === 0 && !open) {
    // Check if there are items before showing trigger
    const checkItems = getContinueWatching();
    if (checkItems.length === 0) return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="glass" size="sm" className="gap-2">
            <Play className="w-4 h-4" />
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item) => (
                <Link
                  key={`${item.tmdbId}-${item.season}-${item.episode}`}
                  to={`/film/tmdb-${item.tmdbId}`}
                  state={{ 
                    mediaType: item.mediaType,
                    autoPlay: true,
                    season: item.season,
                    episode: item.episode,
                  }}
                  onClick={() => setOpen(false)}
                  className="group"
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                      </div>
                    </div>
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
