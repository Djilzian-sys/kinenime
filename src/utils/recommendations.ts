import { CATALOG, MediaItem, MediaType } from '../data/catalog';

export interface WatchHistoryRecord {
  userId: string;
  mediaId: string;
  mediaType: MediaType;
  title: string;
  genres: string[];
  episode: number;
  progressPercent: number;
  watchedAtMs: number;
}

export interface FavoriteRecord {
  userId: string;
  mediaId: string;
  mediaType: MediaType;
  title: string;
  addedAtMs: number;
}

export interface RecommendedItem {
  media: MediaItem;
  score: number;
  reason: string;
  matchedGenres: string[];
}

export interface GenreAffinity {
  genre: string;
  weight: number;
}

export function getGenreProfile(
  history: WatchHistoryRecord[],
  favorites: FavoriteRecord[]
): GenreAffinity[] {
  const weights = new Map<string, number>();

  const sortedHistory = [...history].sort((a, b) => b.watchedAtMs - a.watchedAtMs);
  sortedHistory.forEach((entry, index) => {
    const recencyMultiplier = Math.max(0.45, 1.4 - index * 0.12);
    const completionMultiplier = 0.6 + (entry.progressPercent / 100) * 0.8;
    const totalWeight = recencyMultiplier * completionMultiplier;

    entry.genres.forEach((genre) => {
      weights.set(genre, (weights.get(genre) || 0) + totalWeight);
    });
  });

  favorites.forEach((fav) => {
    const item = CATALOG.find((m) => m.id === fav.mediaId);
    if (!item) return;
    item.genres.forEach((genre) => {
      weights.set(genre, (weights.get(genre) || 0) + 0.65);
    });
  });

  return Array.from(weights.entries())
    .map(([genre, weight]) => ({ genre, weight }))
    .sort((a, b) => b.weight - a.weight);
}

export function computeRecommendations(
  history: WatchHistoryRecord[],
  favorites: FavoriteRecord[],
  limit = 4
): RecommendedItem[] {
  if (history.length === 0 && favorites.length === 0) {
    return CATALOG.slice()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
      .map((media) => ({
        media,
        score: media.rating,
        reason: `Pilihan editor populer dengan rating ${media.rating.toFixed(1)}`,
        matchedGenres: media.genres.slice(0, 2),
      }));
  }

  const genreProfile = getGenreProfile(history, favorites);
  const genreWeightMap = new Map(genreProfile.map((g) => [g.genre, g.weight]));

  const typeCounts: Record<MediaType, number> = { anime: 0, movie: 0 };
  history.forEach((h) => {
    typeCounts[h.mediaType] = (typeCounts[h.mediaType] || 0) + 1;
  });

  const watchedIds = new Set(history.map((h) => h.mediaId));
  const recentEntry = [...history].sort((a, b) => b.watchedAtMs - a.watchedAtMs)[0];

  const scored: RecommendedItem[] = CATALOG.map((media) => {
    const matchedGenres: string[] = [];
    let genreScore = 0;

    media.genres.forEach((g) => {
      const w = genreWeightMap.get(g) || 0;
      if (w > 0) {
        matchedGenres.push(g);
        genreScore += w * 2.4;
      }
    });

    const typeBoost = (typeCounts[media.mediaType] || 0) > 0 ? 1.1 : 0;
    const ratingBoost = media.rating * 0.35;
    const unwatchedBonus = watchedIds.has(media.id) ? -4.5 : 2.2;
    const score = genreScore + typeBoost + ratingBoost + unwatchedBonus;

    let reason = `Sesuai selera ${media.genres.slice(0, 2).join(' & ')} Anda`;
    if (recentEntry && matchedGenres.length > 0 && recentEntry.mediaId !== media.id) {
      reason = `Karena Anda menonton ${recentEntry.title} · Cocok di ${matchedGenres.slice(0, 2).join(' & ')}`;
    } else if (watchedIds.has(media.id)) {
      reason = `Lanjutkan atau tonton ulang · ${media.genres.slice(0, 2).join(' & ')}`;
    } else if (matchedGenres.length > 0) {
      reason = `Cocok dengan preferensi ${matchedGenres.slice(0, 2).join(' & ')} Anda`;
    } else {
      reason = `Rekomendasi unggulan ${media.formatLabel} (${media.rating.toFixed(1)})`;
    }

    return {
      media,
      score,
      reason,
      matchedGenres,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
