import { Button } from "@/components/ui/button";
import { Compass, BookOpen, Tv } from "lucide-react";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-background grain flex flex-col">
      <AppHeader />
      <main className="flex-1 pt-14">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="flex flex-col items-center justify-center gap-8 animate-fade-in py-12">
            {/* Logo */}
            <div className="w-24 h-24 rounded-3xl blue-gradient flex items-center justify-center shadow-2xl shadow-primary/40 animate-float blue-glow">
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground text-center">
              Cinestop
            </h1>

            <p className="text-muted-foreground text-center max-w-md">
              Made With Love for Cinema &lt;3
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
              <Link to="/self-streaming">
                <Button variant="glass" size="xl" className="gap-3 min-w-[200px] click-scale">
                  <Tv className="w-6 h-6" />
                  Self Streaming
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
