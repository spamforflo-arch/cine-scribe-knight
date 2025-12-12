import { useState, useEffect } from "react";
import { Film, Tv, Sparkles, ChevronLeft, TrendingUp, Clock, Star } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FilmCard } from "@/components/films/FilmCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "films", label: "Films", icon: Film },
  { id: "tv", label: "TV Shows", icon: Tv },
  { id: "anime", label: "Anime", icon: Sparkles },
];

const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Horror", 
  "Romance", "Sci-Fi", "Thriller", "Fantasy", "Animation",
  "Mystery", "Crime", "Documentary"
];

const sortOptions = [
  { id: "popularity", label: "Popular", icon: TrendingUp },
  { id: "newest", label: "Newest", icon: Clock },
  { id: "rating", label: "Top Rated", icon: Star },
];

type ContentItem = {
  id: string;
  title: string;
  year: number;
  poster: string;
  rating: number;
  genres: string[];
  synopsis: string;
  director: string;
  cast: string[];
  runtime: number;
  reviewCount: number;
};

const Browse = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("popularity");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBack = () => {
    if (selectedGenre) {
      setSelectedGenre(null);
      setContent([]);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  useEffect(() => {
    if (selectedCategory && selectedGenre) {
      fetchContent();
    }
  }, [selectedCategory, selectedGenre, sortBy]);

  const fetchContent = async () => {
    if (!selectedCategory || !selectedGenre) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tmdb', {
        body: { category: selectedCategory, genre: selectedGenre, sortBy }
      });

      if (error) throw error;
      
      setContent(data?.results || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error loading content",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          {(selectedCategory || selectedGenre) && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 click-scale transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {/* Category Selection */}
          {!selectedCategory && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-4">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  What do you want to watch?
                </h1>
                <p className="text-muted-foreground">Choose a category to explore</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
                {categories.map((cat, index) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="group glass rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-primary/50 transition-all duration-300 click-scale animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-20 h-20 rounded-2xl blue-gradient flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <span className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Genre Selection */}
          {selectedCategory && !selectedGenre && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-4">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  Choose a Genre
                </h1>
                <p className="text-muted-foreground">
                  Select a genre to see top {categories.find(c => c.id === selectedCategory)?.label}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mt-12">
                {genres.map((genre, index) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={cn(
                      "px-6 py-3 rounded-full font-medium transition-all duration-300 click-scale animate-scale-in",
                      "bg-secondary text-foreground hover:blue-gradient hover:text-white hover:shadow-lg hover:shadow-primary/30"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Grid with Filters */}
          {selectedCategory && selectedGenre && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  {selectedGenre} {categories.find(c => c.id === selectedCategory)?.label}
                </h1>
                
                {/* Sort Filters */}
                <div className="flex items-center gap-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Button
                        key={option.id}
                        variant={sortBy === option.id ? "blue" : "glass"}
                        size="sm"
                        className="gap-2"
                        onClick={() => setSortBy(option.id)}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-[140px] md:w-[180px] aspect-[2/3] rounded-xl shimmer"
                    />
                  ))}
                </div>
              ) : content.length > 0 ? (
                <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                  {content.map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <FilmCard film={item} size="md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">
                    No content available for this genre.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;
