import { Link } from "react-router-dom";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 mt-20 pb-24 md:pb-0">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 click-scale">
            <div className="w-8 h-8 rounded-xl bg-blue-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-sm font-bold text-primary-foreground">K</span>
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              Knight
            </span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/films" className="hover:text-primary transition-colors">Films</Link>
            <Link to="/diary" className="hover:text-primary transition-colors">Diary</Link>
            <Link to="/lists" className="hover:text-primary transition-colors">Lists</Link>
          </nav>

          {/* Social */}
          <div className="flex items-center gap-2">
            <a 
              href="#" 
              className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all click-scale"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="#" 
              className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all click-scale"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Knight. Made with love for cinema.</p>
        </div>
      </div>
    </footer>
  );
}
