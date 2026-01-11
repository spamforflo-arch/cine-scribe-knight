// Watch progress storage for self-streaming content

export interface SelfStreamingProgress {
  contentId: string;
  contentType: 'movie' | 'series';
  title: string;
  poster: string | null;
  progress: number; // 0-100 percentage
  currentTime: number; // seconds
  duration: number; // seconds
  lastWatched: string; // ISO date
  // Series-specific
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
}

const SELF_STREAMING_PROGRESS_KEY = 'cinestop_self_streaming_progress';

export function getSelfStreamingProgress(): SelfStreamingProgress[] {
  try {
    const data = localStorage.getItem(SELF_STREAMING_PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getProgressForContent(
  contentId: string, 
  episodeId?: string
): SelfStreamingProgress | undefined {
  const progress = getSelfStreamingProgress();
  return progress.find(p => {
    if (p.contentId !== contentId) return false;
    if (episodeId) {
      return p.episodeId === episodeId;
    }
    return !p.episodeId;
  });
}

export function saveSelfStreamingProgress(item: SelfStreamingProgress): void {
  const progress = getSelfStreamingProgress();
  const existingIndex = progress.findIndex(p => {
    if (p.contentId !== item.contentId) return false;
    if (item.episodeId) {
      return p.episodeId === item.episodeId;
    }
    return !p.episodeId;
  });

  const updatedItem = { ...item, lastWatched: new Date().toISOString() };

  if (existingIndex >= 0) {
    progress[existingIndex] = updatedItem;
  } else {
    progress.unshift(updatedItem);
  }

  // Keep only the last 50 items
  const trimmed = progress.slice(0, 50);
  localStorage.setItem(SELF_STREAMING_PROGRESS_KEY, JSON.stringify(trimmed));
}

export function removeSelfStreamingProgress(
  contentId: string, 
  episodeId?: string
): void {
  const progress = getSelfStreamingProgress();
  const filtered = progress.filter(p => {
    if (p.contentId !== contentId) return true;
    if (episodeId) {
      return p.episodeId !== episodeId;
    }
    return false;
  });
  localStorage.setItem(SELF_STREAMING_PROGRESS_KEY, JSON.stringify(filtered));
}

export function getContinueWatchingSelfStreaming(): SelfStreamingProgress[] {
  const progress = getSelfStreamingProgress();
  return progress
    .filter(p => p.progress > 0 && p.progress < 95)
    .sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime())
    .slice(0, 10);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
