import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ChevronLeft, Film, Tv } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { FilmCard } from "@/components/films/FilmCard";
import { cn } from "@/lib/utils";

type FilmographyItem = {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  poster: string | null;
  rating: number;
  mediaType: 'movie' | 'tv';
};

type PersonResult = {
  person: {
    id: number;
    name: string;
    profile: string | null;
    biography: string;
    department: string;
  };
  filmography: FilmographyItem[];
};

type FilterType = 'all' | 'movies' | 'tv';

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<PersonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const personId = Number(id);
        const { data, error } = await supabase.functions.invoke('tmdb', {
          body: { action: 'getPersonDetail', personId },
        });
        if (error) throw error;
        setData(data as PersonResult);
      } catch (e) {
        console.error('Error fetching person:', e);
        setError('Failed to load filmography');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const movies = useMemo(
    () => (data?.filmography || []).filter((i) => i.mediaType === 'movie'),
    [data]
  );
  const tv = useMemo(
    () => (data?.filmography || []).filter((i) => i.mediaType === 'tv'),
    [data]
  );
  
  const filteredContent = useMemo(() => {
    if (filter === 'movies') return movies;
    if (filter === 'tv') return tv;
    return data?.filmography || [];
  }, [data, filter, movies, tv]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-display text-foreground mb-4">{error || 'Not found'}</h1>
              <Button variant="blue" onClick={() => navigate(-1)}>Go back</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grain">
      <AppHeader />
      
      {/* Hero Section with Profile */}
      <section className="relative pt-20 pb-8">
        <div className="absolute inset-0 h-64 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Button variant="glass" size="sm" className="gap-2 mb-6" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex flex-col items-center text-center">
            {/* Profile Image */}
            <div className="w-36 h-36 rounded-full overflow-hidden bg-secondary ring-4 ring-background shadow-2xl mb-4">
              {data.person.profile ? (
                <img
                  src={data.person.profile}
                  alt={data.person.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                  {data.person.name.charAt(0)}
                </div>
              )}
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{data.person.name}</h1>
            {data.person.department && (
              <p className="text-primary font-medium mt-1">{data.person.department}</p>
            )}
            {data.person.biography && (
              <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl text-sm">
                {data.person.biography.length > 300 
                  ? `${data.person.biography.slice(0, 300)}...` 
                  : data.person.biography}
              </p>
            )}
            
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 mt-6">
              <Button
                variant={filter === 'all' ? 'blue' : 'glass'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({(data.filmography || []).length})
              </Button>
              <Button
                variant={filter === 'movies' ? 'blue' : 'glass'}
                size="sm"
                className="gap-2"
                onClick={() => setFilter('movies')}
              >
                <Film className="w-4 h-4" />
                Films ({movies.length})
              </Button>
              <Button
                variant={filter === 'tv' ? 'blue' : 'glass'}
                size="sm"
                className="gap-2"
                onClick={() => setFilter('tv')}
              >
                <Tv className="w-4 h-4" />
                TV Shows ({tv.length})
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filmography Grid */}
      <main className="pb-16">
        <div className="container mx-auto px-4">
          {filteredContent.length > 0 ? (
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
              {filteredContent.map((item) => (
                <FilmCard
                  key={`${item.mediaType}-${item.id}`}
                  film={item}
                  size="sm"
                  showRating
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No filmography available.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
