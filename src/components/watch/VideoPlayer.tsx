import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Build embed URL based on media type
  const getEmbedUrl = () => {
    const baseUrl = "https://www.vidking.net/embed";
    if (mediaType === 'movie') {
      return `${baseUrl}/movie/${tmdbId}`;
    } else {
      // TV or Anime - include season and episode
      return `${baseUrl}/tv/${tmdbId}/${season || 1}/${episode || 1}`;
    }
  };

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
