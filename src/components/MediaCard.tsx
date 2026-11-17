import React, { useState } from 'react';
import { Bookmark, Check, Film, Lock, Play, Star } from 'lucide-react';
import { MediaItem } from '../data/catalog';

interface MediaCardProps {
  media: MediaItem;
  isFavorite: boolean;
  isPremiumUser: boolean;
  recommendationReason?: string;
  progressPercent?: number;
  onPlay: (media: MediaItem) => void;
  onToggleFavorite: (media: MediaItem) => void;
}

export function MediaCard({
  media,
  isFavorite,
  isPremiumUser,
  recommendationReason,
  progressPercent,
  onPlay,
  onToggleFavorite,
}: MediaCardProps) {
  const [imgError, setImgError] = useState(false);
  const locked = media.isPremiumOnly && !isPremiumUser;

  return (
    <article className="group flex flex-col bg-[#111319] border border-white/[0.08] rounded-xl overflow-hidden transition-transform duration-150 hover:-translate-y-0.5 hover:border-white/20">
      <div className="relative aspect-[4/3] w-full bg-[#181B24] overflow-hidden">
        {!imgError ? (
          <img
            src={media.imageUrl}
            alt={media.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#181B24] to-[#0D0F14] p-4 text-center">
            <Film className="w-7 h-7 text-[#9BA1B0]" />
            <span className="text-xs font-medium text-[#CBD5E1]">{media.title}</span>
          </div>
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
        />

        {/* Clickable play surface */}
        <button
          type="button"
          onClick={() => onPlay(media)}
          aria-label={`Putar ${media.title}`}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
        >
          <span className="w-11 h-11 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {locked ? <Lock className="w-4 h-4 text-[#D4A853]" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </span>
        </button>

        {/* Favorite toggle button with >= 40px touch target */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(media);
          }}
          aria-label={isFavorite ? `Hapus ${media.title} dari favorit` : `Simpan ${media.title} ke favorit`}
          title={isFavorite ? 'Tersimpan di Favorit' : 'Simpan ke Favorit'}
          className={`absolute top-2.5 right-2.5 w-10 h-10 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
            isFavorite
              ? 'bg-[#E11D48] border-[#E11D48] text-white'
              : 'bg-black/65 hover:bg-black/85 border-white/15 text-[#F4F5F7]'
          }`}
        >
          {isFavorite ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>

        {typeof progressPercent === 'number' && progressPercent > 0 && (
          <div className="absolute left-0 right-0 bottom-0 h-1 bg-white/15">
            <div
              className="h-full bg-[#E11D48]"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs text-[#9BA1B0]">
            <span className="truncate">
              {media.formatLabel}
              <span aria-hidden="true"> · </span>
              <span className={media.isPremiumOnly ? 'text-[#D4A853] font-medium' : ''}>
                {media.isPremiumOnly ? 'Eksklusif Premium' : 'Gratis'}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-[#F4F5F7] tabular-nums shrink-0">
              <Star className="w-3 h-3 text-[#D4A853] fill-current" />
              {media.rating.toFixed(1)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onPlay(media)}
            className="text-left w-full cursor-pointer"
          >
            <h3 className="font-display text-base font-semibold text-[#F4F5F7] group-hover:text-white transition-colors line-clamp-1">
              {media.title}
            </h3>
          </button>

          <p className="text-xs text-[#9BA1B0] line-clamp-1">
            {media.genres.slice(0, 3).join(' · ')}
            <span aria-hidden="true"> · </span>
            <span className="tabular-nums">{media.year}</span>
            <span aria-hidden="true"> · </span>
            <span className="tabular-nums">{media.durationLabel}</span>
          </p>

          {recommendationReason && (
            <p className="text-xs text-[#CBD5E1] pt-1 leading-snug line-clamp-2">
              {recommendationReason}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onPlay(media)}
          className="w-full py-2 px-3 min-h-[40px] rounded-lg bg-[#181B24] hover:bg-[#232734] border border-white/[0.08] text-xs font-medium text-[#F4F5F7] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {locked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>Buka dengan Premium</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>{typeof progressPercent === 'number' && progressPercent > 0 ? 'Lanjutkan Menonton' : 'Tonton Sekarang'}</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
