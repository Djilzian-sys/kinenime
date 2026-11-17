import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { ALL_GENRES, CATALOG, MediaItem } from './data/catalog';
import { AuthDataProvider, useAuthData } from './context/AuthDataContext';
import { computeRecommendations } from './utils/recommendations';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavTab, Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MediaCard } from './components/MediaCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PremiumView } from './components/PremiumView';
import { ProfileView } from './components/ProfileView';

type AccessFilter = 'all' | 'free' | 'premium';

function KineNimeShell() {
  const {
    user,
    authError,
    clearAuthError,
    favorites,
    watchHistory,
    favoriteIds,
    isPremium,
    loginWithGoogle,
    toggleFavorite,
  } = useAuthData();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Semua');
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const [playerState, setPlayerState] = useState<{
    media: MediaItem;
    episode: number;
    progressPercent: number;
  } | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard "/" shortcut to focus search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        if (activeTab === 'favorites' || activeTab === 'profile' || activeTab === 'premium') {
          setActiveTab('home');
        }
        window.setTimeout(() => searchInputRef.current?.focus(), 40);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab]);

  const historyMap = useMemo(
    () => new Map(watchHistory.map((h) => [h.mediaId, h])),
    [watchHistory]
  );

  const heroMedia = CATALOG[0];

  const recommendations = useMemo(
    () => computeRecommendations(watchHistory, favorites, 4),
    [watchHistory, favorites]
  );

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CATALOG.filter((item) => {
      if (activeTab === 'anime' && item.mediaType !== 'anime') return false;
      if (activeTab === 'movie' && item.mediaType !== 'movie') return false;
      if (accessFilter === 'free' && item.isPremiumOnly) return false;
      if (accessFilter === 'premium' && !item.isPremiumOnly) return false;
      if (selectedGenre !== 'Semua' && !item.genres.includes(selectedGenre)) {
        return false;
      }
      if (!q) return true;

      const haystack = [
        item.title,
        item.originalTitle,
        item.formatLabel,
        item.creatorName,
        item.synopsis,
        String(item.year),
        ...item.genres,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [activeTab, accessFilter, selectedGenre, searchQuery]);

  const handlePlay = (
    media: MediaItem,
    episode?: number,
    progressPercent?: number
  ) => {
    const hist = historyMap.get(media.id);
    setPlayerState({
      media,
      episode: episode ?? hist?.episode ?? 1,
      progressPercent: progressPercent ?? hist?.progressPercent ?? 0,
    });
  };

  const handleToggleFavorite = (media: MediaItem) => {
    if (!user) {
      void loginWithGoogle();
      return;
    }
    void toggleFavorite(media);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('Semua');
    setAccessFilter('all');
  };

  const isBrowseTab = activeTab === 'home' || activeTab === 'anime' || activeTab === 'movie';
  const hasActiveSearchOrFilter =
    searchQuery.trim().length > 0 ||
    selectedGenre !== 'Semua' ||
    accessFilter !== 'all';

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-[#F4F5F7]">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {authError && (
        <div className="bg-[#181B24] border-b border-[#E11D48]/40 px-4 sm:px-8 py-3">
          <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4 text-xs sm:text-sm">
            <span className="text-[#F4F5F7]">{authError}</span>
            <button
              type="button"
              onClick={clearAuthError}
              className="text-[#9BA1B0] hover:text-white cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {activeTab === 'home' && !hasActiveSearchOrFilter && (
          <HeroSection
            media={heroMedia}
            isFavorite={favoriteIds.has(heroMedia.id)}
            onPlay={(m) => handlePlay(m)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {isBrowseTab && (
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 space-y-12">
            {/* Responsive Search & Filter Workspace Toolbar */}
            <section
              aria-label="Pencarian dan Filter Katalog"
              className="space-y-4 bg-[#111319] border border-white/[0.08] rounded-xl p-4 sm:p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    aria-hidden="true"
                    className="w-4 h-4 text-[#9BA1B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul anime, film, genre, atau sutradara... (tekan /)"
                    aria-label="Cari anime atau film"
                    className="w-full pl-10 pr-10 py-2.5 min-h-[44px] rounded-lg bg-[#08090C] border border-white/10 focus:border-[#E11D48] focus:outline-none text-sm text-[#F4F5F7] placeholder:text-[#6B7280]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Hapus kata kunci pencarian"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded flex items-center justify-center text-[#9BA1B0] hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Access & Category Segmented Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center p-1 bg-[#08090C] border border-white/10 rounded-lg">
                    {(
                      [
                        { id: 'all', label: 'Semua' },
                        { id: 'free', label: 'Gratis' },
                        { id: 'premium', label: 'Eksklusif' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAccessFilter(opt.id)}
                        className={`px-3 py-1.5 min-h-[34px] text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          accessFilter === opt.id
                            ? 'bg-[#181B24] text-white'
                            : 'text-[#9BA1B0] hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Genre Filter Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['Semua', ...ALL_GENRES].map((genre) => {
                  const active = selectedGenre === genre;
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#E11D48] border-[#E11D48] text-white'
                          : 'bg-[#08090C] hover:bg-[#181B24] border-white/10 text-[#CBD5E1]'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Personalized Recommendations Section (on Home when not searching) */}
            {activeTab === 'home' && !hasActiveSearchOrFilter && (
              <section className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/[0.08] pb-3">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F4F5F7]">
                      {watchHistory.length > 0 || favorites.length > 0
                        ? 'Rekomendasi Untuk Anda'
                        : 'Pilihan Kurasi Populer'}
                    </h2>
                    <p className="text-sm text-[#9BA1B0]">
                      {watchHistory.length > 0 || favorites.length > 0
                        ? 'Disusun otomatis dari riwayat tontonan dan daftar favorit profil Anda'
                        : 'Mulai menonton atau simpan judul favorit untuk mempersonalisasi rekomendasi'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.map((rec) => (
                    <MediaCard
                      key={`rec-${rec.media.id}`}
                      media={rec.media}
                      isFavorite={favoriteIds.has(rec.media.id)}
                      isPremiumUser={isPremium}
                      recommendationReason={rec.reason}
                      progressPercent={historyMap.get(rec.media.id)?.progressPercent}
                      onPlay={(m) => handlePlay(m)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Main Catalog Grid */}
            <section className="space-y-5">
              <div className="flex items-end justify-between gap-4 border-b border-white/[0.08] pb-3">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#F4F5F7]">
                    {activeTab === 'anime'
                      ? 'Katalog Anime'
                      : activeTab === 'movie'
                        ? 'Katalog Film Movie'
                        : hasActiveSearchOrFilter
                          ? 'Hasil Pencarian'
                          : 'Jelajahi Semua Tayangan'}
                  </h2>
                  <p className="text-sm text-[#9BA1B0]">
                    Menampilkan{' '}
                    <span className="tabular-nums text-[#F4F5F7]">
                      {filteredCatalog.length}
                    </span>{' '}
                    judul tersedia
                  </p>
                </div>

                {hasActiveSearchOrFilter && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-medium text-[#E11D48] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {filteredCatalog.length === 0 ? (
                <div className="p-10 rounded-xl bg-[#111319] border border-white/[0.08] text-center space-y-3">
                  <p className="text-base font-medium text-[#F4F5F7]">
                    Tidak ada anime atau film yang cocok dengan pencarian Anda
                  </p>
                  <p className="text-sm text-[#9BA1B0]">
                    Coba ubah kata kunci, pilih genre lain, atau tampilkan semua akses tayangan.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 min-h-[40px] rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Tampilkan Semua Judul
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredCatalog.map((item) => (
                    <MediaCard
                      key={item.id}
                      media={item}
                      isFavorite={favoriteIds.has(item.id)}
                      isPremiumUser={isPremium}
                      progressPercent={historyMap.get(item.id)?.progressPercent}
                      onPlay={(m) => handlePlay(m)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {(activeTab === 'favorites' || activeTab === 'profile') && (
          <ProfileView
            onPlay={(m, ep, prog) => handlePlay(m, ep, prog)}
            onOpenPremium={() => setShowPremiumModal(true)}
          />
        )}

        {activeTab === 'premium' && <PremiumView />}
      </main>

      <footer className="border-t border-white/[0.08] mt-12">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9BA1B0]">
          <p>© 2026 KineNime. Kurasi Streaming Anime &amp; Film Sinema.</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('anime')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Anime
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('movie')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Film Movie
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('premium')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Keanggotaan Premium
            </button>
          </div>
        </div>
      </footer>

      {playerState && (
        <VideoPlayerModal
          media={playerState.media}
          initialEpisode={playerState.episode}
          initialProgressPercent={playerState.progressPercent}
          onClose={() => setPlayerState(null)}
          onOpenPremium={() => setShowPremiumModal(true)}
        />
      )}

      {showPremiumModal && (
        <PremiumView isModal onClose={() => setShowPremiumModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthDataProvider>
        <KineNimeShell />
      </AuthDataProvider>
    </ErrorBoundary>
  );
}
