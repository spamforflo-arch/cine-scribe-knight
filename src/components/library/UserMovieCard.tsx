import { useState, useEffect } from "react";
import { Play, Trash2, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getProgressForContent, SelfStreamingProgress } from "@/lib/selfStreamingProgress";
import { Progress } from "@/components/ui/progress";

interface UserMovie {
  id: string;
  title: string;
  genre: string;
  poster_url: string | null;
  video_url: string;
  description: string | null;
  year: number | null;
}

interface UserMovieCardProps {
  movie: UserMovie;
  onDelete: () => void;
  onPlay: (movie: UserMovie) => void;
}

export function UserMovieCard({ movie, onDelete, onPlay }: UserMovieCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [watchProgress, setWatchProgress] = useState<SelfStreamingProgress | null>(null);

  useEffect(() => {
    const progress = getProgressForContent(movie.id);
    if (progress) {
      setWatchProgress(progress);
    }
  }, [movie.id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete from database
      const { error } = await supabase
        .from("user_movies")
        .delete()
        .eq("id", movie.id);

      if (error) throw error;

      toast.success("Movie removed from library");
      onDelete();
    } catch (error: any) {
      toast.error("Failed to delete movie");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="group flex flex-col">
        <div
          className={cn(
            "relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer",
            "bg-card/50 border border-border/50",
            "transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
          )}
          onClick={() => onPlay(movie)}
        >
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Film className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Progress bar at bottom */}
          {watchProgress && watchProgress.progress > 0 && watchProgress.progress < 95 && (
            <div className="absolute bottom-0 left-0 right-0">
              <Progress value={watchProgress.progress} className="h-1 rounded-none bg-black/50" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
            >
              <Play className="w-6 h-6" />
            </button>
            <button
              className="p-3 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Year badge */}
          {movie.year && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-xs text-white">
              {movie.year}
            </div>
          )}
        </div>

        <div className="mt-2 px-1">
          <h3 className="font-medium text-sm text-foreground truncate">
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground">{movie.genre}</p>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Movie</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{movie.title}" from your library?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
