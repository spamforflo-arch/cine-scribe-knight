import { Link } from "react-router-dom";
import { Plus, Heart } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { userLists, getFilmById } from "@/data/films";

const Lists = () => {
  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 animate-fade-in">
            <div className="space-y-2">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                Lists
              </h1>
              <p className="text-lg text-muted-foreground">
                Curated collections of films for every mood and occasion.
              </p>
            </div>
            <Button variant="cinema" size="lg" className="gap-2 w-fit">
              <Plus className="w-5 h-5" />
              Create New List
            </Button>
          </div>

          {/* Your Lists */}
          <section className="mb-16">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
              Your Lists
            </h2>
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't created any lists yet.</p>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create your first list
              </Button>
            </div>
          </section>

          {/* Popular Lists */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
              Popular Lists
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {userLists.map((list, index) => {
                const previewFilms = list.filmIds.slice(0, 5).map(id => getFilmById(id)).filter(Boolean);

                return (
                  <Link
                    key={list.id}
                    to={`/list/${list.id}`}
                    className="group glass rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Film Previews */}
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 flex">
                        {previewFilms.slice(0, 4).map((film, idx) => (
                          <div
                            key={film!.id}
                            className="flex-1 relative"
                          >
                            <img
                              src={film!.poster}
                              alt={film!.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                          </div>
                        ))}
                      </div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                      
                      {/* Count Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm font-medium text-foreground">
                        {list.filmIds.length} films
                      </div>
                    </div>

                    {/* List Info */}
                    <div className="p-6 space-y-2">
                      <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {list.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {list.description}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-muted-foreground">
                          by <span className="text-foreground">{list.createdBy}</span>
                        </span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="w-4 h-4" />
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
