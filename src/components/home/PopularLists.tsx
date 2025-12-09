import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { userLists, getFilmById } from "@/data/films";

export function PopularLists() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Popular Lists
        </h2>
        <Link 
          to="/lists" 
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Browse all
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {userLists.map((list, index) => {
          const previewFilms = list.filmIds.slice(0, 5).map(id => getFilmById(id)).filter(Boolean);

          return (
            <Link
              key={list.id}
              to={`/list/${list.id}`}
              className="group glass rounded-xl p-4 transition-all duration-300 hover:border-primary/30 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Film Previews */}
              <div className="flex -space-x-8 mb-4">
                {previewFilms.map((film, idx) => (
                  <div
                    key={film!.id}
                    className="relative w-20 rounded-lg overflow-hidden film-card-shadow transition-transform duration-300"
                    style={{ 
                      zIndex: previewFilms.length - idx,
                      transform: `translateY(${idx * 2}px)`,
                    }}
                  >
                    <img
                      src={film!.poster}
                      alt={film!.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </div>
                ))}
                {list.filmIds.length > 5 && (
                  <div 
                    className="relative w-20 rounded-lg overflow-hidden bg-secondary flex items-center justify-center"
                    style={{ zIndex: 0 }}
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      +{list.filmIds.length - 5}
                    </span>
                  </div>
                )}
              </div>

              {/* List Info */}
              <div className="space-y-1">
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {list.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {list.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    by {list.createdBy}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="w-3.5 h-3.5" />
                    {list.likes}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
