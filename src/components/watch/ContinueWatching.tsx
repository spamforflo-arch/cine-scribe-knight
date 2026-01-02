import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { getContinueWatching, WatchProgress } from "@/lib/watchProgress";
import { cn } from "@/lib/utils";

export function ContinueWatching() {
  const [items, setItems] = useState<WatchProgress[]>([]);

  useEffect(() => {
    setItems(getContinueWatching());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-bold text-foreground">
        Continue Watching
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
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
            className="shrink-0 group"
          >
            <div className="relative w-40 rounded-xl overflow-hidden film-card-shadow">
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

              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                </div>
              </div>

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
          </Link>
        ))}
      </div>
    </section>
  );
}
