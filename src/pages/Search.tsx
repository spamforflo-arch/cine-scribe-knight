import { useState } from "react";
import { Search as SearchIcon, X, Film, ListVideo } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { films, userLists } from "@/data/films";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

const categories = [
  { id: "all", label: "All", icon: SearchIcon },
  { id: "films", label: "Films", icon: Film },
  { id: "lists", label: "Lists", icon: ListVideo },
];

const Search = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFilms = films.filter(film => 
    film.title.toLowerCase().includes(query.toLowerCase()) ||
    film.director.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLists = userLists.filter(list =>
    list.name.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = filteredFilms.length > 0 || filteredLists.length > 0;

  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main className="pt-24 pb-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Search Header */}
          <div className="space-y-5 mb-8 animate-fade-in">
            <h1 className="font-display text-4xl font-bold text-foreground text-center">
              Search
            </h1>

            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search films, lists..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-12 h-14 text-base bg-secondary border-border rounded-2xl"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors click-scale"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex justify-center gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all click-bounce",
                      activeCategory === cat.id
                        ? "bg-peach-gradient text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          {query && (
            <div className="space-y-8 animate-fade-in">
              {/* Films */}
              {(activeCategory === "all" || activeCategory === "films") && filteredFilms.length > 0 && (
                <section>
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Films
                  </h2>
                  <div className="space-y-2">
                    {filteredFilms.map((film, index) => (
                      <Link
                        key={film.id}
                        to={`/film/${film.id}`}
                        className="flex items-center gap-4 p-3 rounded-2xl glass hover:border-primary/30 transition-all click-bounce animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <img
                          src={film.poster}
                          alt={film.title}
                          className="w-12 h-16 object-cover rounded-xl"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {film.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {film.year} • {film.director}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="w-4 h-4 fill-primary" />
                          <span className="text-sm font-bold">{film.rating.toFixed(1)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Lists */}
              {(activeCategory === "all" || activeCategory === "lists") && filteredLists.length > 0 && (
                <section>
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ListVideo className="w-5 h-5 text-primary" />
                    Lists
                  </h2>
                  <div className="space-y-2">
                    {filteredLists.map((list, index) => (
                      <Link
                        key={list.id}
                        to={`/list/${list.id}`}
                        className="flex items-center gap-4 p-3 rounded-2xl glass hover:border-primary/30 transition-all click-bounce animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-peach-gradient flex items-center justify-center">
                          <ListVideo className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {list.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {list.filmIds.length} films • by {list.createdBy}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* No Results */}
              {!hasResults && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                    No results found
                  </h2>
                  <p className="text-muted-foreground">
                    Try different keywords
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!query && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">
                Start typing to search
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
