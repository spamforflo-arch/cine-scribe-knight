import { Link } from "react-router-dom";
import { Film, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cinema-warm flex items-center justify-center shadow-lg shadow-primary/30">
                <Film className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-semibold text-foreground">
                Knight
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your personal film diary. Track, review, and discover.
            </p>
          </div>

          {/* Browse */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Browse</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/films" className="hover:text-primary transition-colors">Films</Link></li>
              <li><Link to="/lists" className="hover:text-primary transition-colors">Lists</Link></li>
              <li><Link to="/members" className="hover:text-primary transition-colors">Members</Link></li>
            </ul>
          </div>

          {/* Your Account */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/profile" className="hover:text-primary transition-colors">Profile</Link></li>
              <li><Link to="/diary" className="hover:text-primary transition-colors">Diary</Link></li>
              <li><Link to="/watchlist" className="hover:text-primary transition-colors">Watchlist</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Connect</h4>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Knight. Made with love for cinema.</p>
        </div>
      </div>
    </footer>
  );
}
