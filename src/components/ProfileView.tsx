import React, { useMemo, useState } from 'react';
import { Bookmark, Crown, LogOut, Play, Trash2 } from 'lucide-react';
import { CATALOG, MediaItem } from '../data/catalog';
import { useAuthData } from '../context/AuthDataContext';
import { getGenreProfile } from '../utils/recommendations';
import { MediaCard } from './MediaCard';

interface ProfileViewProps {
  onPlay: (media: MediaItem, episode?: number, progressPercent?: number) => void;
  onOpenPremium: () => void;
}

export function ProfileView({ onPlay, onOpenPremium }: ProfileViewProps) {
  const {
    user,
    profile,
    favorites,
    watchHistory,
    favoriteIds,
    isPremium,
    loginWithGoogle,
    logout,
    toggleFavorite,
    removeWatchHistoryEntry,
  } = useAuthData();

  const [favFilter, setFavFilter] = useState<'all' | 'anime' | 'movie'>('all');

  const favoriteMedia = useMemo(() => {
    return favorites
      .map((fav) => CATALOG.find((m) => m.id === fav.mediaId))
      .filter((m): m is MediaItem => Boolean(m))
      .filter((m) => favFilter === 'all' || m.mediaType === favFilter);
  }, [favorites, favFilter]);

  const historyMap = useMemo(
    () => new Map(watchHistory.map((h) => [h.mediaId, h])),
    [watchHistory]
  );

  const genreProfile = useMemo(
    () => getGenreProfile(watchHistory, favorites).slice(0, 4),
    [watchHistory, favorites]
  );

  if (!user) {
    return (
      <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-16">
        <div className="max-w-lg mx-auto bg-[#111319] border border-white/[0.08] rounded-xl p-8 text-center space-y-4">
          <Bookmark className="w-8 h-8 text-[#E11D48] mx-auto" />
          <h1 className="font-display text-2xl font-bold text-[#F4F5F7]">
            Masuk dengan Akun Google Anda
          </h1>
          <p className="text-sm text-[#9BA1B0] leading-relaxed">
            Simpan daftar tontonan favorit ke profil pribadi, lacak progres episode, dan dapatkan rekomendasi yang menyesuaikan riwayat tontonan Anda.
          </p>
          <button
            type="button"
            onClick={() => void loginWithGoogle()}
            className="px-5 py-2.5 min-h-[44px] rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Masuk dengan Google
          </button>
        </div>
      </section>
    );
  }

  const displayName = profile?.displayName || user.displayName || 'Pengguna';
  const email = profile?.email || user.email || '';
  const photoURL = profile?.photoURL || user.photoURL || '';

  return (
    <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* User Profile Header */}
      <div className="bg-[#111319] border border-white/[0.08] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border border-white/15 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#E11D48] text-white text-xl font-bold flex items-center justify-center shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9BA1B0]">
              <span className={isPremium ? 'text-[#D4A853] font-medium' : ''}>
                {isPremium
                  ? profile?.premiumPlan === 'yearly'
                    ? 'Anggota Premium Tahunan · Bebas Iklan'
                    : 'Anggota Premium Bulanan · Bebas Iklan'
                  : 'Akun Gratis · Dengan Iklan'}
              </span>
              {genreProfile.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Minat utama: {genreProfile.map((g) => g.genre).join(', ')}
                  </span>
                </>
              )}
            </div>
            <h1 className="font-display text-2xl font-bold text-[#F4F5F7] truncate">
              {displayName}
            </h1>
            <p className="text-sm text-[#9BA1B0] truncate">{email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenPremium}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-[#D4A853] hover:bg-[#C39540] text-[#08090C] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{isPremium ? 'Kelola Premium' : 'Upgrade ke Premium'}</span>
          </button>

          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-[#181B24] hover:bg-[#232734] border border-white/10 text-xs font-medium text-[#CBD5E1] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Favorites Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#F4F5F7]">
              Daftar Tontonan Favorit
            </h2>
            <p className="text-sm text-[#9BA1B0]">
              <span className="tabular-nums">{favorites.length}</span> judul tersimpan di profil Anda
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-[#111319] border border-white/[0.08] rounded-lg self-start">
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'anime', label: 'Anime' },
                { id: 'movie', label: 'Film' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFavFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  favFilter === opt.id
                    ? 'bg-[#181B24] text-white'
                    : 'text-[#9BA1B0] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {favoriteMedia.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#111319] border border-white/[0.08] text-center space-y-2">
            <p className="text-sm font-medium text-[#F4F5F7]">
              Belum ada tontonan di daftar favorit
            </p>
            <p className="text-xs text-[#9BA1B0]">
              Klik tombol penanda pada kartu anime atau film mana pun untuk menyimpannya di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteMedia.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                isFavorite={favoriteIds.has(item.id)}
                isPremiumUser={isPremium}
                progressPercent={historyMap.get(item.id)?.progressPercent}
                onPlay={(m) => {
                  const hist = historyMap.get(m.id);
                  onPlay(m, hist?.episode || 1, hist?.progressPercent || 0);
                }}
                onToggleFavorite={(m) => void toggleFavorite(m)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Watch History Section */}
      <div className="space-y-5">
        <div className="border-b border-white/[0.08] pb-4">
          <h2 className="font-display text-xl font-semibold text-[#F4F5F7]">
            Riwayat Tontonan
          </h2>
          <p className="text-sm text-[#9BA1B0]">
            Digunakan untuk melanjutkan tayangan dan menyusun rekomendasi personal Anda
          </p>
        </div>

        {watchHistory.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#111319] border border-white/[0.08] text-center space-y-2">
            <p className="text-sm font-medium text-[#F4F5F7]">
              Riwayat tontonan masih kosong
            </p>
            <p className="text-xs text-[#9BA1B0]">
              Putar satu episode anime atau film untuk mulai membangun rekomendasi personal.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] bg-[#111319] border border-white/[0.08] rounded-xl overflow-hidden">
            {watchHistory.map((entry) => {
              const media = CATALOG.find((m) => m.id === entry.mediaId);
              if (!media) return null;
              return (
                <div
                  key={entry.mediaId}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#181B24]/60 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={media.imageUrl}
                      alt={media.title}
                      referrerPolicy="no-referrer"
                      className="w-24 aspect-[4/3] rounded-lg object-cover shrink-0 bg-[#181B24]"
                    />
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-[#9BA1B0]">
                        {media.formatLabel} · <span className="tabular-nums">Eps {entry.episode}</span> ·{' '}
                        <span className="tabular-nums">{entry.progressPercent}% selesai</span>
                      </p>
                      <h3 className="font-display text-base font-semibold text-[#F4F5F7] truncate">
                        {media.title}
                      </h3>
                      <p className="text-xs text-[#9BA1B0] truncate">
                        {entry.genres.join(' · ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onPlay(media, entry.episode, entry.progressPercent)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Lanjutkan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeWatchHistoryEntry(entry.mediaId)}
                      aria-label={`Hapus riwayat ${media.title}`}
                      className="w-10 h-10 rounded-lg bg-[#181B24] hover:bg-[#232734] border border-white/10 flex items-center justify-center text-[#9BA1B0] hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
