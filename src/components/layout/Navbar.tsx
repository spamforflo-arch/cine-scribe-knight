import { Link, useLocation } from "react-router-dom";
import { Search, Film, BookOpen, ListVideo, Home } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group click-scale"
          >
            <div className="w-9 h-9 rounded-xl blue-gradient flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all group-hover:scale-105">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              Cinestop
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
                    size="sm"
                    className={cn(
                      "gap-2 text-muted-foreground hover:text-foreground click-bounce",
                      isActive && "text-primary bg-primary/10 hover:text-primary hover:bg-primary/15"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Search */}
          <Link to="/search">
            <Button variant="icon" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
        </nav>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border/30 px-2 py-2 z-50">
        <div className="flex items-center justify-around">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} to={link.href} className="click-scale">
                <div className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  <div className={cn(
                    "p-2 rounded-xl transition-all",
                    isActive && "bg-primary/15"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
