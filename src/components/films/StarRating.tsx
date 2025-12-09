import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const displayRating = hoverRating ?? rating;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;
        const isHalfFilled = starValue - 0.5 === displayRating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            className={cn(
              "relative transition-transform duration-150",
              interactive && "hover:scale-110 cursor-pointer",
              !interactive && "cursor-default"
            )}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            onClick={() => interactive && onRatingChange?.(starValue)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-150",
                isFilled
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
