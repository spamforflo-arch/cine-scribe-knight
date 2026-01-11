import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Search, Check, Plus, Trash2, Film, Tv } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TMDBResult {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  poster: string | null;
  genres?: string[];
  mediaType?: string;
}

interface EpisodeInput {
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  file: File | null;
}

interface ContentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentAdded: () => void;
  initialTMDBData?: {
    tmdbId: number;
    title: string;
    year: number;
    poster: string | null;
    genres: string[];
    mediaType: 'movie' | 'tv';
  } | null;
}

export function ContentUploadDialog({ 
  open, 
  onOpenChange, 
  onContentAdded,
  initialTMDBData 
}: ContentUploadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [selectedContent, setSelectedContent] = useState<TMDBResult | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [contentType, setContentType] = useState<"movie" | "series">("movie");
  
  // Series-specific state
  const [episodes, setEpisodes] = useState<EpisodeInput[]>([
    { seasonNumber: 1, episodeNumber: 1, title: "", file: null }
  ]);

  // Initialize with TMDB data if provided (from Browse page)
  useEffect(() => {
    if (initialTMDBData && open) {
      setSelectedContent({
        id: `tmdb-${initialTMDBData.tmdbId}`,
        tmdbId: initialTMDBData.tmdbId,
        title: initialTMDBData.title,
        year: initialTMDBData.year,
        poster: initialTMDBData.poster,
        genres: initialTMDBData.genres,
        mediaType: initialTMDBData.mediaType,
      });
      setTitle(initialTMDBData.title);
      setContentType(initialTMDBData.mediaType === 'tv' ? 'series' : 'movie');
    }
  }, [initialTMDBData, open]);

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

      const resultsWithGenres = await Promise.all(
        (data.results || []).slice(0, 6).map(async (item: TMDBResult) => {
          try {
            const action = item.mediaType === 'tv' ? 'getTVDetail' : 'getMovieDetail';
            const { data: detail } = await supabase.functions.invoke("tmdb", {
              body: { action, movieId: item.tmdbId },
            });
            return {
              ...item,
              genres: detail?.result?.genres || [],
            };
          } catch {
            return item;
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

    if (title && !selectedContent) {
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
  }, [title, selectedContent]);

  const handleSelectContent = (content: TMDBResult) => {
    setSelectedContent(content);
    setTitle(content.title);
    setSearchResults([]);
    // Auto-switch to series tab if TV content
    if (content.mediaType === 'tv') {
      setContentType('series');
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (selectedContent && value !== selectedContent.title) {
      setSelectedContent(null);
    }
  };

  const addEpisode = () => {
    const lastEp = episodes[episodes.length - 1];
    setEpisodes([
      ...episodes,
      { 
        seasonNumber: lastEp?.seasonNumber || 1, 
        episodeNumber: (lastEp?.episodeNumber || 0) + 1, 
        title: "", 
        file: null 
      }
    ]);
  };

  const removeEpisode = (index: number) => {
    if (episodes.length > 1) {
      setEpisodes(episodes.filter((_, i) => i !== index));
    }
  };

  const updateEpisode = (index: number, field: keyof EpisodeInput, value: any) => {
    const updated = [...episodes];
    updated[index] = { ...updated[index], [field]: value };
    setEpisodes(updated);
  };

  const handleSubmitMovie = async () => {
    if (!selectedContent) {
      toast.error("Please select a movie from search results");
      return;
    }

    // Video file is optional when adding from Browse
    const hasVideoFile = !!videoFile;

    setLoading(true);

    try {
      let videoUrl = "";

      if (hasVideoFile) {
        const videoFileName = `${Date.now()}-${videoFile!.name}`;
        const { error: videoError } = await supabase.storage
          .from("movies")
          .upload(`videos/${videoFileName}`, videoFile!);

        if (videoError) throw videoError;

        const { data: videoUrlData } = supabase.storage
          .from("movies")
          .getPublicUrl(`videos/${videoFileName}`);

        videoUrl = videoUrlData.publicUrl;
      }

      const primaryGenre = selectedContent.genres?.[0] || "Uncategorized";

      const { error: dbError } = await supabase.from("user_movies").insert({
        title: selectedContent.title,
        genre: primaryGenre,
        year: selectedContent.year || null,
        video_url: videoUrl || "pending", // Use "pending" if no file uploaded
        poster_url: selectedContent.poster,
      });

      if (dbError) throw dbError;

      toast.success(hasVideoFile 
        ? "Movie added to your library!" 
        : "Movie added! You can add the video file later.");
      handleClose();
      onContentAdded();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to add movie");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSeries = async () => {
    if (!selectedContent) {
      toast.error("Please select a series from search results");
      return;
    }

    const validEpisodes = episodes.filter(ep => ep.file);
    // Allow adding series without episodes when coming from Browse
    const isFromBrowse = !!initialTMDBData;

    setLoading(true);

    try {
      const primaryGenre = selectedContent.genres?.[0] || "Uncategorized";

      // Create series
      const { data: seriesData, error: seriesError } = await supabase
        .from("user_series")
        .insert({
          title: selectedContent.title,
          genre: primaryGenre,
          year: selectedContent.year || null,
          poster_url: selectedContent.poster,
          tmdb_id: selectedContent.tmdbId,
        })
        .select()
        .single();

      if (seriesError) throw seriesError;

      // Upload episodes if any
      for (const ep of validEpisodes) {
        if (!ep.file) continue;

        const videoFileName = `${Date.now()}-${ep.file.name}`;
        const { error: videoError } = await supabase.storage
          .from("movies")
          .upload(`series/${seriesData.id}/${videoFileName}`, ep.file);

        if (videoError) throw videoError;

        const { data: videoUrlData } = supabase.storage
          .from("movies")
          .getPublicUrl(`series/${seriesData.id}/${videoFileName}`);

        const { error: epError } = await supabase.from("user_episodes").insert({
          series_id: seriesData.id,
          season_number: ep.seasonNumber,
          episode_number: ep.episodeNumber,
          title: ep.title || `Episode ${ep.episodeNumber}`,
          video_url: videoUrlData.publicUrl,
        });

        if (epError) throw epError;
      }

      const episodeMsg = validEpisodes.length > 0 
        ? ` with ${validEpisodes.length} episode(s)` 
        : ". You can add episodes later.";
      toast.success(`Series "${selectedContent.title}" added${episodeMsg}`);
      handleClose();
      onContentAdded();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to add series");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setSelectedContent(null);
    setVideoFile(null);
    setSearchResults([]);
    setEpisodes([{ seasonNumber: 1, episodeNumber: 1, title: "", file: null }]);
    setContentType("movie");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to Self Streaming</DialogTitle>
        </DialogHeader>
        
        <Tabs value={contentType} onValueChange={(v) => setContentType(v as "movie" | "series")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="movie" className="gap-2">
              <Film className="w-4 h-4" />
              Movie
            </TabsTrigger>
            <TabsTrigger value="series" className="gap-2">
              <Tv className="w-4 h-4" />
              TV Series
            </TabsTrigger>
          </TabsList>
          
          {/* Title Search (shared) */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="title">Search Title *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Type to search..."
                className="pl-10"
                required
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {searchResults.length > 0 && !selectedContent && (
              <div className="border border-border rounded-lg overflow-hidden bg-card shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectContent(item)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-10 h-14 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                        No img
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.year} • {item.mediaType === 'tv' ? 'TV' : 'Movie'} • {item.genres?.join(", ") || "Unknown genre"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedContent && (
              <div className="flex items-center gap-3 p-3 border border-primary/30 bg-primary/5 rounded-lg">
                {selectedContent.poster ? (
                  <img
                    src={selectedContent.poster}
                    alt={selectedContent.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-16 bg-muted rounded" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{selectedContent.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedContent.year} • {selectedContent.genres?.join(", ") || "Unknown"}
                  </p>
                </div>
                <Check className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>

          <TabsContent value="movie" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label htmlFor="video">
                Video File {initialTMDBData ? "(optional)" : "*"}
              </Label>
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
              />
              {videoFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {videoFile.name}
                </p>
              )}
              {initialTMDBData && !videoFile && (
                <p className="text-xs text-muted-foreground">
                  You can add the video file later from your library.
                </p>
              )}
            </div>

            <Button 
              onClick={handleSubmitMovie} 
              className="w-full gap-2" 
              disabled={loading || !selectedContent}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Library
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="series" className="space-y-4 mt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Episodes</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addEpisode} className="gap-1">
                  <Plus className="w-4 h-4" />
                  Add Episode
                </Button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {episodes.map((ep, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <div className="w-20">
                          <Label className="text-xs">Season</Label>
                          <Input
                            type="number"
                            min={1}
                            value={ep.seasonNumber}
                            onChange={(e) => updateEpisode(index, "seasonNumber", parseInt(e.target.value) || 1)}
                            className="h-8"
                          />
                        </div>
                        <div className="w-20">
                          <Label className="text-xs">Episode</Label>
                          <Input
                            type="number"
                            min={1}
                            value={ep.episodeNumber}
                            onChange={(e) => updateEpisode(index, "episodeNumber", parseInt(e.target.value) || 1)}
                            className="h-8"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">Title (optional)</Label>
                          <Input
                            value={ep.title}
                            onChange={(e) => updateEpisode(index, "title", e.target.value)}
                            placeholder="Episode title"
                            className="h-8"
                          />
                        </div>
                      </div>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => updateEpisode(index, "file", e.target.files?.[0] || null)}
                        className={cn(
                          "file:mr-2 file:px-2 file:py-0.5 file:rounded file:border-0",
                          "file:bg-primary/10 file:text-primary file:text-xs file:font-medium",
                          "cursor-pointer text-xs h-8"
                        )}
                      />
                    </div>
                    {episodes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEpisode(index)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleSubmitSeries} 
              className="w-full gap-2" 
              disabled={loading || !selectedContent}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Library
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}