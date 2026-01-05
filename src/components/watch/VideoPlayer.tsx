import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, PictureInPicture2, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveWatchProgress, WatchProgress } from "@/lib/watchProgress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface StreamingSource {
  id: string;
  name: string;
  url?: string;
  type: 'embed' | 'external';
  quality?: string;
}

const EMBED_SOURCES: StreamingSource[] = [
  { id: 'vidsrcnme', name: 'VidSrc NME', type: 'embed' },
  { id: 'vidking', name: 'VidKing', type: 'embed' },
];

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
  const [selectedSource, setSelectedSource] = useState<string>('vidsrcnme');
  const [watchmodeSources, setWatchmodeSources] = useState<StreamingSource[]>([]);
  const [loadingWatchmode, setLoadingWatchmode] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Fetch Watchmode streaming sources
  useEffect(() => {
    const fetchWatchmodeSources = async () => {
      setLoadingWatchmode(true);
      try {
        const { data, error } = await supabase.functions.invoke('streaming-sources', {
          body: { tmdbId, mediaType: mediaType === 'anime' ? 'tv' : mediaType }
        });

        if (error) {
          console.error('Error fetching Watchmode sources:', error);
        } else if (data?.sources?.length > 0) {
          const sources: StreamingSource[] = data.sources.map((s: any, i: number) => ({
            id: `watchmode-${i}`,
            name: s.name,
            url: s.url,
            type: 'external' as const,
            quality: s.quality,
          }));
          setWatchmodeSources(sources);
        }
      } catch (err) {
        console.error('Failed to fetch Watchmode sources:', err);
      } finally {
        setLoadingWatchmode(false);
      }
    };

    fetchWatchmodeSources();
  }, [tmdbId, mediaType]);

  // Build embed URL based on selected source
  const getEmbedUrl = useCallback(() => {
    const s = season || 1;
    const e = episode || 1;

    switch (selectedSource) {
      case 'vidsrcnme':
        if (mediaType === 'movie') {
          return `https://vidsrcnme.ru/embed/movie/${tmdbId}`;
        } else {
          return `https://vidsrcnme.ru/embed/tv/${tmdbId}/${s}/${e}`;
        }
      case 'vidking':
        if (mediaType === 'movie') {
          return `https://vidking.net/embed/movie/${tmdbId}`;
        } else {
          return `https://vidking.net/embed/tv/${tmdbId}/${s}/${e}`;
        }
      default:
        // Check if it's a Watchmode external source
        const watchmodeSource = watchmodeSources.find(src => src.id === selectedSource);
        if (watchmodeSource?.url) {
          return watchmodeSource.url;
        }
        // Fallback to vidsrcnme
        if (mediaType === 'movie') {
          return `https://vidsrcnme.ru/embed/movie/${tmdbId}`;
        } else {
          return `https://vidsrcnme.ru/embed/tv/${tmdbId}/${s}/${e}`;
        }
    }
  }, [mediaType, tmdbId, season, episode, selectedSource, watchmodeSources]);

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

  const handleSourceChange = (sourceId: string) => {
    setLoading(true);
    setSelectedSource(sourceId);
  };

  // Check if selected source is external (Watchmode)
  const isExternalSource = watchmodeSources.some(s => s.id === selectedSource);

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

  const allSources = [...EMBED_SOURCES, ...watchmodeSources];
  const currentSource = allSources.find(s => s.id === selectedSource);

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
          
          {/* Source Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20 gap-2"
              >
                <Settings className="w-4 h-4" />
                {currentSource?.name || 'Select Source'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-sm">
              <DropdownMenuLabel>Embed Sources</DropdownMenuLabel>
              {EMBED_SOURCES.map((source) => (
                <DropdownMenuItem
                  key={source.id}
                  onClick={() => handleSourceChange(source.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{source.name}</span>
                  {selectedSource === source.id && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              ))}
              
              {watchmodeSources.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>
                    Watchmode Sources
                    {loadingWatchmode && <span className="text-xs text-muted-foreground ml-2">(loading...)</span>}
                  </DropdownMenuLabel>
                  {watchmodeSources.map((source) => (
                    <DropdownMenuItem
                      key={source.id}
                      onClick={() => handleSourceChange(source.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span>{source.name} {source.quality && `(${source.quality})`}</span>
                      {selectedSource === source.id && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              
              {!loadingWatchmode && watchmodeSources.length === 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    No Watchmode sources available
                  </DropdownMenuLabel>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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

      {/* Video iframe or external link */}
      {isExternalSource ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white mb-4">This source opens in a new tab</p>
            <Button
              onClick={() => window.open(getEmbedUrl(), '_blank')}
              className="bg-primary hover:bg-primary/90"
            >
              Watch on {currentSource?.name}
            </Button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
