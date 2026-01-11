import { useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getProgressForContent, 
  saveSelfStreamingProgress,
  formatDuration 
} from "@/lib/selfStreamingProgress";

interface UserMovie {
  id: string;
  title: string;
  genre: string;
  poster_url: string | null;
  video_url: string;
  description: string | null;
  year: number | null;
}

interface UserMoviePlayerProps {
  movie: UserMovie | null;
  open: boolean;
  onClose: () => void;
}

export function UserMoviePlayer({ movie, open, onClose }: UserMoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const saveProgress = useCallback(() => {
    if (!movie || !videoRef.current) return;
    
    const video = videoRef.current;
    if (video.duration && video.currentTime > 0) {
      const progress = (video.currentTime / video.duration) * 100;
      saveSelfStreamingProgress({
        contentId: movie.id,
        contentType: 'movie',
        title: movie.title,
        poster: movie.poster_url,
        progress,
        currentTime: video.currentTime,
        duration: video.duration,
        lastWatched: new Date().toISOString(),
      });
    }
  }, [movie]);

  useEffect(() => {
    if (open && movie && videoRef.current) {
      // Restore progress
      const saved = getProgressForContent(movie.id);
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
  }, [open, movie, saveProgress]);

  const handleClose = () => {
    saveProgress();
    onClose();
  };

  if (!movie) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              {movie.title} {movie.year && `(${movie.year})`}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="aspect-video bg-black">
          <video
            ref={videoRef}
            src={movie.video_url}
            controls
            autoPlay
            className="w-full h-full"
            onPause={saveProgress}
            onEnded={saveProgress}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        {movie.description && (
          <div className="p-4 pt-2">
            <p className="text-sm text-muted-foreground">{movie.description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
