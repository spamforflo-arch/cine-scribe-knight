import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";

interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const gapClasses = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5",
  };

  const displayRating = hoverRating ?? rating;

  // Handle mouse/touch position to calculate half-star ratings
  const calculateRating = useCallback((e: React.MouseEvent, starIndex: number) => {
    const starElement = (e.target as HTMLElement).closest('button');
    if (!starElement) return starIndex + 1;
    
    const rect = starElement.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const isHalf = relativeX < rect.width / 2;
    
    return isHalf ? starIndex + 0.5 : starIndex + 1;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent, starIndex: number) => {
    if (!interactive) return;
    const newRating = calculateRating(e, starIndex);
    setHoverRating(newRating);
  }, [interactive, calculateRating]);

  const handleClick = useCallback((e: React.MouseEvent, starIndex: number) => {
    if (!interactive) return;
    const newRating = calculateRating(e, starIndex);
    onRatingChange?.(newRating);
  }, [interactive, calculateRating, onRatingChange]);

  return (
    <div ref={containerRef} className={cn("flex items-center", gapClasses[size])}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFull = starValue <= displayRating;
        const isHalf = !isFull && starValue - 0.5 <= displayRating && starValue > displayRating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            className={cn(
              "relative transition-all duration-200 click-scale",
              interactive && "hover:scale-125 cursor-pointer",
              !interactive && "cursor-default"
            )}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            onClick={(e) => handleClick(e, index)}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(
                sizeClasses[size],
                "transition-all duration-200 text-muted-foreground/40"
              )}
            />
            {/* Filled portion */}
            <div 
              className="absolute inset-0 overflow-hidden transition-all duration-200"
              style={{ width: isFull ? '100%' : isHalf ? '50%' : '0%' }}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "fill-primary text-primary drop-shadow-[0_0_8px_hsl(20_90%_65%/0.5)]"
                )}
              />
            </div>
          </button>
        );
      })}
      {/* Rating display */}
      {interactive && displayRating > 0 && (
        <span className="ml-2 text-sm font-medium text-foreground min-w-[2rem]">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
