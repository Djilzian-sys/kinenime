import React, { useState } from 'react';
import { Check, Crown, ShieldCheck, X } from 'lucide-react';
import { useAuthData } from '../context/AuthDataContext';

interface PremiumViewProps {
  onClose?: () => void;
  isModal?: boolean;
}

export function PremiumView({ onClose, isModal = false }: PremiumViewProps) {
  const { user, profile, isPremium, loginWithGoogle, activatePremium, cancelPremium } =
    useAuthData();
  const [submitting, setSubmitting] = useState<'monthly' | 'yearly' | 'cancel' | null>(
    null
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelectPlan = async (plan: 'monthly' | 'yearly') => {
    setFeedback(null);
    if (!user) {
      const ok = await loginWithGoogle();
      if (!ok) return;
    }
    setSubmitting(plan);
    try {
      await activatePremium(plan);
      setFeedback(
        plan === 'yearly'
          ? 'Paket Premium Tahunan aktif. Seluruh konten eksklusif terbuka tanpa iklan.'
          : 'Paket Premium Bulanan aktif. Seluruh konten eksklusif terbuka tanpa iklan.'
      );
    } finally {
      setSubmitting(null);
    }
  };

  const handleCancel = async () => {
    setSubmitting('cancel');
    setFeedback(null);
    try {
      await cancelPremium();
      setFeedback('Keanggotaan dikembalikan ke Paket Gratis.');
    } finally {
      setSubmitting(null);
    }
  };

  const content = (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-[#D4A853]">Keanggotaan KineNime</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F7]">
            Nonton Anime &amp; Film Tanpa Iklan, Buka Konten Eksklusif
          </h2>
          <p className="text-sm text-[#9BA1B0] leading-relaxed">
            Nikmati penayangan langsung tanpa jeda iklan, akses penuh ke seluruh rilisan Eksklusif Premium, dan pemutaran hingga resolusi 4K Ultra HD.
          </p>
        </div>

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog Premium"
            className="w-10 h-10 rounded-lg bg-[#181B24] hover:bg-[#232734] border border-white/10 flex items-center justify-center text-[#F4F5F7] shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-[#181B24] border border-[#D4A853]/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-[#F4F5F7]">
            <ShieldCheck className="w-4 h-4 text-[#D4A853] shrink-0" />
            <span>{feedback}</span>
          </div>
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#D4A853] text-[#08090C] text-xs font-semibold shrink-0 cursor-pointer"
            >
              Mulai Menonton
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Tier */}
        <div className="flex flex-col justify-between p-6 rounded-xl bg-[#111319] border border-white/[0.08] space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-[#9BA1B0]">Paket Dasar</p>
            <h3 className="font-display text-xl font-semibold text-[#F4F5F7]">Gratis</h3>
            <p className="font-mono text-2xl font-semibold text-[#F4F5F7] tabular-nums">
              Rp 0<span className="text-xs font-sans font-normal text-[#9BA1B0]"> / bulan</span>
            </p>
            <ul className="space-y-2.5 pt-3 text-sm text-[#CBD5E1]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#9BA1B0] shrink-0 mt-0.5" />
                <span>Akses katalog anime &amp; film reguler</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#9BA1B0] shrink-0 mt-0.5" />
                <span>Kualitas streaming HD 1080p</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#9BA1B0] shrink-0 mt-0.5" />
                <span>Termasuk jeda iklan sponsor sebelum tayangan</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            {isPremium ? (
              <button
                type="button"
                disabled={submitting !== null}
                onClick={() => void handleCancel()}
                className="w-full py-2.5 px-4 min-h-[42px] rounded-lg bg-[#181B24] hover:bg-[#232734] border border-white/10 text-xs font-medium text-[#CBD5E1] transition-colors cursor-pointer"
              >
                {submitting === 'cancel' ? 'Memproses...' : 'Kembalikan ke Gratis'}
              </button>
            ) : (
              <div className="w-full py-2.5 px-4 min-h-[42px] rounded-lg bg-[#181B24] border border-white/[0.06] text-xs font-medium text-[#9BA1B0] text-center flex items-center justify-center">
                {user ? 'Paket Aktif Saat Ini' : 'Tersedia Tanpa Biaya'}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Premium */}
        <div className="flex flex-col justify-between p-6 rounded-xl bg-[#111319] border border-white/15 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-[#D4A853]">Fleksibel Bulanan</p>
            <h3 className="font-display text-xl font-semibold text-[#F4F5F7]">
              Premium Bulanan
            </h3>
            <p className="font-mono text-2xl font-semibold text-[#F4F5F7] tabular-nums">
              Rp 49.000
              <span className="text-xs font-sans font-normal text-[#9BA1B0]"> / bulan</span>
            </p>
            <ul className="space-y-2.5 pt-3 text-sm text-[#CBD5E1]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
                <span>Menonton 100% bebas iklan setiap saat</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
                <span>Buka seluruh serial &amp; film Eksklusif Premium</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
                <span>Dukungan kualitas 4K Ultra HD</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={submitting !== null || profile?.premiumPlan === 'monthly'}
            onClick={() => void handleSelectPlan('monthly')}
            className="w-full py-2.5 px-4 min-h-[44px] rounded-lg bg-[#181B24] hover:bg-[#232734] disabled:opacity-60 border border-[#D4A853]/50 text-sm font-semibold text-[#F4F5F7] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown className="w-4 h-4 text-[#D4A853]" />
            <span>
              {profile?.premiumPlan === 'monthly'
                ? 'Paket Aktif'
                : submitting === 'monthly'
                  ? 'Mengaktifkan...'
                  : user
                    ? 'Aktifkan Bulanan'
                    : 'Masuk Google & Aktifkan'}
            </span>
          </button>
        </div>

        {/* Yearly Premium */}
        <div className="flex flex-col justify-between p-6 rounded-xl bg-[#161922] border border-[#D4A853]/50 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-[#D4A853]">Hemat 32% · Pilihan Terbaik</p>
            <h3 className="font-display text-xl font-semibold text-[#F4F5F7]">
              Premium Tahunan
            </h3>
            <p className="font-mono text-2xl font-semibold text-[#F4F5F7] tabular-nums">
              Rp 399.000
              <span className="text-xs font-sans font-normal text-[#9BA1B0]"> / tahun</span>
            </p>
            <ul className="space-y-2.5 pt-3 text-sm text-[#CBD5E1]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
                <span>Semua manfaat Premium Bulanan</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
                <span>Prioritas rilisan film &amp; anime terbaru</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
                <span>Sinkronisasi daftar favorit &amp; riwayat lintas perangkat</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={submitting !== null || profile?.premiumPlan === 'yearly'}
            onClick={() => void handleSelectPlan('yearly')}
            className="w-full py-2.5 px-4 min-h-[44px] rounded-lg bg-[#D4A853] hover:bg-[#C39540] disabled:opacity-60 text-[#08090C] text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>
              {profile?.premiumPlan === 'yearly'
                ? 'Paket Aktif'
                : submitting === 'yearly'
                  ? 'Mengaktifkan...'
                  : user
                    ? 'Aktifkan Tahunan'
                    : 'Masuk Google & Aktifkan'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Langganan KineNime Premium"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        <div className="w-full max-w-5xl bg-[#0D0F14] border border-white/10 rounded-xl p-6 sm:p-8 my-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-[1360px] mx-auto px-4 sm:px-8 py-12">{content}</section>
  );
}
