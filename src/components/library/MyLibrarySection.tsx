import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentUploadDialog } from "./ContentUploadDialog";
import { UserMovieCard } from "./UserMovieCard";
import { UserMoviePlayer } from "./UserMoviePlayer";
import { SeriesCard } from "./SeriesCard";
import { SeriesPlayer } from "./SeriesPlayer";
import { Film, ChevronRight, Tv, MoreVertical, Plus, Search, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getContinueWatchingSelfStreaming, SelfStreamingProgress } from "@/lib/selfStreamingProgress";
import { Progress } from "@/components/ui/progress";

interface UserMovie {
  id: string;
  title: string;
  genre: string;
  poster_url: string | null;
  video_url: string;
  description: string | null;
  year: number | null;
  tmdb_id?: number | null;
}

interface UserSeries {
  id: string;
  title: string;
  genre: string;
  poster_url: string | null;
  year: number | null;
  tmdb_id: number | null;
  episodes: UserEpisode[];
}

interface UserEpisode {
  id: string;
  series_id: string;
  season_number: number;
  episode_number: number;
  title: string | null;
  video_url: string;
}

export function MyLibrarySection() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<UserMovie[]>([]);
  const [series, setSeries] = useState<UserSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingMovie, setPlayingMovie] = useState<UserMovie | null>(null);
  const [playingSeries, setPlayingSeries] = useState<UserSeries | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<UserEpisode | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [continueWatching, setContinueWatching] = useState<SelfStreamingProgress[]>([]);

  const fetchContent = async () => {
    setLoading(true);
    
    // Fetch movies
    const { data: moviesData } = await supabase
      .from("user_movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (moviesData) {
      setMovies(moviesData);
    }

    // Fetch series with episodes
    const { data: seriesData } = await supabase
      .from("user_series")
      .select(`
        *,
        episodes:user_episodes(*)
      `)
      .order("created_at", { ascending: false });

    if (seriesData) {
      setSeries(seriesData as any);
    }

    // Update continue watching
    setContinueWatching(getContinueWatchingSelfStreaming());

    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Update continue watching when players close
  const updateContinueWatching = () => {
    setContinueWatching(getContinueWatchingSelfStreaming());
  };

  // Group content by genre
  const allContent = [
    ...movies.map(m => ({ ...m, type: 'movie' as const })),
    ...series.map(s => ({ ...s, type: 'series' as const })),
  ];

  const contentByGenre = allContent.reduce((acc, item) => {
    const genre = item.genre || "Uncategorized";
    if (!acc[genre]) {
      acc[genre] = [];
    }
    acc[genre].push(item);
    return acc;
  }, {} as Record<string, typeof allContent>);

  const genres = Object.keys(contentByGenre).sort();

  const handlePlaySeries = (s: UserSeries, episode?: UserEpisode) => {
    setPlayingSeries(s);
    setPlayingEpisode(episode || s.episodes?.[0] || null);
  };

  const handleContinueWatchingClick = (item: SelfStreamingProgress) => {
    if (item.contentType === 'movie') {
      const movie = movies.find(m => m.id === item.contentId);
      if (movie) setPlayingMovie(movie);
    } else {
      const s = series.find(s => s.id === item.contentId);
      if (s) {
        const episode = item.episodeId 
          ? s.episodes.find(ep => ep.id === item.episodeId) 
          : s.episodes[0];
        handlePlaySeries(s, episode);
      }
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Tv className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Self Streaming
          </h2>
        </div>
        
        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Content
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/browse')} className="gap-2">
              <Search className="w-4 h-4" />
              Add from Browse
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading library...</div>
        </div>
      ) : allContent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Film className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Your library is empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Add your own movies and TV series to create a personal streaming collection. 
            Search by title and we'll auto-fetch the poster and genre.
          </p>
          <div className="flex gap-2">
            <Button variant="blue" onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Content
            </Button>
            <Button variant="outline" onClick={() => navigate('/browse')} className="gap-2">
              <Search className="w-4 h-4" />
              Browse Catalog
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Continue Watching Section */}
          {continueWatching.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">Continue Watching</h3>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {continueWatching.map((item, index) => (
                  <div
                    key={`${item.contentId}-${item.episodeId || 'movie'}`}
                    className="shrink-0 w-[140px] md:w-[160px] animate-fade-in cursor-pointer group"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleContinueWatchingClick(item)}
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted">
                      {item.poster ? (
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 right-0">
                        <Progress value={item.progress} className="h-1 rounded-none bg-black/50" />
                      </div>

                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="p-3 rounded-full bg-primary">
                          <Play className="w-5 h-5 text-primary-foreground fill-current" />
                        </div>
                      </div>

                      {/* Type badge */}
                      {item.contentType === 'series' && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 text-primary-foreground text-xs font-medium rounded">
                          S{item.seasonNumber} E{item.episodeNumber}
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(item.progress)}% watched
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genre sections */}
          {genres.map((genre) => (
            <div key={genre} className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-foreground">{genre}</h3>
                <span className="text-sm text-muted-foreground">
                  ({contentByGenre[genre].length})
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {contentByGenre[genre].map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      "shrink-0 w-[140px] md:w-[160px] animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.type === 'movie' ? (
                      <UserMovieCard
                        movie={item as UserMovie}
                        onDelete={fetchContent}
                        onPlay={setPlayingMovie}
                      />
                    ) : (
                      <SeriesCard
                        series={item as UserSeries}
                        onDelete={fetchContent}
                        onPlay={handlePlaySeries}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <ContentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onContentAdded={fetchContent}
      />

      {/* Movie Player Modal */}
      <UserMoviePlayer
        movie={playingMovie}
        open={!!playingMovie}
        onClose={() => {
          setPlayingMovie(null);
          updateContinueWatching();
        }}
      />

      {/* Series Player Modal */}
      <SeriesPlayer
        series={playingSeries}
        currentEpisode={playingEpisode}
        open={!!playingSeries}
        onClose={() => {
          setPlayingSeries(null);
          setPlayingEpisode(null);
          updateContinueWatching();
        }}
        onEpisodeChange={setPlayingEpisode}
      />
    </section>
  );
}