import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 mt-20 pb-24 md:pb-0">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 click-scale">
            <div className="w-8 h-8 rounded-xl blue-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              Cinestop
            </span>
          </Link>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Cinestop. Made with love for cinema.</p>
        </div>
      </div>
    </footer>
  );
}
