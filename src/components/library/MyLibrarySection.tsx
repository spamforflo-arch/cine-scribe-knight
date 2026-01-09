import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MovieUploadDialog } from "./MovieUploadDialog";
import { UserMovieCard } from "./UserMovieCard";
import { UserMoviePlayer } from "./UserMoviePlayer";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Film, ChevronRight, Library } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserMovie {
  id: string;
  title: string;
  genre: string;
  poster_url: string | null;
  video_url: string;
  description: string | null;
  year: number | null;
}

export function MyLibrarySection() {
  const [movies, setMovies] = useState<UserMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingMovie, setPlayingMovie] = useState<UserMovie | null>(null);

  const fetchMovies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_movies")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMovies(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Group movies by genre
  const moviesByGenre = movies.reduce((acc, movie) => {
    const genre = movie.genre || "Uncategorized";
    if (!acc[genre]) {
      acc[genre] = [];
    }
    acc[genre].push(movie);
    return acc;
  }, {} as Record<string, UserMovie[]>);

  const genres = Object.keys(moviesByGenre).sort();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Library className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            My Library
          </h2>
        </div>
        <MovieUploadDialog onMovieAdded={fetchMovies} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading library...</div>
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Film className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Your library is empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add your own movies to create a personal streaming collection. 
            Upload videos and organize them by genre.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {genres.map((genre) => (
            <div key={genre} className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-foreground">{genre}</h3>
                <span className="text-sm text-muted-foreground">
                  ({moviesByGenre[genre].length})
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {moviesByGenre[genre].map((movie, index) => (
                  <div
                    key={movie.id}
                    className={cn(
                      "shrink-0 w-[140px] md:w-[160px] animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <UserMovieCard
                      movie={movie}
                      onDelete={fetchMovies}
                      onPlay={setPlayingMovie}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      <UserMoviePlayer
        movie={playingMovie}
        open={!!playingMovie}
        onClose={() => setPlayingMovie(null)}
      />
    </section>
  );
}
