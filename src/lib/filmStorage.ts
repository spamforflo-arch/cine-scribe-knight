// Film storage utilities for localStorage

export interface StoredFilm {
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
}

// Helper to determine if content should be classified as anime
export function isAnimeContent(film: StoredFilm): boolean {
  // Already marked as anime
  if (film.mediaType === 'anime') return true;
  // Has Animation genre
  if (film.genres?.some(g => g.toLowerCase() === 'animation')) return true;
  return false;
}

// Get effective media type considering animation genre
export function getEffectiveMediaType(film: StoredFilm): 'movie' | 'tv' | 'anime' {
  if (isAnimeContent(film)) return 'anime';
  return film.mediaType || 'movie';
}

export interface RankedFilm extends StoredFilm {
  rank: number;
}

const STORAGE_KEYS = {
  watched: 'cinestop_watched',
  watchlist: 'cinestop_watchlist',
  liked: 'cinestop_liked',
  rankings: 'cinestop_rankings',
} as const;

// Generic storage helpers
function getStorage<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function setStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Watched films
export function getWatchedFilms(): StoredFilm[] {
  return getStorage<StoredFilm>(STORAGE_KEYS.watched);
}

export function addWatchedFilm(film: Omit<StoredFilm, 'addedAt'>): void {
  const films = getWatchedFilms();
  if (!films.some(f => f.tmdbId === film.tmdbId)) {
    films.unshift({ ...film, addedAt: new Date().toISOString() });
    setStorage(STORAGE_KEYS.watched, films);
  }
}

export function removeWatchedFilm(tmdbId: number): void {
  const films = getWatchedFilms().filter(f => f.tmdbId !== tmdbId);
  setStorage(STORAGE_KEYS.watched, films);
}

export function isFilmWatched(tmdbId: number): boolean {
  return getWatchedFilms().some(f => f.tmdbId === tmdbId);
}

export function updateWatchedFilmRating(tmdbId: number, userRating: number): void {
  const films = getWatchedFilms();
  const filmIndex = films.findIndex(f => f.tmdbId === tmdbId);
  if (filmIndex !== -1) {
    films[filmIndex].userRating = userRating;
    setStorage(STORAGE_KEYS.watched, films);
  }
}

// Watchlist
export function getWatchlistFilms(): StoredFilm[] {
  return getStorage<StoredFilm>(STORAGE_KEYS.watchlist);
}

export function addWatchlistFilm(film: Omit<StoredFilm, 'addedAt'>): void {
  const films = getWatchlistFilms();
  if (!films.some(f => f.tmdbId === film.tmdbId)) {
    films.unshift({ ...film, addedAt: new Date().toISOString() });
    setStorage(STORAGE_KEYS.watchlist, films);
  }
}

export function removeWatchlistFilm(tmdbId: number): void {
  const films = getWatchlistFilms().filter(f => f.tmdbId !== tmdbId);
  setStorage(STORAGE_KEYS.watchlist, films);
}

export function isFilmInWatchlist(tmdbId: number): boolean {
  return getWatchlistFilms().some(f => f.tmdbId === tmdbId);
}

// Liked films
export function getLikedFilms(): StoredFilm[] {
  return getStorage<StoredFilm>(STORAGE_KEYS.liked);
}

export function addLikedFilm(film: Omit<StoredFilm, 'addedAt'>): void {
  const films = getLikedFilms();
  if (!films.some(f => f.tmdbId === film.tmdbId)) {
    films.unshift({ ...film, addedAt: new Date().toISOString() });
    setStorage(STORAGE_KEYS.liked, films);
  }
}

export function removeLikedFilm(tmdbId: number): void {
  const films = getLikedFilms().filter(f => f.tmdbId !== tmdbId);
  setStorage(STORAGE_KEYS.liked, films);
}

export function isFilmLiked(tmdbId: number): boolean {
  return getLikedFilms().some(f => f.tmdbId === tmdbId);
}

// Rankings
export interface Rankings {
  movies: RankedFilm[];
  tv: RankedFilm[];
  anime: RankedFilm[];
}

export function getRankings(): Rankings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.rankings);
    if (data) return JSON.parse(data);
  } catch {}
  return { movies: [], tv: [], anime: [] };
}

export function setRankings(rankings: Rankings): void {
  localStorage.setItem(STORAGE_KEYS.rankings, JSON.stringify(rankings));
}

export function addToRanking(
  film: StoredFilm, 
  category: 'movies' | 'tv' | 'anime',
  position: number
): void {
  const rankings = getRankings();
  // Remove if already in rankings
  rankings[category] = rankings[category].filter(f => f.tmdbId !== film.tmdbId);
  
  // Add at position (max 15)
  const rankedFilm: RankedFilm = { ...film, rank: position };
  rankings[category].splice(position - 1, 0, rankedFilm);
  
  // Limit to 15 and update ranks
  rankings[category] = rankings[category].slice(0, 15).map((f, i) => ({
    ...f,
    rank: i + 1,
  }));
  
  setRankings(rankings);
}

export function removeFromRanking(
  tmdbId: number,
  category: 'movies' | 'tv' | 'anime'
): void {
  const rankings = getRankings();
  rankings[category] = rankings[category]
    .filter(f => f.tmdbId !== tmdbId)
    .map((f, i) => ({ ...f, rank: i + 1 }));
  setRankings(rankings);
}
