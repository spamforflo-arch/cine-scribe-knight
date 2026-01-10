-- Create storage bucket for movies (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('movies', 'movies', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to movies bucket
CREATE POLICY "Anyone can upload to movies bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'movies');

-- Allow anyone to read movies bucket
CREATE POLICY "Anyone can read movies bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'movies');

-- Allow anyone to delete their own uploads
CREATE POLICY "Anyone can delete movies"
ON storage.objects
FOR DELETE
USING (bucket_id = 'movies');

-- Create user_series table for TV series
CREATE TABLE IF NOT EXISTS public.user_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT 'Uncategorized',
  poster_url TEXT,
  description TEXT,
  year INTEGER,
  tmdb_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_episodes table for episodes
CREATE TABLE IF NOT EXISTS public.user_episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES public.user_series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL DEFAULT 1,
  episode_number INTEGER NOT NULL DEFAULT 1,
  title TEXT,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(series_id, season_number, episode_number)
);

-- Enable RLS
ALTER TABLE public.user_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_episodes ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_series
CREATE POLICY "Anyone can view user series"
ON public.user_series
FOR SELECT
USING (true);

CREATE POLICY "Anyone can add series"
ON public.user_series
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update series"
ON public.user_series
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete series"
ON public.user_series
FOR DELETE
USING (true);

-- RLS policies for user_episodes
CREATE POLICY "Anyone can view user episodes"
ON public.user_episodes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can add episodes"
ON public.user_episodes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update episodes"
ON public.user_episodes
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete episodes"
ON public.user_episodes
FOR DELETE
USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_user_series_updated_at
BEFORE UPDATE ON public.user_series
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_episodes_updated_at
BEFORE UPDATE ON public.user_episodes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();