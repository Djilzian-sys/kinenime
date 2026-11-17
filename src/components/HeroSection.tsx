import React from 'react';
import { Bookmark, Check, Play } from 'lucide-react';
import { MediaItem } from '../data/catalog';

interface HeroSectionProps {
  media: MediaItem;
  isFavorite: boolean;
  onPlay: (media: MediaItem) => void;
  onToggleFavorite: (media: MediaItem) => void;
}

export function HeroSection({
  media,
  isFavorite,
  onPlay,
  onToggleFavorite,
}: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden border-b border-white/[0.08]">
      <div className="relative min-h-[460px] lg:min-h-[540px] max-w-[1360px] mx-auto flex items-end">
        <div className="absolute inset-0">
          <img
            src={media.heroImageUrl || media.imageUrl}
            alt={media.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#08090C]/65 to-[#08090C]/20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#08090C] via-[#08090C]/75 to-transparent"
          />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-8 py-12 lg:py-16 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-[#CBD5E1]">
            <span>{media.formatLabel} Pilihan</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{media.year}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{media.durationLabel}</span>
            <span aria-hidden="true">·</span>
            <span className={media.isPremiumOnly ? 'text-[#D4A853]' : 'text-[#CBD5E1]'}>
              {media.isPremiumOnly ? 'Eksklusif Premium' : 'Gratis'}
            </span>
          </div>

          <h1
            className="font-display font-bold tracking-tight text-[#F4F5F7] leading-[1.08]"
            style={{
              fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
              textWrap: 'balance',
            }}
          >
            {media.title}
          </h1>

          <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed max-w-xl">
            {media.synopsis}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onPlay(media)}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Tonton Sekarang</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleFavorite(media)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg border text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isFavorite
                  ? 'bg-[#181B24] border-white/25 text-white'
                  : 'bg-[#111319]/80 hover:bg-[#181B24] border-white/15 text-[#F4F5F7]'
              }`}
            >
              {isFavorite ? (
                <>
                  <Check className="w-4 h-4 text-[#E11D48]" />
                  <span>Tersimpan di Favorit</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Tambah ke Favorit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
