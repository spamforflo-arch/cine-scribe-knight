import { useState } from "react";
import { Play, Trash2, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoungeItem {
  id: string;
  tmdb_id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
  genre: string;
  media_type: string;
  list_id: string | null;
}

interface LoungeCardProps {
  item: LoungeItem;
  onPlay: (item: LoungeItem) => void;
  onDelete: (id: string) => void;
}

export function LoungeCard({ item, onPlay, onDelete }: LoungeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove "${item.title}" from your lounge?`)) {
      onDelete(item.id);
    }
  };

  const getMediaIcon = () => {
    if (item.media_type === 'movie') return <Film className="w-3 h-3" />;
    return <Tv className="w-3 h-3" />;
  };

  const getMediaLabel = () => {
    if (item.media_type === 'anime') return 'Anime';
    if (item.media_type === 'tv') return 'TV';
    return 'Movie';
  };

  return (
    <div
      className="group cursor-pointer w-[120px] sm:w-[140px]"
      onClick={() => onPlay(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster */}
      <div className="relative rounded-xl overflow-hidden film-card-shadow aspect-[2/3] bg-muted">
        {item.poster_url ? (
          <img
            src={item.poster_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            {getMediaIcon()}
          </div>
        )}

        {/* Media Type Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 text-primary-foreground text-[10px] font-medium rounded flex items-center gap-1">
          {getMediaIcon()}
          {getMediaLabel()}
        </div>

        {/* Hover Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 transition-opacity",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <Button variant="blue" size="sm" className="gap-1">
            <Play className="w-4 h-4 fill-current" />
            Play
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 space-y-0.5 px-0.5">
        <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground">
          {item.year || "Unknown year"}
        </p>
      </div>
    </div>
  );
}
