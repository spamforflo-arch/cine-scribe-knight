import { Film } from "@/data/films";
import { FilmCard } from "./FilmCard";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface FilmGridProps {
  films: Film[];
  title?: string;
  className?: string;
  cardSize?: "sm" | "md" | "lg";
  showViewAll?: boolean;
  viewAllLink?: string;
}

export function FilmGrid({ 
  films, 
  title, 
  className, 
  cardSize = "md",
  showViewAll = false,
  viewAllLink = "/films"
}: FilmGridProps) {
  return (
    <section className={cn("space-y-5", className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {title}
          </h2>
          {showViewAll && (
            <Link 
              to={viewAllLink}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors click-scale"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {films.map((film, index) => (
          <div
            key={film.id}
            className="shrink-0 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <FilmCard film={film} size={cardSize} />
          </div>
        ))}
      </div>
    </section>
  );
}
