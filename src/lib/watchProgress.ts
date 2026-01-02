// Watch progress storage for continue watching feature

export interface WatchProgress {
  tmdbId: number;
  mediaType: 'movie' | 'tv' | 'anime';
  title: string;
  poster: string | null;
  progress: number; // 0-100 percentage
  currentTime: number; // seconds
  duration: number; // seconds
  lastWatched: string; // ISO date
  season?: number;
  episode?: number;
  episodeTitle?: string;
}

const WATCH_PROGRESS_KEY = 'cinestop_watch_progress';

export function getWatchProgress(): WatchProgress[] {
  try {
    const data = localStorage.getItem(WATCH_PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getProgressForFilm(tmdbId: number, season?: number, episode?: number): WatchProgress | undefined {
  const progress = getWatchProgress();
  return progress.find(p => {
    if (p.tmdbId !== tmdbId) return false;
    if (season !== undefined && episode !== undefined) {
      return p.season === season && p.episode === episode;
    }
    return true;
  });
}

export function saveWatchProgress(item: WatchProgress): void {
  const progress = getWatchProgress();
  const existingIndex = progress.findIndex(p => {
    if (p.tmdbId !== item.tmdbId) return false;
    if (item.season !== undefined && item.episode !== undefined) {
      return p.season === item.season && p.episode === item.episode;
    }
    return p.season === undefined && p.episode === undefined;
  });

  const updatedItem = { ...item, lastWatched: new Date().toISOString() };

  if (existingIndex >= 0) {
    progress[existingIndex] = updatedItem;
  } else {
    progress.unshift(updatedItem);
  }

  // Keep only the last 20 items
  const trimmed = progress.slice(0, 20);
  localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(trimmed));
}

export function removeWatchProgress(tmdbId: number, season?: number, episode?: number): void {
  const progress = getWatchProgress();
  const filtered = progress.filter(p => {
    if (p.tmdbId !== tmdbId) return true;
    if (season !== undefined && episode !== undefined) {
      return !(p.season === season && p.episode === episode);
    }
    return false;
  });
  localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(filtered));
}

export function getContinueWatching(): WatchProgress[] {
  const progress = getWatchProgress();
  // Sort by last watched, most recent first
  return progress
    .filter(p => p.progress > 0 && p.progress < 95) // Only show items not finished
    .sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
    .slice(0, 10);
}
