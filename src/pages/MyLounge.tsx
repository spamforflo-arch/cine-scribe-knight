import { useState, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { LoungeContent } from "@/components/lounge/LoungeContent";
import { AddContentDialog } from "@/components/lounge/AddContentDialog";
import { MoreVertical, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MyLounge = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleContentAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background grain flex flex-col">
      <AppHeader />
      <main className="flex-1 pt-14">
        <div className="container mx-auto px-4 py-6">
          {/* Header with menu */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">My Lounge</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Lounge Content */}
          <LoungeContent key={refreshKey} onAddContent={() => setShowAddDialog(true)} />
        </div>
      </main>

      {/* Add Content Dialog */}
      <AddContentDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onContentAdded={handleContentAdded}
      />
    </div>
  );
};

export default MyLounge;
