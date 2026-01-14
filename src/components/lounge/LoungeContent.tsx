import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoungeRow } from "./LoungeRow";
import { Plus, Sofa } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoungePlayer } from "./LoungePlayer";

interface LoungeItem {
  id: string;
  tmdb_id: number;
  title: string;
  year: number | null;
  poster_url: string | null;
  genre: string;
  media_type: string;
  list_id: string | null;
}

interface LoungeList {
  id: string;
  name: string;
}

interface LoungeContentProps {
  onAddContent: () => void;
}

export function LoungeContent({ onAddContent }: LoungeContentProps) {
  const [items, setItems] = useState<LoungeItem[]>([]);
  const [lists, setLists] = useState<LoungeList[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingItem, setPlayingItem] = useState<LoungeItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, listsRes] = await Promise.all([
        supabase.from("lounge_items").select("*").order("created_at", { ascending: false }),
        supabase.from("lounge_lists").select("*").order("name"),
      ]);

      if (itemsRes.data) setItems(itemsRes.data);
      if (listsRes.data) setLists(listsRes.data);
    } catch (error) {
      console.error("Failed to fetch lounge data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("lounge_items").delete().eq("id", id);
    setItems(items.filter(item => item.id !== id));
  };

  const handlePlay = (item: LoungeItem) => {
    setPlayingItem(item);
  };

  // Group items by genre
  const genreGroups = items.reduce((acc, item) => {
    const key = item.genre;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, LoungeItem[]>);

  // Group items by custom list
  const listGroups = lists.map(list => ({
    list,
    items: items.filter(item => item.list_id === list.id),
  })).filter(group => group.items.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Sofa className="w-16 h-16 text-muted-foreground/50" />
        <p className="text-muted-foreground text-center">Your lounge is empty</p>
        <Button variant="blue" onClick={onAddContent} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Your First Content
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Custom Lists First */}
      {listGroups.map(({ list, items: listItems }) => (
        <LoungeRow
          key={`list-${list.id}`}
          title={list.name}
          items={listItems}
          onPlay={handlePlay}
          onDelete={handleDelete}
          isCustomList
        />
      ))}

      {/* Genre Sections */}
      {Object.entries(genreGroups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([genre, genreItems]) => (
          <LoungeRow
            key={`genre-${genre}`}
            title={genre}
            items={genreItems}
            onPlay={handlePlay}
            onDelete={handleDelete}
          />
        ))}

      {/* Player Modal */}
      {playingItem && (
        <LoungePlayer
          item={playingItem}
          open={!!playingItem}
          onClose={() => setPlayingItem(null)}
        />
      )}
    </div>
  );
}
