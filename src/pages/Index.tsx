import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FilmGrid } from "@/components/films/FilmGrid";
import { films } from "@/data/films";

const Index = () => {
  const trendingFilms = films.slice(0, 8);
  const recentlyWatched = films.slice(2, 6);

  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main>
        <HeroSection />
        
        <div className="container mx-auto px-4 py-12 space-y-12">
          {/* Trending Films */}
          <FilmGrid 
            films={trendingFilms} 
            title="Trending This Week"
            showViewAll
            viewAllLink="/films"
          />

          {/* Recently Watched */}
          <FilmGrid 
            films={recentlyWatched} 
            title="Recently Watched"
            cardSize="lg"
          />

          {/* Quick Tip */}
          <div className="glass rounded-2xl p-6 text-center animate-fade-in">
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">Tip:</span> Hold any film poster to quickly add to watchlist, mark as watched, or rate it!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
