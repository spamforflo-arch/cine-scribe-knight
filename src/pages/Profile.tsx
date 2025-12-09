import { Link } from "react-router-dom";
import { Settings, Film, Heart, BookOpen, ListVideo, Star, Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FilmCard } from "@/components/films/FilmCard";
import { films, diaryEntries, getFilmById } from "@/data/films";
import { cn } from "@/lib/utils";
import { useState } from "react";

const tabs = [
  { id: "films", label: "Films", icon: Film },
  { id: "diary", label: "Diary", icon: BookOpen },
  { id: "lists", label: "Lists", icon: ListVideo },
  { id: "likes", label: "Likes", icon: Heart },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("films");

  const watchedFilms = films.slice(0, 6);
  const likedFilms = films.slice(0, 4);

  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="glass rounded-2xl p-8 mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/20 glow">
                  <img
                    src="https://i.pravatar.cc/200?img=4"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-primary-foreground fill-current" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h1 className="font-display text-3xl font-bold text-foreground">
                    CinemaEnthusiast
                  </h1>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium w-fit">
                    Pro Member
                  </span>
                </div>
                <p className="text-muted-foreground max-w-xl">
                  Film lover, arthouse devotee. Always chasing the next great story on screen.
                  Based in San Francisco.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined March 2023
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
                <Button variant="cinema">Edit Profile</Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t border-border">
              {[
                { label: "Films", value: "247" },
                { label: "This Year", value: "52" },
                { label: "Lists", value: "8" },
                { label: "Following", value: "142" },
                { label: "Followers", value: "89" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === "films" && (
              <section className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      Recently Watched
                    </h2>
                    <Link to="/diary" className="text-sm text-primary hover:underline">
                      View all
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-4 md:gap-6">
                    {watchedFilms.map((film) => (
                      <FilmCard key={film.id} film={film} size="md" showActions={false} />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Favorite Films
                  </h2>
                  <div className="flex flex-wrap gap-4 md:gap-6">
                    {likedFilms.map((film) => (
                      <FilmCard key={film.id} film={film} size="md" showActions={false} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === "diary" && (
              <section>
                <div className="glass rounded-xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    Your Film Diary
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {diaryEntries.length} entries this year
                  </p>
                  <Link to="/diary">
                    <Button variant="cinema">View Full Diary</Button>
                  </Link>
                </div>
              </section>
            )}

            {activeTab === "lists" && (
              <section>
                <div className="glass rounded-xl p-8 text-center">
                  <ListVideo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    Your Lists
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create lists to organize your favorite films
                  </p>
                  <Link to="/lists">
                    <Button variant="cinema">View Lists</Button>
                  </Link>
                </div>
              </section>
            )}

            {activeTab === "likes" && (
              <section>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Films You've Liked
                </h2>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  {likedFilms.map((film) => (
                    <FilmCard key={film.id} film={film} size="md" showActions={false} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
