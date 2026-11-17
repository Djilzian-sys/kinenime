import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Check,
  Crown,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Subtitles,
  X,
} from 'lucide-react';
import { MediaItem } from '../data/catalog';
import { useAuthData } from '../context/AuthDataContext';

interface VideoPlayerModalProps {
  media: MediaItem | null;
  initialEpisode?: number;
  initialProgressPercent?: number;
  onClose: () => void;
  onOpenPremium: () => void;
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export function VideoPlayerModal({
  media,
  initialEpisode = 1,
  initialProgressPercent = 0,
  onClose,
  onOpenPremium,
}: VideoPlayerModalProps) {
  const {
    user,
    isPremium,
    favoriteIds,
    toggleFavorite,
    recordWatchProgress,
    loginWithGoogle,
  } = useAuthData();

  const [episode, setEpisode] = useState(initialEpisode);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState<'id' | 'en' | 'off'>('id');
  const [quality, setQuality] = useState<'1080p' | '4K'>(isPremium ? '4K' : '1080p');
  const [adSecondsLeft, setAdSecondsLeft] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const lastSavedPercentRef = useRef<number>(-1);

  const locked = Boolean(media && media.isPremiumOnly && !isPremium);
  const duration = media?.durationSeconds || 180;

  // Initialize playback state when media opens
  useEffect(() => {
    if (!media) return;
    setEpisode(initialEpisode);
    const startSec =
      initialProgressPercent > 0 && initialProgressPercent < 98
        ? Math.floor((initialProgressPercent / 100) * media.durationSeconds)
        : 0;
    setCurrentTime(startSec);
    setQuality(isPremium ? '4K' : '1080p');
    lastSavedPercentRef.current = -1;

    if (media.isPremiumOnly && !isPremium) {
      setAdSecondsLeft(0);
      setIsPlaying(false);
    } else if (!isPremium) {
      setAdSecondsLeft(8);
      setIsPlaying(false);
    } else {
      setAdSecondsLeft(0);
      setIsPlaying(true);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = media.heroImageUrl || media.imageUrl;
    img.onload = () => {
      bgImgRef.current = img;
    };
  }, [media, initialEpisode, initialProgressPercent, isPremium]);

  // Ad countdown for free users
  useEffect(() => {
    if (!media || locked || adSecondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setAdSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [media, locked, adSecondsLeft]);

  // Playback clock
  useEffect(() => {
    if (!media || locked || adSecondsLeft > 0 || !isPlaying) return;
    const interval = window.setInterval(() => {
      setCurrentTime((prev) => {
        if (prev + 1 >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [media, locked, adSecondsLeft, isPlaying, duration]);

  // Persist watch history to Firestore periodically and when paused/completed
  useEffect(() => {
    if (!media || !user || locked || adSecondsLeft > 0) return;
    const percent = Math.max(1, Math.min(100, Math.round((currentTime / duration) * 100)));
    const shouldSave =
      lastSavedPercentRef.current === -1 ||
      Math.abs(percent - lastSavedPercentRef.current) >= 5 ||
      (!isPlaying && percent !== lastSavedPercentRef.current) ||
      percent === 100;

    if (shouldSave && currentTime >= 1) {
      lastSavedPercentRef.current = percent;
      void recordWatchProgress(media, episode, percent);
    }
  }, [media, user, locked, adSecondsLeft, currentTime, duration, isPlaying, episode, recordWatchProgress]);

  // Close on Escape
  useEffect(() => {
    if (!media) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [media, onClose]);

  // Atmospheric 60fps canvas renderer
  useEffect(() => {
    if (!media || locked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let tick = 0;
    const particles = Array.from({ length: 48 }, (_, i) => ({
      x: (i * 97) % 960,
      y: (i * 53) % 540,
      speed: 0.6 + (i % 5) * 0.45,
      size: 1 + (i % 3),
      alpha: 0.25 + (i % 4) * 0.15,
    }));

    const render = () => {
      if (isPlaying && adSecondsLeft === 0) {
        tick += 0.016;
      }
      const w = canvas.width;
      const h = canvas.height;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, media.palette.skyTop);
      grad.addColorStop(1, media.palette.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Draw key visual with gentle cinema pan/zoom
      if (bgImgRef.current) {
        const scale = 1.04 + Math.sin(tick * 0.25) * 0.03;
        const panX = Math.cos(tick * 0.2) * 14;
        const panY = Math.sin(tick * 0.18) * 8;
        const dw = w * scale;
        const dh = h * scale;
        ctx.save();
        ctx.globalAlpha = 0.88;
        ctx.drawImage(
          bgImgRef.current,
          (w - dw) / 2 + panX,
          (h - dh) / 2 + panY,
          dw,
          dh
        );
        ctx.restore();
      }

      // Subtle atmospheric particles matched to title mood
      ctx.save();
      particles.forEach((p, idx) => {
        if (isPlaying && adSecondsLeft === 0) {
          if (media.palette.atmosphere === 'rain') {
            p.y += p.speed * 5.2;
            p.x -= p.speed * 1.1;
          } else if (media.palette.atmosphere === 'embers' || media.palette.atmosphere === 'lanterns') {
            p.y -= p.speed * 0.8;
            p.x += Math.sin(tick + idx) * 0.4;
          } else {
            p.x += p.speed * 0.25;
            p.y += Math.sin(tick * 0.6 + idx) * 0.15;
          }
          if (p.y > h) p.y = 0;
          if (p.y < 0) p.y = h;
          if (p.x > w) p.x = 0;
          if (p.x < 0) p.x = w;
        }

        ctx.fillStyle = media.palette.particle;
        ctx.globalAlpha = p.alpha;
        if (media.palette.atmosphere === 'rain') {
          ctx.fillRect(p.x, p.y, 1.2, 12);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // Subtle cinema vignette + letterbox bars
      const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.72);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#050608';
      ctx.fillRect(0, 0, w, 24);
      ctx.fillRect(0, h - 24, w, 24);

      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(animId);
  }, [media, locked, isPlaying, adSecondsLeft]);

  const activeSubtitle = useMemo(() => {
    if (!media || subtitleLang === 'off') return null;
    const loopSec = currentTime % 27;
    const cue = media.subtitles.find(
      (c) => loopSec >= c.startSec && loopSec <= c.endSec
    );
    if (!cue) return null;
    return subtitleLang === 'id' ? cue.id : cue.en;
  }, [media, subtitleLang, currentTime]);

  if (!media) return null;

  const isFavorite = favoriteIds.has(media.id);
  const currentEpisodeObj =
    media.episodes.find((ep) => ep.number === episode) || media.episodes[0];

  const handleActionFavorite = () => {
    if (!user) {
      void loginWithGoogle();
      return;
    }
    void toggleFavorite(media);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pemutar ${media.title}`}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="w-full max-w-5xl bg-[#111319] border border-white/10 rounded-xl overflow-hidden shadow-2xl my-auto">
        {/* Top bar inside player modal */}
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-white/[0.08]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#9BA1B0]">
              <span>{media.formatLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{currentEpisodeObj.title}</span>
              <span aria-hidden="true">·</span>
              <span className={isPremium ? 'text-[#D4A853]' : ''}>
                {isPremium ? 'Bebas Iklan' : 'Mode Gratis'}
              </span>
            </div>
            <h2 className="font-display text-lg font-semibold text-[#F4F5F7] truncate">
              {media.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleActionFavorite}
              className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-[#E11D48] border-[#E11D48] text-white'
                  : 'bg-[#181B24] hover:bg-[#232734] border-white/10 text-[#F4F5F7]'
              }`}
            >
              {isFavorite ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFavorite ? 'Tersimpan' : 'Favorit'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pemutar"
              className="w-10 h-10 rounded-lg bg-[#181B24] hover:bg-[#232734] border border-white/10 flex items-center justify-center text-[#F4F5F7] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 16:9 Video Viewport */}
        <div className="relative aspect-video w-full bg-[#050608] overflow-hidden">
          {locked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#111319] to-[#08090C]">
              <div className="w-12 h-12 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/40 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-[#D4A853]" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#F4F5F7] max-w-md">
                Konten Eksklusif KineNime Premium
              </h3>
              <p className="text-sm text-[#9BA1B0] max-w-md mt-2 leading-relaxed">
                Judul ini tersedia khusus untuk anggota Premium. Aktifkan keanggotaan untuk membuka seluruh tayangan eksklusif, kualitas 4K, dan pengalaman menonton tanpa iklan.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={onOpenPremium}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-[#D4A853] hover:bg-[#C39540] text-[#08090C] text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>Aktifkan Premium Sekarang</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                width={960}
                height={540}
                className="w-full h-full object-cover"
              />

              {/* Subtitles */}
              {adSecondsLeft === 0 && activeSubtitle && (
                <div className="absolute bottom-8 left-4 right-4 flex justify-center pointer-events-none">
                  <p className="px-4 py-1.5 rounded bg-black/75 text-[#F4F5F7] text-sm sm:text-base font-medium text-center max-w-2xl">
                    {activeSubtitle}
                  </p>
                </div>
              )}

              {/* Pre-roll Ad Break for Free Tier */}
              {adSecondsLeft > 0 && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-xs font-medium tracking-wide text-[#D4A853] mb-2">
                    Jeda Iklan Sponsor · Paket Gratis
                  </p>
                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-white max-w-lg">
                    Tayangan {media.title} dimulai dalam{' '}
                    <span className="tabular-nums text-[#E11D48]">{adSecondsLeft}</span> detik
                  </h3>
                  <p className="text-sm text-[#9BA1B0] mt-2 max-w-md">
                    Ingin langsung menonton tanpa jeda iklan dan membuka kualitas 4K?
                  </p>
                  <div className="w-64 h-1.5 bg-white/15 rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-[#E11D48] transition-all duration-500"
                      style={{ width: `${((8 - adSecondsLeft) / 8) * 100}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onOpenPremium}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-[#D4A853] hover:bg-[#C39540] text-[#08090C] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Hapus Iklan dengan Premium</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Playback Controls */}
        {!locked && (
          <div className="px-5 py-4 space-y-3 border-t border-white/[0.08] bg-[#0D0F14]">
            {/* Scrubber */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#9BA1B0] tabular-nums w-11">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                aria-label="Garis waktu pemutaran"
                min={0}
                max={duration}
                value={currentTime}
                disabled={adSecondsLeft > 0}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="flex-1 accent-[#E11D48] cursor-pointer h-1.5"
              />
              <span className="font-mono text-xs text-[#9BA1B0] tabular-nums w-11 text-right">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={adSecondsLeft > 0}
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
                </button>

                <button
                  type="button"
                  disabled={adSecondsLeft > 0}
                  onClick={() => {
                    setCurrentTime(0);
                    setIsPlaying(true);
                  }}
                  aria-label="Ulangi dari awal"
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg bg-[#181B24] hover:bg-[#232734] border border-white/10 text-xs font-medium text-[#F4F5F7] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ulang</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Subtitle selector */}
                <div className="inline-flex items-center gap-1.5 bg-[#181B24] border border-white/10 rounded-lg px-2.5 py-1.5 min-h-[40px]">
                  <Subtitles className="w-3.5 h-3.5 text-[#9BA1B0]" />
                  <select
                    aria-label="Bahasa subtitle"
                    value={subtitleLang}
                    onChange={(e) => setSubtitleLang(e.target.value as 'id' | 'en' | 'off')}
                    className="bg-transparent text-xs text-[#F4F5F7] focus:outline-none cursor-pointer"
                  >
                    <option value="id" className="bg-[#111319]">Subtitle: Indonesia</option>
                    <option value="en" className="bg-[#111319]">Subtitle: English</option>
                    <option value="off" className="bg-[#111319]">Subtitle: Mati</option>
                  </select>
                </div>

                {/* Quality selector */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isPremium) {
                      onOpenPremium();
                    } else {
                      setQuality((q) => (q === '4K' ? '1080p' : '4K'));
                    }
                  }}
                  className="px-3 py-2 min-h-[40px] rounded-lg bg-[#181B24] hover:bg-[#232734] border border-white/10 text-xs font-medium text-[#F4F5F7] transition-colors cursor-pointer"
                >
                  Kualitas: {quality}{' '}
                  {!isPremium && <span className="text-[#D4A853]">(4K Premium)</span>}
                </button>
              </div>
            </div>

            {/* Episode switcher for Anime series */}
            {media.episodes.length > 1 && (
              <div className="pt-2 border-t border-white/[0.06]">
                <p className="text-xs font-medium text-[#9BA1B0] mb-2">Daftar Episode</p>
                <div className="flex flex-wrap gap-2">
                  {media.episodes.map((ep) => {
                    const active = ep.number === episode;
                    return (
                      <button
                        key={ep.number}
                        type="button"
                        onClick={() => {
                          setEpisode(ep.number);
                          setCurrentTime(0);
                          setIsPlaying(true);
                        }}
                        className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#E11D48] border-[#E11D48] text-white'
                            : 'bg-[#181B24] hover:bg-[#232734] border-white/10 text-[#CBD5E1]'
                        }`}
                      >
                        <span className="tabular-nums">Eps {ep.number}</span> · {ep.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!user && (
              <p className="text-xs text-[#9BA1B0] pt-1">
                Masuk dengan akun Google agar progres tontonan tersimpan dan rekomendasi otomatis menyesuaikan selera Anda.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
