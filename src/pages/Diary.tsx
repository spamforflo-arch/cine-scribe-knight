import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Film, Eye, Bookmark, Plus, Trophy, GripVertical, X, Star } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  getWatchedFilms,
  getWatchlistFilms,
  getRankings,
  setRankings,
  StoredFilm,
  Rankings,
  RankedFilm,
} from "@/lib/filmStorage";

const Diary = () => {
  const [activeTab, setActiveTab] = useState<"watched" | "watchlist" | "rankings">("watched");
  const [watchedFilms, setWatchedFilms] = useState<StoredFilm[]>([]);
  const [watchlistFilms, setWatchlistFilms] = useState<StoredFilm[]>([]);
  const [rankings, setRankingsState] = useState<Rankings>({ movies: [], tv: [], anime: [] });
  const [rankingCategory, setRankingCategory] = useState<"movies" | "tv" | "anime">("movies");
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    setWatchedFilms(getWatchedFilms());
    setWatchlistFilms(getWatchlistFilms());
    setRankingsState(getRankings());
  }, [activeTab]);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newRankings = { ...rankings };
    const items = [...newRankings[rankingCategory]];
    const draggedFilm = items[draggedItem];
    
    items.splice(draggedItem, 1);
    items.splice(index, 0, draggedFilm);
    
    // Update ranks
    items.forEach((item, i) => {
      item.rank = i + 1;
    });
    
    newRankings[rankingCategory] = items;
    setRankingsState(newRankings);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setRankings(rankings);
  };

  const addToRanking = (film: StoredFilm) => {
    const newRankings = { ...rankings };
    const category = rankingCategory;
    
    // Check if already in rankings
    if (newRankings[category].some(f => f.tmdbId === film.tmdbId)) return;
    
    // Add at the end (max 15)
    if (newRankings[category].length < 15) {
      const rankedFilm: RankedFilm = { ...film, rank: newRankings[category].length + 1 };
      newRankings[category].push(rankedFilm);
      setRankingsState(newRankings);
      setRankings(newRankings);
    }
    setShowAddModal(false);
  };

  const removeFromRanking = (tmdbId: number) => {
    const newRankings = { ...rankings };
    newRankings[rankingCategory] = newRankings[rankingCategory]
      .filter(f => f.tmdbId !== tmdbId)
      .map((f, i) => ({ ...f, rank: i + 1 }));
    setRankingsState(newRankings);
    setRankings(newRankings);
  };

  // Filter watched films that have ratings for ranking selection
  const ratedFilms = watchedFilms.filter(f => f.userRating && f.userRating > 0);

  const EmptyState = ({ type }: { type: "watched" | "watchlist" | "rankings" }) => (
    <div className="text-center py-20 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-5">
        {type === "watched" ? (
          <Eye className="w-10 h-10 text-muted-foreground" />
        ) : type === "watchlist" ? (
          <Bookmark className="w-10 h-10 text-muted-foreground" />
        ) : (
          <Trophy className="w-10 h-10 text-muted-foreground" />
        )}
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
        {type === "watched" 
          ? "No films watched yet" 
          : type === "watchlist"
          ? "Your watchlist is empty"
          : "No rankings yet"}
      </h2>
      <p className="text-muted-foreground mb-6">
        {type === "watched" 
          ? "Start logging films you've watched to track your cinema journey." 
          : type === "watchlist"
          ? "Add films you want to watch later."
          : "Rate some films first, then add them to your rankings."}
      </p>
      <Link to="/browse">
        <Button variant="blue">
          <Plus className="w-4 h-4 mr-2" />
          Browse Films
        </Button>
      </Link>
    </div>
  );

  const FilmGrid = ({ films }: { films: StoredFilm[] }) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {films.map((film, index) => (
        <Link
          key={film.id}
          to={`/film/tmdb-${film.tmdbId}`}
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
            {film.userRating && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span className="text-xs font-bold">{film.userRating}</span>
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

  const RankingsList = () => (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2">
        {(['movies', 'tv', 'anime'] as const).map((cat) => (
          <Button
            key={cat}
            variant={rankingCategory === cat ? "blue" : "glass"}
            size="sm"
            onClick={() => setRankingCategory(cat)}
          >
            {cat === 'movies' ? 'Movies' : cat === 'tv' ? 'TV Shows' : 'Anime'}
          </Button>
        ))}
      </div>

      {/* Add Button */}
      {rankings[rankingCategory].length < 15 && (
        <Button 
          variant="glass" 
          className="w-full gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4" />
          Add to Top 15
        </Button>
      )}

      {/* Rankings List */}
      {rankings[rankingCategory].length > 0 ? (
        <div className="space-y-2">
          {rankings[rankingCategory].map((film, index) => (
            <div
              key={film.tmdbId}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-4 p-3 rounded-2xl glass cursor-grab active:cursor-grabbing transition-all",
                draggedItem === index && "opacity-50 scale-95"
              )}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-muted-foreground" />
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  index === 0 ? "bg-yellow-500 text-black" :
                  index === 1 ? "bg-gray-400 text-black" :
                  index === 2 ? "bg-amber-600 text-white" :
                  "bg-secondary text-foreground"
                )}>
                  {index + 1}
                </span>
              </div>
              
              <Link to={`/film/tmdb-${film.tmdbId}`} className="flex items-center gap-3 flex-1">
                {film.poster ? (
                  <img
                    src={film.poster}
                    alt={film.title}
                    className="w-12 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-12 h-16 rounded-lg bg-secondary flex items-center justify-center">
                    <Film className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                    {film.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{film.year}</p>
                </div>
              </Link>

              {film.userRating && (
                <div className="flex items-center gap-1 text-primary">
                  <Star className="w-4 h-4 fill-primary" />
                  <span className="text-sm font-bold">{film.userRating}</span>
                </div>
              )}

              <button
                onClick={() => removeFromRanking(film.tmdbId)}
                className="p-2 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState type="rankings" />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="w-full max-w-md bg-card rounded-2xl p-6 animate-pop-in max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Add to Rankings
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {ratedFilms.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Select from your rated films:
                </p>
                {ratedFilms
                  .filter(f => !rankings[rankingCategory].some(r => r.tmdbId === f.tmdbId))
                  .map((film) => (
                    <button
                      key={film.tmdbId}
                      onClick={() => addToRanking(film)}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                    >
                      {film.poster ? (
                        <img
                          src={film.poster}
                          alt={film.title}
                          className="w-10 h-14 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-14 rounded-lg bg-secondary flex items-center justify-center">
                          <Film className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {film.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{film.year}</p>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="w-4 h-4 fill-primary" />
                        <span className="text-sm font-bold">{film.userRating}</span>
                      </div>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Rate some films first to add them to your rankings.
                </p>
                <Link to="/browse">
                  <Button variant="blue" className="mt-4">
                    Browse Films
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
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
              Track what you've watched, plan what's next, and rank your favorites.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "watched" | "watchlist" | "rankings")} className="w-full">
            <TabsList className="grid w-full max-w-lg grid-cols-3 mb-8">
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
              <TabsTrigger value="rankings" className="gap-2">
                <Trophy className="w-4 h-4" />
                Rankings
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

            <TabsContent value="rankings">
              <RankingsList />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Diary;
