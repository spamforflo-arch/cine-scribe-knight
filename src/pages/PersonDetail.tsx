import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { FilmCard } from "@/components/films/FilmCard";

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

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<PersonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="glass" size="sm" className="gap-2" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          <header className="flex flex-col sm:flex-row gap-6 sm:items-start mb-10">
            <div className="shrink-0">
              <div className="w-32 h-32 rounded-3xl overflow-hidden bg-secondary">
                {data.person.profile ? (
                  <img
                    src={data.person.profile}
                    alt={data.person.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-4xl font-bold text-foreground">{data.person.name}</h1>
              {data.person.department && (
                <p className="text-muted-foreground mt-1">{data.person.department}</p>
              )}
              {data.person.biography && (
                <p className="text-muted-foreground mt-4 leading-relaxed max-w-3xl">
                  {data.person.biography}
                </p>
              )}
            </div>
          </header>

          {movies.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">Movies</h2>
              <div className="flex flex-wrap gap-4 md:gap-6 justify-center sm:justify-start">
                {movies.map((item) => (
                  <FilmCard
                    key={`${item.mediaType}-${item.id}`}
                    film={item}
                    size="sm"
                    showRating
                  />
                ))}
              </div>
            </section>
          )}

          {tv.length > 0 && (
            <section className="space-y-4 mt-12">
              <h2 className="font-display text-2xl font-bold text-foreground">TV Shows</h2>
              <div className="flex flex-wrap gap-4 md:gap-6 justify-center sm:justify-start">
                {tv.map((item) => (
                  <FilmCard
                    key={`${item.mediaType}-${item.id}`}
                    film={item}
                    size="sm"
                    showRating
                  />
                ))}
              </div>
            </section>
          )}

          {movies.length === 0 && tv.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No filmography available.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
