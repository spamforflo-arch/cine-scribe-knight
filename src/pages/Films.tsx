import { useState } from "react";
import { Search, SlidersHorizontal, Grid, LayoutList } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FilmCard } from "@/components/films/FilmCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { films } from "@/data/films";
import { cn } from "@/lib/utils";

const genres = ["All", "Drama", "Action", "Comedy", "Thriller", "Romance", "History", "Biography"];

const Films = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredFilms = films.filter((film) => {
    const matchesSearch = film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      film.director.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || film.genres.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main className="pt-24 pb-28 md:pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="space-y-4 mb-10 animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Films
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Explore and discover. Hold any poster to add to your collection.
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-4 mb-8">
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search films, directors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-secondary border-border rounded-xl text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="glass" size="icon" className="h-12 w-12">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
                <div className="flex items-center rounded-xl border border-border overflow-hidden bg-secondary/50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-3 transition-all click-scale",
                      viewMode === "grid" ? "bg-peach-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-3 transition-all click-scale",
                      viewMode === "list" ? "bg-peach-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutList className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Genre Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={cn(
                    "shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all click-bounce",
                    selectedGenre === genre
                      ? "bg-peach-gradient text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filteredFilms.length} films
            </p>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredFilms.map((film, index) => (
                  <div
                    key={film.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <FilmCard film={film} size="md" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFilms.map((film, index) => (
                  <div
                    key={film.id}
                    className="glass rounded-2xl p-4 flex gap-4 animate-fade-in hover:border-primary/30 transition-all click-bounce"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <img
                      src={film.poster}
                      alt={film.title}
                      className="w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {film.title}
                        <span className="text-muted-foreground font-normal ml-2">{film.year}</span>
                      </h3>
                      <p className="text-sm text-muted-foreground">Directed by {film.director}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{film.synopsis}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {film.genres.map((genre) => (
                          <span key={genre} className="px-2 py-0.5 bg-secondary rounded-lg text-xs text-muted-foreground">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Films;
