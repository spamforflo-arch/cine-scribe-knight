import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Compass, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background grain flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-8 animate-fade-in">
            {/* Logo */}
            <div className="w-24 h-24 rounded-3xl blue-gradient flex items-center justify-center shadow-2xl shadow-primary/40 animate-float blue-glow">
              <span className="font-display text-4xl font-bold text-white">C</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground text-center">
              Cinestop
            </h1>

            <p className="text-muted-foreground text-center max-w-md">
              Your personal entertainment diary
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
              <Link to="/browse">
                <Button variant="blue" size="xl" className="gap-3 min-w-[200px] click-scale">
                  <Compass className="w-6 h-6" />
                  Browse
                </Button>
              </Link>
              <Link to="/diary">
                <Button variant="glass" size="xl" className="gap-3 min-w-[200px] click-scale">
                  <BookOpen className="w-6 h-6" />
                  View Diary
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
