import { Link } from "react-router-dom";
import { Calendar, Heart, RotateCcw } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StarRating } from "@/components/films/StarRating";
import { diaryEntries, getFilmById } from "@/data/films";
import { cn } from "@/lib/utils";

const Diary = () => {
  // Group entries by month
  const groupedEntries = diaryEntries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { label: monthLabel, entries: [] };
    }
    acc[monthKey].entries.push(entry);
    return acc;
  }, {} as Record<string, { label: string; entries: typeof diaryEntries }>);

  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="space-y-6 mb-12 animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Your Diary
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A chronological record of every film you've watched. Your personal cinema journey.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Films this year", value: diaryEntries.length },
              { label: "Hours watched", value: "47" },
              { label: "Reviews written", value: "4" },
              { label: "Highest rated", value: "Dune: Part Two" },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="glass rounded-xl p-4 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Diary Entries */}
          <div className="space-y-12">
            {Object.entries(groupedEntries).map(([monthKey, { label, entries }], groupIndex) => (
              <section 
                key={monthKey} 
                className="animate-fade-in"
                style={{ animationDelay: `${groupIndex * 100}ms` }}
              >
                <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {label}
                </h2>

                <div className="space-y-4">
                  {entries.map((entry, index) => {
                    const film = getFilmById(entry.filmId);
                    if (!film) return null;

                    const date = new Date(entry.date);

                    return (
                      <article 
                        key={entry.id}
                        className="group glass rounded-xl p-4 flex gap-4 transition-all duration-300 hover:border-primary/30 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Date */}
                        <div className="w-16 text-center shrink-0">
                          <p className="text-3xl font-display font-bold text-foreground">
                            {date.getDate()}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                        </div>

                        {/* Film Poster */}
                        <Link to={`/film/${film.id}`} className="shrink-0">
                          <div className="w-16 rounded-lg overflow-hidden film-card-shadow transition-transform group-hover:scale-105">
                            <img
                              src={film.poster}
                              alt={film.title}
                              className="w-full aspect-[2/3] object-cover"
                            />
                          </div>
                        </Link>

                        {/* Entry Details */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link to={`/film/${film.id}`}>
                                <h3 className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors">
                                  {film.title}
                                  <span className="text-muted-foreground font-normal ml-2">{film.year}</span>
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground">{film.director}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              {entry.rewatch && (
                                <div className="flex items-center gap-1 text-muted-foreground" title="Rewatch">
                                  <RotateCcw className="w-4 h-4" />
                                </div>
                              )}
                              {entry.liked && (
                                <Heart className="w-4 h-4 text-destructive fill-destructive" />
                              )}
                              {entry.rating && (
                                <StarRating rating={entry.rating} size="sm" />
                              )}
                            </div>
                          </div>

                          {entry.review && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {entry.review}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Empty State */}
          {diaryEntries.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Your diary is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Start tracking the films you watch to build your cinema history.
              </p>
              <Link to="/films">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Browse Films
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Diary;
