import { useState, useEffect } from "react";
import { Search as SearchIcon, X, Film, Star, Loader2, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type SearchResult = {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  poster: string | null;
  rating: number;
  mediaType: string;
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const searchContent = async () => {
      if (query.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const { data, error } = await supabase.functions.invoke('tmdb', {
          body: { action: 'search', query }
        });

        if (error) throw error;
        setResults(data?.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchContent, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="min-h-screen bg-background grain">
      <main className="pt-8 pb-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Home button */}
          <Link to="/">
            <Button variant="glass" size="sm" className="gap-2 mb-6">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
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
                placeholder="Search movies, TV shows, anime..."
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
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Results */}
          {!isLoading && hasSearched && (
            <div className="space-y-8 animate-fade-in">
              {results.length > 0 ? (
                <section>
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Results
                  </h2>
                  <div className="space-y-2">
                    {results.map((item, index) => (
                      <Link
                        key={item.id}
                        to={`/film/${item.id}`}
                        className="flex items-center gap-4 p-3 rounded-2xl glass hover:border-primary/30 transition-all click-bounce animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        {item.poster ? (
                          <img
                            src={item.poster}
                            alt={item.title}
                            className="w-12 h-16 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-12 h-16 rounded-xl bg-secondary flex items-center justify-center">
                            <Film className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.year} • {item.mediaType === 'tv' ? 'TV Show' : item.mediaType === 'anime' ? 'Anime' : 'Movie'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="w-4 h-4 fill-primary" />
                          <span className="text-sm font-bold">{item.rating.toFixed(1)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : (
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
          {!isLoading && !hasSearched && (
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

    </div>
  );
};

export default Search;
