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
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  poster: string | null;
  rating: number;
  mediaType: string;
}

interface LoungeList {
  id: string;
  name: string;
}


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
      // Use mediaType directly from TMDB response
      let mediaType = selectedItem.mediaType || 'movie';
      if (mediaType === 'tv') {
        // Could be anime - for now keep as tv, the TMDB edge function handles this
        mediaType = 'tv';
      }

      const { error } = await supabase.from("lounge_items").insert({
        tmdb_id: selectedItem.tmdbId,
        title: selectedItem.title,
        year: selectedItem.year || null,
        poster_url: selectedItem.poster,
        genre: "Uncategorized", // TMDB doesn't return genre names in search
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
        toast.success(`Added "${selectedItem.title}" to your lounge`);
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
                    key={item.id}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.poster ? (
                      <img
                        src={item.poster.replace('/w500/', '/w92/')}
                        alt=""
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-secondary rounded flex items-center justify-center">
                        {getMediaIcon(item.mediaType)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.year || ''} • {item.mediaType === 'movie' ? 'Movie' : 'TV'}
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
                {selectedItem.poster ? (
                  <img
                    src={selectedItem.poster.replace('/w500/', '/w92/')}
                    alt=""
                    className="w-14 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-14 h-20 bg-secondary rounded flex items-center justify-center">
                    {getMediaIcon(selectedItem.mediaType)}
                  </div>
                )}
                <div>
                  <p className="font-medium">{selectedItem.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.year || ''} • {selectedItem.mediaType === 'movie' ? 'Movie' : 'TV Show'}
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
