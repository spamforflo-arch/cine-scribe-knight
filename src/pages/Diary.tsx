import { Link } from "react-router-dom";
import { Calendar, Heart, RotateCcw, Film } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StarRating } from "@/components/films/StarRating";
import { diaryEntries, getFilmById } from "@/data/films";
import { Button } from "@/components/ui/button";

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
      
      <main className="pt-24 pb-28 md:pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="space-y-4 mb-10 animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Your Diary
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Every film you've watched. Your personal cinema journey.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { label: "Films this year", value: diaryEntries.length },
              { label: "Hours watched", value: "47" },
              { label: "Reviews", value: "4" },
              { label: "Avg. rating", value: "4.2" },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="glass rounded-2xl p-4 text-center animate-fade-in click-bounce hover:border-primary/30 transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Diary Entries */}
          <div className="space-y-10">
            {Object.entries(groupedEntries).map(([monthKey, { label, entries }], groupIndex) => (
              <section 
                key={monthKey} 
                className="animate-fade-in"
                style={{ animationDelay: `${groupIndex * 100}ms` }}
              >
                <h2 className="font-display text-xl font-semibold text-foreground mb-5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl blue-gradient flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  {label}
                </h2>

                <div className="space-y-3">
                  {entries.map((entry, index) => {
                    const film = getFilmById(entry.filmId);
                    if (!film) return null;

                    const date = new Date(entry.date);

                    return (
                      <Link
                        key={entry.id}
                        to={`/film/${film.id}`}
                        className="group glass rounded-2xl p-4 flex gap-4 transition-all duration-300 hover:border-primary/30 animate-fade-in click-bounce block"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        {/* Date */}
                        <div className="w-14 text-center shrink-0">
                          <p className="text-2xl font-display font-bold text-foreground">
                            {date.getDate()}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                        </div>

                        {/* Film Poster */}
                        <div className="shrink-0">
                          <div className="w-14 rounded-xl overflow-hidden film-card-shadow transition-transform group-hover:scale-105">
                            <img
                              src={film.poster}
                              alt={film.title}
                              className="w-full aspect-[2/3] object-cover"
                            />
                          </div>
                        </div>

                        {/* Entry Details */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                                {film.title}
                                <span className="text-muted-foreground font-normal ml-2 text-sm">{film.year}</span>
                              </h3>
                              <p className="text-xs text-muted-foreground">{film.director}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {entry.rewatch && (
                                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center" title="Rewatch">
                                  <RotateCcw className="w-3 h-3 text-muted-foreground" />
                                </div>
                              )}
                              {entry.liked && (
                                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                                  <Heart className="w-3 h-3 text-destructive fill-destructive" />
                                </div>
                              )}
                            </div>
                          </div>

                          {entry.rating && (
                            <StarRating rating={entry.rating} size="sm" />
                          )}

                          {entry.review && (
                            <p className="text-xs text-muted-foreground line-clamp-1 pt-0.5">
                              {entry.review}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Empty State */}
          {diaryEntries.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-5">
                <Film className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Your diary is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Start tracking films to build your cinema history.
              </p>
              <Link to="/films">
                <Button variant="blue">Browse Films</Button>
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
