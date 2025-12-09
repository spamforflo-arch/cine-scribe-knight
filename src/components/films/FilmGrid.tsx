import { Film } from "@/data/films";
import { FilmCard } from "./FilmCard";
import { cn } from "@/lib/utils";

interface FilmGridProps {
  films: Film[];
  title?: string;
  className?: string;
  cardSize?: "sm" | "md" | "lg";
}

export function FilmGrid({ films, title, className, cardSize = "md" }: FilmGridProps) {
  return (
    <section className={cn("space-y-6", className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {title}
          </h2>
        </div>
      )}
      <div className="flex flex-wrap gap-4 md:gap-6">
        {films.map((film, index) => (
          <div
            key={film.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <FilmCard film={film} size={cardSize} />
          </div>
        ))}
      </div>
    </section>
  );
}
