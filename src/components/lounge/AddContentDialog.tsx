import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Film, Tv, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchResult {
  id: number;
  title: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type: string;
}

interface LoungeList {
  id: string;
  name: string;
}

// Common genres from TMDB
const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics",
};

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentAdded: () => void;
}

export function AddContentDialog({ open, onOpenChange, onContentAdded }: AddContentDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [adding, setAdding] = useState(false);
  
  // Custom list options
  const [useCustomList, setUseCustomList] = useState(false);
  const [lists, setLists] = useState<LoungeList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  // Fetch existing lists
  useEffect(() => {
    if (open) {
      supabase.from("lounge_lists").select("*").order("name").then(({ data }) => {
        if (data) setLists(data);
      });
    }
  }, [open]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSelectedItem(null);

    try {
      const { data, error } = await supabase.functions.invoke("tmdb", {
        body: { action: "search", query: searchQuery },
      });

      if (error) throw error;
      setResults(data?.results || []);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Failed to search");
    } finally {
      setSearching(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setCreatingList(true);

    try {
      const { data, error } = await supabase
        .from("lounge_lists")
        .insert({ name: newListName.trim() })
        .select()
        .single();

      if (error) throw error;
      
      setLists([...lists, data]);
      setSelectedListId(data.id);
      setNewListName("");
      toast.success(`Created list "${data.name}"`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create list");
    } finally {
      setCreatingList(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedItem) return;
    setAdding(true);

    try {
      // Determine genre from first genre_id
      const genreId = selectedItem.genre_ids?.[0];
      const genre = genreId ? (GENRE_MAP[genreId] || "Uncategorized") : "Uncategorized";

      // Determine media type
      let mediaType = selectedItem.media_type || 'movie';
      if (mediaType === 'tv' && genreId === 16) {
        mediaType = 'anime'; // Treat animated TV as anime
      }

      const title = selectedItem.title || selectedItem.name || "Unknown";
      const year = selectedItem.release_date || selectedItem.first_air_date;
      const yearNum = year ? parseInt(year.split("-")[0]) : null;

      const { error } = await supabase.from("lounge_items").insert({
        tmdb_id: selectedItem.id,
        title,
        year: yearNum,
        poster_url: selectedItem.poster_path
          ? `https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`
          : null,
        genre,
        media_type: mediaType,
        list_id: useCustomList && selectedListId ? selectedListId : null,
      });

      if (error) {
        if (error.message?.includes("duplicate")) {
          toast.error("Already in your lounge");
        } else {
          throw error;
        }
      } else {
        toast.success(`Added "${title}" to your lounge`);
        onContentAdded();
        resetAndClose();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add content");
    } finally {
      setAdding(false);
    }
  };

  const resetAndClose = () => {
    setSearchQuery("");
    setResults([]);
    setSelectedItem(null);
    setUseCustomList(false);
    setSelectedListId("");
    setNewListName("");
    onOpenChange(false);
  };

  const getMediaIcon = (type: string) => {
    return type === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Content to Lounge</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Search movies, TV shows, anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && !selectedItem && (
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-2 space-y-1">
                {results.map((item) => (
                  <button
                    key={`${item.media_type}-${item.id}`}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                        alt=""
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-secondary rounded flex items-center justify-center">
                        {getMediaIcon(item.media_type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.title || item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(item.release_date || item.first_air_date || "").split("-")[0]} • {item.media_type === 'movie' ? 'Movie' : 'TV'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Selected Item */}
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                {selectedItem.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${selectedItem.poster_path}`}
                    alt=""
                    className="w-14 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-14 h-20 bg-secondary rounded flex items-center justify-center">
                    {getMediaIcon(selectedItem.media_type)}
                  </div>
                )}
                <div>
                  <p className="font-medium">{selectedItem.title || selectedItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedItem.release_date || selectedItem.first_air_date || "").split("-")[0]} • {selectedItem.media_type === 'movie' ? 'Movie' : 'TV Show'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-7 text-xs"
                    onClick={() => setSelectedItem(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>

              {/* Custom List Option */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="useCustomList"
                    checked={useCustomList}
                    onCheckedChange={(checked) => setUseCustomList(!!checked)}
                  />
                  <Label htmlFor="useCustomList" className="text-sm cursor-pointer">
                    Add to a custom list
                  </Label>
                </div>

                {useCustomList && (
                  <div className="space-y-3 pl-6">
                    <Select value={selectedListId} onValueChange={setSelectedListId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a list..." />
                      </SelectTrigger>
                      <SelectContent>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">or</span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="New list name..."
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        className="h-9"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCreateList}
                        disabled={!newListName.trim() || creatingList}
                      >
                        {creatingList ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Button */}
              <Button
                variant="blue"
                className="w-full"
                onClick={handleAdd}
                disabled={adding}
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add to Lounge
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
