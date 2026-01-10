import { Play, Trash2, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

interface SeriesCardProps {
  series: UserSeries;
  onDelete: () => void;
  onPlay: (series: UserSeries) => void;
}

export function SeriesCard({ series, onDelete, onPlay }: SeriesCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Delete "${series.title}" and all its episodes?`)) return;

    try {
      // Delete from storage (episodes will cascade)
      for (const ep of series.episodes) {
        const path = ep.video_url.split('/movies/')[1];
        if (path) {
          await supabase.storage.from('movies').remove([path]);
        }
      }

      // Delete series (episodes cascade)
      const { error } = await supabase
        .from("user_series")
        .delete()
        .eq("id", series.id);

      if (error) throw error;

      toast.success("Series deleted");
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete series");
    }
  };

  // Count episodes and seasons
  const episodeCount = series.episodes?.length || 0;
  const seasons = [...new Set(series.episodes?.map(e => e.season_number) || [])];
  const seasonCount = seasons.length;

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onPlay(series)}
    >
      {/* Poster */}
      <div className="relative rounded-xl overflow-hidden film-card-shadow aspect-[2/3] bg-muted">
        {series.poster_url ? (
          <img
            src={series.poster_url}
            alt={series.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Tv className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* TV Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 text-primary-foreground text-xs font-medium rounded">
          TV
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <Button
            variant="blue"
            size="sm"
            className="gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(series);
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            Play
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 space-y-0.5">
        <p className="font-medium text-sm text-foreground truncate">{series.title}</p>
        <p className="text-xs text-muted-foreground">
          {series.year && `${series.year} • `}
          {seasonCount} Season{seasonCount !== 1 ? 's' : ''} • {episodeCount} Ep{episodeCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}