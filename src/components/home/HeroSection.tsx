import { Button } from "@/components/ui/button";
import { Film, BookOpen, Star, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { films } from "@/data/films";

export function HeroSection() {
  const featuredFilm = films[2]; // Dune: Part Two

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={featuredFilm.backdrop}
          alt={featuredFilm.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
        {/* Peach gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl space-y-8 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-peach-gradient rounded-full px-4 py-2 shadow-lg shadow-primary/20 animate-float">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-semibold text-primary-foreground">Your Film Journey</span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-[1.1]">
              Track films you've{" "}
              <span className="text-peach-gradient">watched.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
              Save those you want to see. Rate, review, and build your personal film diary.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-2">
            {[
              { value: "247", label: "Films logged" },
              { value: "52", label: "This year" },
              { value: "8", label: "Lists" },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100 + 300}ms` }}
              >
                <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/films">
              <Button variant="peach" size="xl" className="gap-2 shadow-lg animate-pulse-glow">
                <Film className="w-5 h-5" />
                Browse Films
              </Button>
            </Link>
            <Link to="/diary">
              <Button variant="glass" size="xl" className="gap-2">
                <BookOpen className="w-5 h-5" />
                View Diary
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Film Card */}
      <div className="absolute right-8 bottom-16 hidden lg:block animate-fade-in" style={{ animationDelay: "400ms" }}>
        <Link to={`/film/${featuredFilm.id}`} className="block group click-scale">
          <div className="relative w-44 rounded-2xl overflow-hidden film-card-shadow transition-all duration-500 group-hover:scale-105 hover-glow">
            <img
              src={featuredFilm.poster}
              alt={featuredFilm.title}
              className="w-full aspect-[2/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-bold text-foreground">{featuredFilm.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="mt-3 text-right">
            <p className="text-sm font-semibold text-foreground">{featuredFilm.title}</p>
            <p className="text-xs text-muted-foreground">{featuredFilm.year}</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
