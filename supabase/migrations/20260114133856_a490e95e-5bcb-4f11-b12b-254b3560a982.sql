-- Create lounge_lists table for custom lists
CREATE TABLE public.lounge_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lounge_items table for movies/shows in lounge
CREATE TABLE public.lounge_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  poster_url TEXT,
  genre TEXT NOT NULL DEFAULT 'Uncategorized',
  media_type TEXT NOT NULL DEFAULT 'movie', -- 'movie', 'tv', 'anime'
  list_id UUID REFERENCES public.lounge_lists(id) ON DELETE SET NULL, -- optional custom list
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tmdb_id, media_type)
);

-- Enable RLS
ALTER TABLE public.lounge_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lounge_items ENABLE ROW LEVEL SECURITY;

-- Policies for lounge_lists
CREATE POLICY "Anyone can view lounge lists" ON public.lounge_lists FOR SELECT USING (true);
CREATE POLICY "Anyone can add lounge lists" ON public.lounge_lists FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lounge lists" ON public.lounge_lists FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lounge lists" ON public.lounge_lists FOR DELETE USING (true);

-- Policies for lounge_items
CREATE POLICY "Anyone can view lounge items" ON public.lounge_items FOR SELECT USING (true);
CREATE POLICY "Anyone can add lounge items" ON public.lounge_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lounge items" ON public.lounge_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lounge items" ON public.lounge_items FOR DELETE USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_lounge_lists_updated_at
  BEFORE UPDATE ON public.lounge_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lounge_items_updated_at
  BEFORE UPDATE ON public.lounge_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();