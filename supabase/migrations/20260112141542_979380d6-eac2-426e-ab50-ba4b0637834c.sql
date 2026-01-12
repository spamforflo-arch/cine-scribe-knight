-- Add tmdb_id column to user_movies for streaming from external sources
ALTER TABLE public.user_movies ADD COLUMN tmdb_id integer;

-- Create index for tmdb_id lookups
CREATE INDEX idx_user_movies_tmdb_id ON public.user_movies(tmdb_id);