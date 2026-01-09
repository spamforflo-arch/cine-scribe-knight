-- Create the updated_at trigger function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for movie metadata
CREATE TABLE public.user_movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT 'Uncategorized',
  poster_url TEXT,
  video_url TEXT NOT NULL,
  description TEXT,
  year INTEGER,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public access for now
ALTER TABLE public.user_movies ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read movies
CREATE POLICY "Anyone can view user movies"
ON public.user_movies FOR SELECT
USING (true);

-- Allow anyone to insert movies
CREATE POLICY "Anyone can add movies"
ON public.user_movies FOR INSERT
WITH CHECK (true);

-- Allow anyone to update movies
CREATE POLICY "Anyone can update movies"
ON public.user_movies FOR UPDATE
USING (true);

-- Allow anyone to delete movies
CREATE POLICY "Anyone can delete movies"
ON public.user_movies FOR DELETE
USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_user_movies_updated_at
BEFORE UPDATE ON public.user_movies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();