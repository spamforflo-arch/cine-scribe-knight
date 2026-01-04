import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, PictureInPicture2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveWatchProgress, WatchProgress } from "@/lib/watchProgress";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv' | 'anime';
  title: string;
  poster: string | null;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  onClose: () => void;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  hasNextEpisode?: boolean;
  hasPrevEpisode?: boolean;
}

export function VideoPlayer({
  tmdbId,
  mediaType,
  title,
  poster,
  season,
  episode,
  episodeTitle,
  onClose,
  onNextEpisode,
  onPrevEpisode,
  hasNextEpisode,
  hasPrevEpisode,
}: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [isPiP, setIsPiP] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Build embed URL using VidSrc API
  const getEmbedUrl = useCallback(() => {
    const baseUrl = "https://vidsrc-embed.ru/embed";
    if (mediaType === 'movie') {
      return `${baseUrl}/movie?tmdb=${tmdbId}&autoplay=1`;
    } else {
      // TV or Anime - include season and episode
      const s = season || 1;
      const e = episode || 1;
      return `${baseUrl}/tv?tmdb=${tmdbId}&season=${s}&episode=${e}&autoplay=1&autonext=1`;
    }
  }, [mediaType, tmdbId, season, episode]);

  // Save progress periodically
  useEffect(() => {
    progressInterval.current = setInterval(() => {
      // Estimate progress (since we can't access iframe internals due to cross-origin)
      setCurrentTime(prev => {
        const newTime = prev + 10;
        const estimatedDuration = mediaType === 'movie' ? 7200 : 2400; // 2h for movies, 40min for episodes
        const progress = Math.min((newTime / estimatedDuration) * 100, 99);
        
        const progressData: WatchProgress = {
          tmdbId,
          mediaType,
          title,
          poster,
          progress,
          currentTime: newTime,
          duration: estimatedDuration,
          lastWatched: new Date().toISOString(),
          season,
          episode,
          episodeTitle,
        };
        
        saveWatchProgress(progressData);
        return newTime;
      });
    }, 10000); // Update every 10 seconds

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [tmdbId, mediaType, title, poster, season, episode, episodeTitle]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  // Picture-in-Picture functionality
  const togglePiP = useCallback(() => {
    if (isPiP && pipWindowRef.current) {
      pipWindowRef.current.close();
      pipWindowRef.current = null;
      setIsPiP(false);
      return;
    }

    // Open a small popup window for PiP
    const width = 400;
    const height = 225;
    const left = window.screen.width - width - 20;
    const top = window.screen.height - height - 100;

    const pipWindow = window.open(
      getEmbedUrl(),
      'pip-player',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,status=no,menubar=no,toolbar=no,location=no`
    );

    if (pipWindow) {
      pipWindowRef.current = pipWindow;
      setIsPiP(true);
      
      // Monitor when PiP window is closed
      const checkClosed = setInterval(() => {
        if (pipWindow.closed) {
          clearInterval(checkClosed);
          pipWindowRef.current = null;
          setIsPiP(false);
        }
      }, 500);

      // Close the main player
      onClose();
    }
  }, [isPiP, onClose, getEmbedUrl]);

  return (
    <div className="fixed inset-0 z-[2147483647] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={togglePiP}
            className="text-white hover:bg-white/20"
            title="Picture in Picture"
          >
            <PictureInPicture2 className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-white font-semibold text-lg">{title}</h2>
            {season && episode && (
              <p className="text-white/70 text-sm">
                S{season} E{episode}{episodeTitle ? ` - ${episodeTitle}` : ''}
              </p>
            )}
          </div>
        </div>
        
        {/* Episode Navigation */}
        {(mediaType === 'tv' || mediaType === 'anime') && (
          <div className="flex items-center gap-2">
            {hasPrevEpisode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevEpisode}
                className="text-white hover:bg-white/20 gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            )}
            {hasNextEpisode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNextEpisode}
                className="text-white hover:bg-white/20 gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70">Loading player...</p>
          </div>
        </div>
      )}

      {/* Video iframe */}
      <iframe
        ref={iframeRef}
        src={getEmbedUrl()}
        className={cn(
          "flex-1 w-full h-full border-0",
          loading && "opacity-0"
        )}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        onLoad={handleIframeLoad}
      />
    </div>
  );
}
