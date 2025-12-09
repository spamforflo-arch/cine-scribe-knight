import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FilmGrid } from "@/components/films/FilmGrid";
import { RecentActivity } from "@/components/home/RecentActivity";
import { PopularLists } from "@/components/home/PopularLists";
import { films } from "@/data/films";

const Index = () => {
  const trendingFilms = films.slice(0, 6);

  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main>
        <HeroSection />
        
        <div className="container mx-auto px-4 py-16 space-y-20">
          {/* Trending Films */}
          <FilmGrid 
            films={trendingFilms} 
            title="Trending This Week" 
          />

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <RecentActivity />
            </div>
            <div className="lg:col-span-2">
              <PopularLists />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
