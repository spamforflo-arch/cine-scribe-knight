import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoungeCard } from "./LoungeCard";
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

interface LoungeRowProps {
  title: string;
  items: LoungeItem[];
  onPlay: (item: LoungeItem) => void;
  onDelete: (id: string) => void;
  isCustomList?: boolean;
}

export function LoungeRow({ title, items, onPlay, onDelete, isCustomList }: LoungeRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCustomList && <Star className="w-4 h-4 text-primary fill-primary" />}
          <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
          <span className="text-sm text-muted-foreground">({items.length})</span>
        </div>
        <div className="hidden sm:flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scroll("left")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scroll("right")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <div key={item.id} className="snap-start shrink-0">
            <LoungeCard item={item} onPlay={onPlay} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </div>
  );
}
