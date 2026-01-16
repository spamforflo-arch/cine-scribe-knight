// Migration utility to add genres to existing localStorage film items
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEYS = {
  watched: 'cinestop_watched',
  watchlist: 'cinestop_watchlist',
  liked: 'cinestop_liked',
  rankings: 'cinestop_rankings',
  migrated: 'cinestop_genres_migrated',
} as const;

interface StoredFilmWithOptionalGenres {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  poster: string | null;
  rating?: number;
  userRating?: number;
  addedAt: string;
  mediaType?: 'movie' | 'tv' | 'anime';
  genres?: string[];
  rank?: number;
}

async function fetchGenresFromTMDB(tmdbId: number, mediaType: 'movie' | 'tv' | 'anime'): Promise<string[]> {
  try {
    const isTV = mediaType === 'tv' || mediaType === 'anime';
    const action = isTV ? 'getTVDetail' : 'getMovieDetail';
    
    const { data, error } = await supabase.functions.invoke('tmdb', {
      body: { action, movieId: tmdbId.toString() }
    });

    if (error || !data?.result?.genres) {
      console.warn(`Failed to fetch genres for TMDB ID ${tmdbId}:`, error);
      return [];
    }

    return data.result.genres;
  } catch (err) {
    console.warn(`Error fetching genres for TMDB ID ${tmdbId}:`, err);
    return [];
  }
}

async function migrateStorageKey(key: string): Promise<number> {
  const raw = localStorage.getItem(key);
  if (!raw) return 0;

  let items: StoredFilmWithOptionalGenres[];
  try {
    items = JSON.parse(raw);
  } catch {
    return 0;
  }

  if (!Array.isArray(items)) return 0;

  let migratedCount = 0;
  const updatedItems: StoredFilmWithOptionalGenres[] = [];

  for (const item of items) {
    if (item.genres && item.genres.length > 0) {
      // Already has genres
      updatedItems.push(item);
      continue;
    }

    // Fetch genres from TMDB
    const genres = await fetchGenresFromTMDB(
      item.tmdbId,
      item.mediaType || 'movie'
    );

    updatedItems.push({
      ...item,
      genres,
      // Update mediaType if Animation genre detected
      mediaType: genres.some(g => g.toLowerCase() === 'animation')
        ? 'anime'
        : item.mediaType || 'movie',
    });
    migratedCount++;

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  localStorage.setItem(key, JSON.stringify(updatedItems));
  return migratedCount;
}

async function migrateRankings(): Promise<number> {
  const raw = localStorage.getItem(STORAGE_KEYS.rankings);
  if (!raw) return 0;

  let rankings: { movies: StoredFilmWithOptionalGenres[]; tv: StoredFilmWithOptionalGenres[]; anime: StoredFilmWithOptionalGenres[] };
  try {
    rankings = JSON.parse(raw);
  } catch {
    return 0;
  }

  let migratedCount = 0;

  for (const category of ['movies', 'tv', 'anime'] as const) {
    if (!rankings[category]) continue;

    const updatedItems: StoredFilmWithOptionalGenres[] = [];

    for (const item of rankings[category]) {
      if (item.genres && item.genres.length > 0) {
        updatedItems.push(item);
        continue;
      }

      const genres = await fetchGenresFromTMDB(
        item.tmdbId,
        item.mediaType || (category === 'movies' ? 'movie' : category === 'tv' ? 'tv' : 'anime')
      );

      updatedItems.push({
        ...item,
        genres,
      });
      migratedCount++;

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    rankings[category] = updatedItems;
  }

  localStorage.setItem(STORAGE_KEYS.rankings, JSON.stringify(rankings));
  return migratedCount;
}

export async function migrateFilmGenres(): Promise<{ migrated: number; alreadyDone: boolean }> {
  // Check if already migrated
  if (localStorage.getItem(STORAGE_KEYS.migrated) === 'true') {
    return { migrated: 0, alreadyDone: true };
  }

  console.log('Starting film genres migration...');
  
  let totalMigrated = 0;

  // Migrate each storage key
  totalMigrated += await migrateStorageKey(STORAGE_KEYS.watched);
  totalMigrated += await migrateStorageKey(STORAGE_KEYS.watchlist);
  totalMigrated += await migrateStorageKey(STORAGE_KEYS.liked);
  totalMigrated += await migrateRankings();

  // Mark as migrated
  localStorage.setItem(STORAGE_KEYS.migrated, 'true');
  
  console.log(`Film genres migration complete. Migrated ${totalMigrated} items.`);
  
  return { migrated: totalMigrated, alreadyDone: false };
}

// Force re-run migration (for debugging or after clearing data)
export function resetMigrationFlag(): void {
  localStorage.removeItem(STORAGE_KEYS.migrated);
}
