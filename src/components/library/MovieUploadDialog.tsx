import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Loader2, Search, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TMDBResult {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  poster: string | null;
  genres?: string[];
  mediaType?: string;
}

interface MovieUploadDialogProps {
  onMovieAdded: () => void;
}

export function MovieUploadDialog({ onMovieAdded }: MovieUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TMDBResult | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Search TMDB as user types
  const searchTMDB = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("tmdb", {
        body: { action: "search", query },
      });

      if (error) throw error;

      // Get detailed info for each result to get genres
      const resultsWithGenres = await Promise.all(
        (data.results || []).slice(0, 6).map(async (movie: TMDBResult) => {
          try {
            const action = movie.mediaType === 'tv' ? 'getTVDetail' : 'getMovieDetail';
            const { data: detail } = await supabase.functions.invoke("tmdb", {
              body: { action, movieId: movie.tmdbId },
            });
            return {
              ...movie,
              genres: detail?.result?.genres || [],
            };
          } catch {
            return movie;
          }
        })
      );

      setSearchResults(resultsWithGenres);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (title && !selectedMovie) {
      const timer = setTimeout(() => {
        searchTMDB(title);
      }, 500);
      setDebounceTimer(timer);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [title, selectedMovie]);

  const handleSelectMovie = (movie: TMDBResult) => {
    setSelectedMovie(movie);
    setTitle(movie.title);
    setSearchResults([]);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (selectedMovie && value !== selectedMovie.title) {
      setSelectedMovie(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !videoFile) {
      toast.error("Please provide a title and video file");
      return;
    }

    if (!selectedMovie) {
      toast.error("Please select a movie from the search results");
      return;
    }

    setLoading(true);

    try {
      // Upload video
      const videoFileName = `${Date.now()}-${videoFile.name}`;
      const { error: videoError } = await supabase.storage
        .from("movies")
        .upload(`videos/${videoFileName}`, videoFile);

      if (videoError) throw videoError;

      const { data: videoUrlData } = supabase.storage
        .from("movies")
        .getPublicUrl(`videos/${videoFileName}`);

      // Get the primary genre or first genre
      const primaryGenre = selectedMovie.genres?.[0] || "Uncategorized";

      // Save movie metadata with TMDB data
      const { error: dbError } = await supabase.from("user_movies").insert({
        title: selectedMovie.title,
        genre: primaryGenre,
        year: selectedMovie.year || null,
        video_url: videoUrlData.publicUrl,
        poster_url: selectedMovie.poster,
      });

      if (dbError) throw dbError;

      toast.success("Movie added to your library!");
      setOpen(false);
      resetForm();
      onMovieAdded();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload movie");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSelectedMovie(null);
    setVideoFile(null);
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="blue" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Movie
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Movie to Library</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Search */}
          <div className="space-y-2">
            <Label htmlFor="title">Search Movie Title *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Type to search movies..."
                className="pl-10"
                required
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && !selectedMovie && (
              <div className="border border-border rounded-lg overflow-hidden bg-card shadow-lg">
                {searchResults.map((movie) => (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => handleSelectMovie(movie)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                        No img
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{movie.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {movie.year} • {movie.genres?.join(", ") || "Unknown genre"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Movie Card */}
            {selectedMovie && (
              <div className="flex items-center gap-3 p-3 border border-primary/30 bg-primary/5 rounded-lg">
                {selectedMovie.poster ? (
                  <img
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-16 bg-muted rounded" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{selectedMovie.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMovie.year} • {selectedMovie.genres?.join(", ") || "Unknown"}
                  </p>
                </div>
                <Check className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>

          {/* Video File */}
          <div className="space-y-2">
            <Label htmlFor="video">Video File *</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className={cn(
                "file:mr-2 file:px-3 file:py-1 file:rounded file:border-0",
                "file:bg-primary/10 file:text-primary file:text-sm file:font-medium",
                "cursor-pointer"
              )}
              required
            />
            {videoFile && (
              <p className="text-xs text-muted-foreground">
                Selected: {videoFile.name}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading || !selectedMovie}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Movie
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
