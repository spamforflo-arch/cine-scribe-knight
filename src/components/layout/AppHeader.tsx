import { Link } from "react-router-dom";
import { Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function AppHeader() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Home Button - Blue Gradient Logo (no text) */}
        <Link to="/" className="click-scale">
          <div className="w-10 h-10 rounded-xl blue-gradient flex items-center justify-center shadow-lg shadow-primary/30">
          </div>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <Link to="/search">
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
          
          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-secondary"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
