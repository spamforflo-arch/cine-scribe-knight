import { useState } from "react";
import { Link } from "react-router-dom";
import { Film, Eye, Bookmark, Plus } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Local storage for watched and watchlist items
interface LoggedFilm {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  poster: string | null;
  addedAt: string;
}

const Diary = () => {
  const [activeTab, setActiveTab] = useState<"watched" | "watchlist">("watched");
  
  // Get items from localStorage
  const getWatchedFilms = (): LoggedFilm[] => {
    try {
      return JSON.parse(localStorage.getItem("cinestop_watched") || "[]");
    } catch {
      return [];
    }
  };

  const getWatchlistFilms = (): LoggedFilm[] => {
    try {
      return JSON.parse(localStorage.getItem("cinestop_watchlist") || "[]");
    } catch {
      return [];
    }
  };

  const watchedFilms = getWatchedFilms();
  const watchlistFilms = getWatchlistFilms();

  const EmptyState = ({ type }: { type: "watched" | "watchlist" }) => (
    <div className="text-center py-20 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-5">
        {type === "watched" ? (
          <Eye className="w-10 h-10 text-muted-foreground" />
        ) : (
          <Bookmark className="w-10 h-10 text-muted-foreground" />
        )}
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
        {type === "watched" ? "No films watched yet" : "Your watchlist is empty"}
      </h2>
      <p className="text-muted-foreground mb-6">
        {type === "watched" 
          ? "Start logging films you've watched to track your cinema journey." 
          : "Add films you want to watch later."}
      </p>
      <Link to="/films">
        <Button variant="blue">
          <Plus className="w-4 h-4 mr-2" />
          Browse Films
        </Button>
      </Link>
    </div>
  );

  const FilmGrid = ({ films }: { films: LoggedFilm[] }) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {films.map((film, index) => (
        <Link
          key={film.id}
          to={`/film/${film.tmdbId}`}
          className="group animate-fade-in click-scale"
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden film-card-shadow bg-secondary">
            {film.poster ? (
              <img
                src={film.poster}
                alt={film.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="mt-2 text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {film.title}
          </p>
          <p className="text-[10px] text-muted-foreground">{film.year}</p>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main className="pt-24 pb-28 md:pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="space-y-4 mb-8 animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              My Collection
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Track what you've watched and plan what's next.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "watched" | "watchlist")} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="watched" className="gap-2">
                <Eye className="w-4 h-4" />
                Watched
                {watchedFilms.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                    {watchedFilms.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="gap-2">
                <Bookmark className="w-4 h-4" />
                Watchlist
                {watchlistFilms.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                    {watchlistFilms.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="watched">
              {watchedFilms.length > 0 ? (
                <FilmGrid films={watchedFilms} />
              ) : (
                <EmptyState type="watched" />
              )}
            </TabsContent>

            <TabsContent value="watchlist">
              {watchlistFilms.length > 0 ? (
                <FilmGrid films={watchlistFilms} />
              ) : (
                <EmptyState type="watchlist" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Diary;
