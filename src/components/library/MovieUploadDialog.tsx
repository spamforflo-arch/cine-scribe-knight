import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GENRES = [
  "Action",
  "Adventure", 
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
  "Uncategorized"
];

interface MovieUploadDialogProps {
  onMovieAdded: () => void;
}

export function MovieUploadDialog({ onMovieAdded }: MovieUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Uncategorized");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !videoFile) {
      toast.error("Please provide a title and video file");
      return;
    }

    setLoading(true);

    try {
      // Upload video
      const videoFileName = `${Date.now()}-${videoFile.name}`;
      const { data: videoData, error: videoError } = await supabase.storage
        .from("movies")
        .upload(`videos/${videoFileName}`, videoFile);

      if (videoError) throw videoError;

      const { data: videoUrlData } = supabase.storage
        .from("movies")
        .getPublicUrl(`videos/${videoFileName}`);

      let posterUrl = null;

      // Upload poster if provided
      if (posterFile) {
        const posterFileName = `${Date.now()}-${posterFile.name}`;
        const { error: posterError } = await supabase.storage
          .from("movies")
          .upload(`posters/${posterFileName}`, posterFile);

        if (posterError) throw posterError;

        const { data: posterUrlData } = supabase.storage
          .from("movies")
          .getPublicUrl(`posters/${posterFileName}`);
        
        posterUrl = posterUrlData.publicUrl;
      }

      // Save movie metadata
      const { error: dbError } = await supabase.from("user_movies").insert({
        title,
        genre,
        description: description || null,
        year: year ? parseInt(year) : null,
        video_url: videoUrlData.publicUrl,
        poster_url: posterUrl,
      });

      if (dbError) throw dbError;

      toast.success("Movie added to your library!");
      setOpen(false);
      resetForm();
      onMovieAdded();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload movie");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setGenre("Uncategorized");
    setDescription("");
    setYear("");
    setVideoFile(null);
    setPosterFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="blue" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Movie
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Movie to Library</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Movie title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Release year"
              min="1900"
              max="2099"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Video File *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-primary/10 file:text-primary file:text-sm"
                required
              />
            </div>
            {videoFile && (
              <p className="text-xs text-muted-foreground">{videoFile.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="poster">Poster Image (optional)</Label>
            <Input
              id="poster"
              type="file"
              accept="image/*"
              onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
              className="file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-primary/10 file:text-primary file:text-sm"
            />
            {posterFile && (
              <p className="text-xs text-muted-foreground">{posterFile.name}</p>
            )}
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Movie
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
