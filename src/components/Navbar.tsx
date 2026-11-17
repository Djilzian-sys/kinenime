import React from 'react';
import { useAuthData } from '../context/AuthDataContext';

export type NavTab = 'home' | 'anime' | 'movie' | 'favorites' | 'premium' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export function Navbar({ activeTab, onSelectTab }: NavbarProps) {
  const { user, profile, authBusy, isPremium, loginWithGoogle } = useAuthData();

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Beranda' },
    { id: 'anime', label: 'Anime' },
    { id: 'movie', label: 'Film' },
    { id: 'favorites', label: 'Favorit' },
    { id: 'premium', label: 'Premium' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#08090C]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="font-display text-xl font-bold tracking-tight text-[#F4F5F7] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          KineNime
        </button>

        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'text-[#F4F5F7]'
                    : 'text-[#9BA1B0] hover:text-[#F4F5F7]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[21px] h-[2px] bg-[#E11D48]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          {user ? (
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2.5 px-3 py-1.5 min-h-[40px] rounded-lg bg-[#111319] hover:bg-[#181B24] border border-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {profile?.photoURL || user.photoURL ? (
                <img
                  src={profile?.photoURL || user.photoURL || ''}
                  alt={profile?.displayName || user.displayName || 'Profil'}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-[#E11D48] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  {(profile?.displayName || user.displayName || 'P').charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-medium text-[#F4F5F7] max-w-[130px] truncate">
                {profile?.displayName || user.displayName || 'Profil Saya'}
              </span>
              {isPremium && (
                <span className="text-xs font-medium text-[#D4A853] hidden sm:inline">
                  · Premium
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={authBusy}
              onClick={() => void loginWithGoogle()}
              className="px-4 py-2 min-h-[40px] rounded-lg bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-60 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {authBusy ? 'Menghubungkan...' : 'Masuk Google'}
            </button>
          )}
        </div>
      </div>

      {/* Compact mobile nav bar */}
      <nav
        aria-label="Navigasi Mobile"
        className="flex md:hidden items-center justify-between px-4 py-2 border-t border-white/[0.06] overflow-x-auto gap-4"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`text-xs font-medium py-1 whitespace-nowrap shrink-0 cursor-pointer ${
                isActive ? 'text-[#E11D48]' : 'text-[#9BA1B0]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
