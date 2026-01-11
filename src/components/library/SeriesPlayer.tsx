import { useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getProgressForContent, 
  saveSelfStreamingProgress 
} from "@/lib/selfStreamingProgress";

interface UserEpisode {
  id: string;
  series_id: string;
  season_number: number;
  episode_number: number;
  title: string | null;
  video_url: string;
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

interface SeriesPlayerProps {
  series: UserSeries | null;
  currentEpisode: UserEpisode | null;
  open: boolean;
  onClose: () => void;
  onEpisodeChange: (episode: UserEpisode) => void;
}

export function SeriesPlayer({ series, currentEpisode, open, onClose, onEpisodeChange }: SeriesPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const saveProgress = useCallback(() => {
    if (!series || !currentEpisode || !videoRef.current) return;
    
    const video = videoRef.current;
    if (video.duration && video.currentTime > 0) {
      const progress = (video.currentTime / video.duration) * 100;
      saveSelfStreamingProgress({
        contentId: series.id,
        contentType: 'series',
        title: series.title,
        poster: series.poster_url,
        progress,
        currentTime: video.currentTime,
        duration: video.duration,
        lastWatched: new Date().toISOString(),
        episodeId: currentEpisode.id,
        seasonNumber: currentEpisode.season_number,
        episodeNumber: currentEpisode.episode_number,
        episodeTitle: currentEpisode.title || undefined,
      });
    }
  }, [series, currentEpisode]);

  useEffect(() => {
    if (open && series && currentEpisode && videoRef.current) {
      // Restore progress for this specific episode
      const saved = getProgressForContent(series.id, currentEpisode.id);
      if (saved && saved.currentTime > 0) {
        videoRef.current.currentTime = saved.currentTime;
      }

      // Start saving progress every 5 seconds
      saveIntervalRef.current = setInterval(saveProgress, 5000);
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [open, series, currentEpisode, saveProgress]);

  const handleClose = () => {
    saveProgress();
    onClose();
  };

  if (!series || !currentEpisode) return null;

  // Group episodes by season
  const episodesBySeason = series.episodes.reduce((acc, ep) => {
    if (!acc[ep.season_number]) {
      acc[ep.season_number] = [];
    }
    acc[ep.season_number].push(ep);
    return acc;
  }, {} as Record<number, UserEpisode[]>);

  // Sort episodes within each season
  Object.values(episodesBySeason).forEach(eps => {
    eps.sort((a, b) => a.episode_number - b.episode_number);
  });

  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);

  // Find current episode index for navigation
  const allEpisodesSorted = series.episodes.sort((a, b) => {
    if (a.season_number !== b.season_number) return a.season_number - b.season_number;
    return a.episode_number - b.episode_number;
  });
  
  const currentIndex = allEpisodesSorted.findIndex(ep => ep.id === currentEpisode.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allEpisodesSorted.length - 1;

  const handlePrev = () => {
    saveProgress();
    if (hasPrev) {
      onEpisodeChange(allEpisodesSorted[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    saveProgress();
    if (hasNext) {
      onEpisodeChange(allEpisodesSorted[currentIndex + 1]);
    }
  };

  const handleEpisodeSelect = (ep: UserEpisode) => {
    saveProgress();
    onEpisodeChange(ep);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-6xl w-[95vw] p-0 bg-black border-none overflow-hidden">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Video Player */}
          <div className="aspect-video bg-black">
            <video
              ref={videoRef}
              key={currentEpisode.video_url}
              src={currentEpisode.video_url}
              controls
              autoPlay
              className="w-full h-full"
              onPause={saveProgress}
              onEnded={saveProgress}
            />
          </div>

          {/* Episode Info Bar */}
          <div className="bg-card p-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{series.title}</h3>
                <p className="text-sm text-muted-foreground">
                  S{currentEpisode.season_number} E{currentEpisode.episode_number}
                  {currentEpisode.title && ` - ${currentEpisode.title}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Episode List */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {seasons.map(season => (
                <div key={season}>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Season {season}</p>
                  <div className="flex gap-2 flex-wrap">
                    {episodesBySeason[season].map(ep => (
                      <Button
                        key={ep.id}
                        variant={ep.id === currentEpisode.id ? "blue" : "outline"}
                        size="sm"
                        onClick={() => handleEpisodeSelect(ep)}
                        className={cn(
                          "h-8",
                          ep.id === currentEpisode.id && "ring-2 ring-primary"
                        )}
                      >
                        E{ep.episode_number}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}