import { useRef, useEffect, useCallback, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, PictureInPicture2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getProgressForContent, 
  saveSelfStreamingProgress,
} from "@/lib/selfStreamingProgress";

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

interface UserMoviePlayerProps {
  movie: UserMovie | null;
  open: boolean;
  onClose: () => void;
}

export function UserMoviePlayer({ movie, open, onClose }: UserMoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if this is a streaming movie (no local file)
  const isStreaming = movie?.video_url === "streaming" || movie?.video_url === "pending";
  const hasLocalFile = movie?.video_url && !isStreaming;

  const getEmbedUrl = useCallback(() => {
    if (!movie?.tmdb_id) return null;
    return `https://vidking.net/embed/movie?tmdb=${movie.tmdb_id}`;
  }, [movie?.tmdb_id]);

  const saveProgress = useCallback(() => {
    if (!movie || !videoRef.current || isStreaming) return;
    
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
  }, [movie, isStreaming]);

  useEffect(() => {
    if (open && movie) {
      setIsLoading(true);
      
      if (hasLocalFile && videoRef.current) {
        // Restore progress for local files
        const saved = getProgressForContent(movie.id);
        if (saved && saved.currentTime > 0) {
          videoRef.current.currentTime = saved.currentTime;
        }

        // Start saving progress every 5 seconds
        saveIntervalRef.current = setInterval(saveProgress, 5000);
      }
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [open, movie, hasLocalFile, saveProgress]);

  const handleClose = () => {
    if (hasLocalFile) {
      saveProgress();
    }
    onClose();
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (!movie) return null;

  const embedUrl = getEmbedUrl();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
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
        <div className="aspect-video bg-black relative">
          {isStreaming && embedUrl ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                onLoad={handleIframeLoad}
              />
            </>
          ) : hasLocalFile ? (
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
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">No video file available</p>
            </div>
          )}
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