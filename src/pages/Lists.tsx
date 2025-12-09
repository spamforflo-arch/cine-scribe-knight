import { Link } from "react-router-dom";
import { Plus, Heart, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { userLists, getFilmById } from "@/data/films";

const Lists = () => {
  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main className="pt-24 pb-28 md:pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 animate-fade-in">
            <div className="space-y-2">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                Lists
              </h1>
              <p className="text-lg text-muted-foreground">
                Curated collections for every mood.
              </p>
            </div>
            <Button variant="peach" size="lg" className="gap-2 w-fit click-scale">
              <Plus className="w-5 h-5" />
              Create List
            </Button>
          </div>

          {/* Your Lists */}
          <section className="mb-12">
            <h2 className="font-display text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Lists
            </h2>
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't created any lists yet.</p>
              <Button variant="glass" className="gap-2 click-scale">
                <Plus className="w-4 h-4" />
                Create your first list
              </Button>
            </div>
          </section>

          {/* Popular Lists */}
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-5">
              Popular Lists
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {userLists.map((list, index) => {
                const previewFilms = list.filmIds.slice(0, 4).map(id => getFilmById(id)).filter(Boolean);

                return (
                  <Link
                    key={list.id}
                    to={`/list/${list.id}`}
                    className="group glass rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 animate-fade-in click-bounce"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {/* Film Previews */}
                    <div className="relative h-40 overflow-hidden">
                      <div className="absolute inset-0 flex">
                        {previewFilms.map((film) => (
                          <div key={film!.id} className="flex-1 relative">
                            <img
                              src={film!.poster}
                              alt={film!.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                      
                      {/* Count Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-peach-gradient rounded-full text-xs font-bold text-primary-foreground shadow-lg">
                        {list.filmIds.length} films
                      </div>
                    </div>

                    {/* List Info */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {list.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {list.description}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">
                          by <span className="text-foreground">{list.createdBy}</span>
                        </span>
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <Heart className="w-3.5 h-3.5 fill-primary" />
                          {list.likes.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Lists;
