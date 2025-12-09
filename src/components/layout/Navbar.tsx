import { Link, useLocation } from "react-router-dom";
import { Search, User, Film, BookOpen, ListVideo, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/films", label: "Films", icon: Film },
  { href: "/diary", label: "Diary", icon: BookOpen },
  { href: "/lists", label: "Lists", icon: ListVideo },
];

export function Navbar() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cinema-warm flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <Film className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              Knight
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.href} to={link.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "gap-2 text-muted-foreground hover:text-foreground",
                      isActive && "text-primary bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Link to="/search">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="glass" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
