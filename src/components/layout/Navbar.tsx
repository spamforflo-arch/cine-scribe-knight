import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// Navigation links removed per user request

export function Navbar() {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group click-scale"
          >
            <div className="w-9 h-9 rounded-xl blue-gradient flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all group-hover:scale-105">
            </div>
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              Cinestop
            </span>
          </Link>


          {/* Search */}
          <Link to="/search">
            <Button variant="icon" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
        </nav>
      </div>

    </header>
  );
}
