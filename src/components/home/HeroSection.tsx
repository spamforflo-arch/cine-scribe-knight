import { Button } from "@/components/ui/button";
import { Film, BookOpen, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { films } from "@/data/films";

export function HeroSection() {
  const featuredFilm = films[2]; // Dune: Part Two

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={featuredFilm.backdrop}
          alt={featuredFilm.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl space-y-8 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 backdrop-blur-sm">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">Featured Film</span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Track films you've{" "}
              <span className="text-gradient">watched.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              Save those you want to see. Tell your friends what's good. 
              Your personal film diary awaits.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-2">
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-foreground">2.4M</p>
              <p className="text-sm text-muted-foreground">Films tracked</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-foreground">890K</p>
              <p className="text-sm text-muted-foreground">Reviews written</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-foreground">156K</p>
              <p className="text-sm text-muted-foreground">Lists created</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/films">
              <Button variant="cinema" size="xl" className="gap-2">
                <Film className="w-5 h-5" />
                Browse Films
              </Button>
            </Link>
            <Link to="/diary">
              <Button variant="glass" size="xl" className="gap-2">
                <BookOpen className="w-5 h-5" />
                Start Your Diary
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Film Card */}
      <div className="absolute right-8 bottom-12 hidden lg:block animate-fade-in" style={{ animationDelay: "300ms" }}>
        <Link to={`/film/${featuredFilm.id}`} className="block group">
          <div className="relative w-48 rounded-xl overflow-hidden film-card-shadow transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
            <img
              src={featuredFilm.poster}
              alt={featuredFilm.title}
              className="w-full aspect-[2/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-3 text-right">
            <p className="text-sm font-medium text-foreground">{featuredFilm.title}</p>
            <p className="text-xs text-muted-foreground">{featuredFilm.year}</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
