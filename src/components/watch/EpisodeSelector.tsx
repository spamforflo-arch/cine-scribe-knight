import { useState, useEffect } from "react";
import { ChevronDown, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getProgressForFilm } from "@/lib/watchProgress";

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number | null;
}

interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
  air_date: string;
}

interface EpisodeSelectorProps {
  tmdbId: number;
  totalSeasons: number;
  onSelectEpisode: (season: number, episode: number, episodeTitle: string) => void;
}

export function EpisodeSelector({ tmdbId, totalSeasons, onSelectEpisode }: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('tmdb', {
          body: { action: 'getSeasonEpisodes', tvId: tmdbId, seasonNumber: selectedSeason }
        });

        if (error) throw error;
        if (data?.episodes) {
          setEpisodes(data.episodes);
        }
      } catch (err) {
        console.error('Error fetching episodes:', err);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [tmdbId, selectedSeason]);

  const seasons = Array.from({ length: totalSeasons }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {/* Season Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Season</span>
        <Select
          value={selectedSeason.toString()}
          onValueChange={(v) => setSelectedSeason(parseInt(v))}
        >
          <SelectTrigger className="w-40 bg-secondary border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border">
            {seasons.map((s) => (
              <SelectItem key={s} value={s.toString()}>
                Season {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Episodes List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : episodes.length > 0 ? (
          episodes.map((ep) => {
            const progress = getProgressForFilm(tmdbId, selectedSeason, ep.episode_number);
            return (
              <button
                key={ep.id}
                onClick={() => onSelectEpisode(selectedSeason, ep.episode_number, ep.name)}
                className="w-full flex items-start gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left group"
              >
                {/* Episode Thumbnail */}
                <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0 bg-muted">
                  {ep.still_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                      alt={ep.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  {/* Progress bar */}
                  {progress && progress.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Episode Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">
                    {ep.episode_number}. {ep.name}
                  </p>
                  {ep.runtime && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ep.runtime} min
                    </p>
                  )}
                  {ep.overview && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {ep.overview}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No episodes available
          </p>
        )}
      </div>
    </div>
  );
}
