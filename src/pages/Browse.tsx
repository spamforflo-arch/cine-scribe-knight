import { useState, useEffect, useRef, useCallback } from "react";
import { Film, Tv, Sparkles, ChevronLeft, TrendingUp, Clock, Star, Loader2, SlidersHorizontal, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilmCard } from "@/components/films/FilmCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { ContinueWatchingSheet } from "@/components/watch/ContinueWatchingSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "newest", label: "Newest", icon: Clock },
  { id: "rating", label: "Top Rated", icon: Star },
];

const languages = [
  { code: "", label: "All Languages" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "zh", label: "Chinese" },
];

type ContentItem = {
  id: string;
  tmdbId?: number;
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
  mediaType?: 'movie' | 'tv' | 'anime';
};

// Storage keys for scroll position
const SCROLL_POSITION_KEY = 'browse_scroll_position';
const BROWSE_STATE_KEY = 'browse_state';

const Browse = () => {
  const location = useLocation();
  const initialState = location.state as { category?: string; genre?: string; scrollPosition?: number } | null;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialState?.category || null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(initialState?.genre || null);
  const [sortBy, setSortBy] = useState("trending");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const restoredKeyRef = useRef<string | null>(null);

  const saveBrowseSnapshot = useCallback(() => {
    if (!selectedCategory || !selectedGenre) return;

    sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
    sessionStorage.setItem(
      BROWSE_STATE_KEY,
      JSON.stringify({
        category: selectedCategory,
        genre: selectedGenre,
        sortBy,
        content,
        currentPage,
        totalPages,
      })
    );
  }, [selectedCategory, selectedGenre, sortBy, content, currentPage, totalPages]);

  // Save snapshot whenever we leave /browse (so back from a detail page restores exactly)
  useEffect(() => {
    return () => {
      saveBrowseSnapshot();
    };
  }, [saveBrowseSnapshot]);

  // Restore state + scroll position when coming back (only if same category+genre+sort)
  useEffect(() => {
    if (!initialState?.category || !initialState?.genre) return;

    const savedStateRaw = sessionStorage.getItem(BROWSE_STATE_KEY);
    const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);

    if (!savedStateRaw) return;

    try {
      const parsed = JSON.parse(savedStateRaw) as {
        category?: string;
        genre?: string;
        sortBy?: string;
        content?: ContentItem[];
        currentPage?: number;
        totalPages?: number;
      };

      const sameSelection =
        parsed.category === initialState.category &&
        parsed.genre === initialState.genre &&
        (parsed.sortBy || "popularity") === sortBy;

      if (sameSelection && Array.isArray(parsed.content) && parsed.content.length > 0) {
        setContent(parsed.content);
        setCurrentPage(parsed.currentPage || 1);
        setTotalPages(parsed.totalPages || 1);

        restoredKeyRef.current = `${parsed.category}|${parsed.genre}|${parsed.sortBy || "popularity"}`;

        if (savedScrollPosition) {
          const y = Number(savedScrollPosition);
          requestAnimationFrame(() => window.scrollTo(0, y));
        }
      }
    } catch (e) {
      console.error("Error parsing saved browse state:", e);
    }
  }, [initialState, sortBy]);


  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
      setSelectedGenre(null);
      setContent([]);
      setCurrentPage(1);
      setTotalPages(1);
      restoredKeyRef.current = null;
      sessionStorage.removeItem(SCROLL_POSITION_KEY);
      sessionStorage.removeItem(BROWSE_STATE_KEY);
    }
  };

  useEffect(() => {
    if (!selectedCategory) return;

    const key = `${selectedCategory}|${selectedGenre || 'all'}|${sortBy}|${selectedLanguage}`;
    if (restoredKeyRef.current === key) return;

    setContent([]);
    setCurrentPage(1);
    fetchContent(1, true);
  }, [selectedCategory, selectedGenre, sortBy, selectedLanguage]);


  const fetchContent = async (page: number, reset: boolean = false) => {
    if (!selectedCategory) return;
    
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('tmdb', {
        body: { 
          category: selectedCategory, 
          genre: selectedGenre, 
          sortBy, 
          page, 
          language: selectedLanguage,
        }
      });

      if (error) throw error;
      
      if (reset) {
        setContent(data?.results || []);
      } else {
        setContent(prev => [...prev, ...(data?.results || [])]);
      }
      setTotalPages(data?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error loading content",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Infinite scroll with Intersection Observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && currentPage < totalPages && !isLoadingMore && !isLoading) {
      fetchContent(currentPage + 1, false);
    }
  }, [currentPage, totalPages, isLoadingMore, isLoading, selectedCategory, selectedGenre, sortBy]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Current browse state for back navigation
  const browseState = selectedCategory ? { category: selectedCategory, genre: selectedGenre || undefined } : undefined;

  return (
    <div className="min-h-screen bg-background grain">
      <AppHeader />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Navigation */}
          {selectedCategory && (
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground click-scale transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            </div>
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

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
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


          {/* Content Grid with Filters */}
          {selectedCategory && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  {(selectedGenre ? `${selectedGenre} ` : '') + categories.find(c => c.id === selectedCategory)?.label}
                </h1>
                
                {/* Sort and Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Sort Options */}
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
                  
                  {/* Continue Watching Button */}
                  <ContinueWatchingSheet />
                  
                  {/* Genre Filter Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="glass" size="sm" className="gap-2">
                        <SlidersHorizontal className="w-4 h-4" />
                        {selectedGenre || "Genre"}
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-secondary border-border max-h-80 overflow-y-auto">
                      <DropdownMenuItem 
                        onClick={() => setSelectedGenre(null)}
                        className={cn(!selectedGenre && "bg-primary/20")}
                      >
                        All Genres
                      </DropdownMenuItem>
                      {genres.map((genre) => (
                        <DropdownMenuItem
                          key={genre}
                          onClick={() => setSelectedGenre(genre)}
                          className={cn(selectedGenre === genre && "bg-primary/20")}
                        >
                          {genre}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Language Filter Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="glass" size="sm" className="gap-2">
                        <Globe className="w-4 h-4" />
                        {languages.find(l => l.code === selectedLanguage)?.label || "Language"}
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-secondary border-border max-h-80 overflow-y-auto">
                      {languages.map((lang) => (
                        <DropdownMenuItem
                          key={lang.code}
                          onClick={() => setSelectedLanguage(lang.code)}
                          className={cn(selectedLanguage === lang.code && "bg-primary/20")}
                        >
                          {lang.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                <>
                  <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                    {content.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="animate-slide-up"
                        style={{ animationDelay: `${Math.min(index % 20, 20) * 30}ms` }}
                      >
                        <FilmCard 
                          film={{
                            ...item,
                            mediaType: item.mediaType || (selectedCategory === 'films' ? 'movie' : selectedCategory as 'tv' | 'anime'),
                          }} 
                          size="md" 
                          browseState={browseState}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Infinite Scroll Trigger */}
                  {currentPage < totalPages && (
                    <div 
                      ref={loadMoreRef}
                      className="flex justify-center items-center py-12"
                    >
                      {isLoadingMore && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span>Loading more...</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {currentPage >= totalPages && content.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">You've reached the end</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">
                    No content available{selectedGenre ? ` for ${selectedGenre}` : ''}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Browse;
