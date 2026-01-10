import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentUploadDialog } from "./ContentUploadDialog";
import { UserMovieCard } from "./UserMovieCard";
import { UserMoviePlayer } from "./UserMoviePlayer";
import { SeriesCard } from "./SeriesCard";
import { SeriesPlayer } from "./SeriesPlayer";
import { Film, ChevronRight, Tv, MoreVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserMovie {
  id: string;
  title: string;
  genre: string;
  poster_url: string | null;
  video_url: string;
  description: string | null;
  year: number | null;
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
  const [movies, setMovies] = useState<UserMovie[]>([]);
  const [series, setSeries] = useState<UserSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingMovie, setPlayingMovie] = useState<UserMovie | null>(null);
  const [playingSeries, setPlayingSeries] = useState<UserSeries | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<UserEpisode | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

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

    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

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
          <Button variant="blue" onClick={() => setUploadDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Content
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
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
        onClose={() => setPlayingMovie(null)}
      />

      {/* Series Player Modal */}
      <SeriesPlayer
        series={playingSeries}
        currentEpisode={playingEpisode}
        open={!!playingSeries}
        onClose={() => {
          setPlayingSeries(null);
          setPlayingEpisode(null);
        }}
        onEpisodeChange={setPlayingEpisode}
      />
    </section>
  );
}