-- Add user_id column to all tables
ALTER TABLE public.user_movies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_series ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_episodes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.lounge_lists ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.lounge_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing permissive policies for user_movies
DROP POLICY IF EXISTS "Anyone can view user movies" ON public.user_movies;
DROP POLICY IF EXISTS "Anyone can add movies" ON public.user_movies;
DROP POLICY IF EXISTS "Anyone can update movies" ON public.user_movies;
DROP POLICY IF EXISTS "Anyone can delete movies" ON public.user_movies;

-- Create user-scoped policies for user_movies
CREATE POLICY "Users can view own movies" ON public.user_movies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own movies" ON public.user_movies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own movies" ON public.user_movies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own movies" ON public.user_movies FOR DELETE USING (auth.uid() = user_id);

-- Drop existing permissive policies for user_series
DROP POLICY IF EXISTS "Anyone can view user series" ON public.user_series;
DROP POLICY IF EXISTS "Anyone can add series" ON public.user_series;
DROP POLICY IF EXISTS "Anyone can update series" ON public.user_series;
DROP POLICY IF EXISTS "Anyone can delete series" ON public.user_series;

-- Create user-scoped policies for user_series
CREATE POLICY "Users can view own series" ON public.user_series FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own series" ON public.user_series FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own series" ON public.user_series FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own series" ON public.user_series FOR DELETE USING (auth.uid() = user_id);

-- Drop existing permissive policies for user_episodes
DROP POLICY IF EXISTS "Anyone can view user episodes" ON public.user_episodes;
DROP POLICY IF EXISTS "Anyone can add episodes" ON public.user_episodes;
DROP POLICY IF EXISTS "Anyone can update episodes" ON public.user_episodes;
DROP POLICY IF EXISTS "Anyone can delete episodes" ON public.user_episodes;

-- Create user-scoped policies for user_episodes
CREATE POLICY "Users can view own episodes" ON public.user_episodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own episodes" ON public.user_episodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own episodes" ON public.user_episodes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own episodes" ON public.user_episodes FOR DELETE USING (auth.uid() = user_id);

-- Drop existing permissive policies for lounge_lists
DROP POLICY IF EXISTS "Anyone can view lounge lists" ON public.lounge_lists;
DROP POLICY IF EXISTS "Anyone can add lounge lists" ON public.lounge_lists;
DROP POLICY IF EXISTS "Anyone can update lounge lists" ON public.lounge_lists;
DROP POLICY IF EXISTS "Anyone can delete lounge lists" ON public.lounge_lists;

-- Create user-scoped policies for lounge_lists
CREATE POLICY "Users can view own lounge lists" ON public.lounge_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lounge lists" ON public.lounge_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lounge lists" ON public.lounge_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lounge lists" ON public.lounge_lists FOR DELETE USING (auth.uid() = user_id);

-- Drop existing permissive policies for lounge_items
DROP POLICY IF EXISTS "Anyone can view lounge items" ON public.lounge_items;
DROP POLICY IF EXISTS "Anyone can add lounge items" ON public.lounge_items;
DROP POLICY IF EXISTS "Anyone can update lounge items" ON public.lounge_items;
DROP POLICY IF EXISTS "Anyone can delete lounge items" ON public.lounge_items;

-- Create user-scoped policies for lounge_items
CREATE POLICY "Users can view own lounge items" ON public.lounge_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lounge items" ON public.lounge_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lounge items" ON public.lounge_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lounge items" ON public.lounge_items FOR DELETE USING (auth.uid() = user_id);

-- Make the movies storage bucket private
UPDATE storage.buckets SET public = false WHERE id = 'movies';

-- Drop existing permissive storage policies
DROP POLICY IF EXISTS "Anyone can upload to movies bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read movies bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete movies" ON storage.objects;

-- Create user-scoped storage policies
CREATE POLICY "Authenticated users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'movies' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'movies' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'movies' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'movies' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);