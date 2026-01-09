import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  if (!movie) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              {movie.title} {movie.year && `(${movie.year})`}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="aspect-video bg-black">
          <video
            src={movie.video_url}
            controls
            autoPlay
            className="w-full h-full"
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
