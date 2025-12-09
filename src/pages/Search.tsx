import { useState } from "react";
import { Search as SearchIcon, X, Film, User, ListVideo } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { films, userLists } from "@/data/films";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All", icon: SearchIcon },
  { id: "films", label: "Films", icon: Film },
  { id: "lists", label: "Lists", icon: ListVideo },
  { id: "members", label: "Members", icon: User },
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
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Search Header */}
          <div className="space-y-6 mb-8 animate-fade-in">
            <h1 className="font-display text-4xl font-bold text-foreground text-center">
              Search
            </h1>

            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search films, lists, members..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-12 h-14 text-lg bg-secondary border-border rounded-xl"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
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
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
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
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Films
                  </h2>
                  <div className="space-y-2">
                    {filteredFilms.map((film) => (
                      <Link
                        key={film.id}
                        to={`/film/${film.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl glass hover:border-primary/30 transition-all"
                      >
                        <img
                          src={film.poster}
                          alt={film.title}
                          className="w-12 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {film.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {film.year} • {film.director}
                          </p>
                        </div>
                        <div className="text-sm text-primary font-medium">
                          {film.rating.toFixed(1)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Lists */}
              {(activeCategory === "all" || activeCategory === "lists") && filteredLists.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ListVideo className="w-5 h-5 text-primary" />
                    Lists
                  </h2>
                  <div className="space-y-2">
                    {filteredLists.map((list) => (
                      <Link
                        key={list.id}
                        to={`/list/${list.id}`}
                        className="flex items-center gap-4 p-3 rounded-xl glass hover:border-primary/30 transition-all"
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ListVideo className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
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
                <div className="text-center py-12">
                  <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                    No results found
                  </h2>
                  <p className="text-muted-foreground">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!query && (
            <div className="text-center py-12 animate-fade-in">
              <SearchIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Start typing to search for films, lists, or members
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
