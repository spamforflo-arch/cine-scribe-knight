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

  // Build embed URL using VidKing API
  const getEmbedUrl = useCallback(() => {
    const baseUrl = "https://vidking.net/embed";
    if (mediaType === 'movie') {
      return `${baseUrl}/movie/${tmdbId}`;
    } else {
      const s = season || 1;
      const e = episode || 1;
      return `${baseUrl}/tv/${tmdbId}/${s}/${e}`;
    }
  }, [mediaType, tmdbId, season, episode]);

  // Save progress periodically
  useEffect(() => {
    progressInterval.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 10;
        const estimatedDuration = mediaType === 'movie' ? 7200 : 2400;
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
    }, 10000);

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
      
      const checkClosed = setInterval(() => {
        if (pipWindow.closed) {
          clearInterval(checkClosed);
          pipWindowRef.current = null;
          setIsPiP(false);
        }
      }, 500);

      onClose();
    }
  }, [isPiP, onClose, getEmbedUrl]);

  return (
    <div className="fixed inset-0 z-[2147483647] bg-black flex flex-col">
      {/* Header - positioned to not overlap iframe controls */}
      <div className="relative z-10 flex items-center justify-between p-2 sm:p-3 bg-black shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-white/20 shrink-0 h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={togglePiP}
            className="text-white hover:bg-white/20 shrink-0 h-8 w-8 sm:h-10 sm:w-10"
            title="Picture in Picture"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm sm:text-base truncate">{title}</h2>
            {season && episode && (
              <p className="text-white/70 text-xs truncate">
                S{season} E{episode}{episodeTitle ? ` - ${episodeTitle}` : ''}
              </p>
            )}
          </div>
        </div>
        
        {/* Episode Navigation */}
        {(mediaType === 'tv' || mediaType === 'anime') && (
          <div className="flex items-center gap-1 shrink-0">
            {hasPrevEpisode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevEpisode}
                className="text-white hover:bg-white/20 gap-1 h-8 px-2 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </Button>
            )}
            {hasNextEpisode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNextEpisode}
                className="text-white hover:bg-white/20 gap-1 h-8 px-2 text-xs"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-none">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/70 text-sm">Loading player...</p>
          </div>
        </div>
      )}

      {/* Video iframe - takes remaining space */}
      <iframe
        ref={iframeRef}
        src={getEmbedUrl()}
        className={cn(
          "relative z-0 flex-1 w-full border-0",
          loading && "opacity-0"
        )}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        onLoad={handleIframeLoad}
      />
    </div>
  );
}
