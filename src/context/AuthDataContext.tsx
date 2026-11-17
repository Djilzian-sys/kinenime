import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../firebase';
import { MediaItem } from '../data/catalog';
import {
  FavoriteRecord,
  WatchHistoryRecord,
} from '../utils/recommendations';

export type PremiumPlan = 'free' | 'monthly' | 'yearly';

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isPremium: boolean;
  premiumPlan: PremiumPlan;
  premiumSince?: string;
}

interface AuthDataContextValue {
  user: User | null;
  profile: UserProfileData | null;
  authReady: boolean;
  authBusy: boolean;
  authError: string | null;
  favorites: FavoriteRecord[];
  watchHistory: WatchHistoryRecord[];
  favoriteIds: Set<string>;
  isPremium: boolean;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  toggleFavorite: (media: MediaItem) => Promise<void>;
  recordWatchProgress: (
    media: MediaItem,
    episode: number,
    progressPercent: number
  ) => Promise<void>;
  removeWatchHistoryEntry: (mediaId: string) => Promise<void>;
  activatePremium: (plan: 'monthly' | 'yearly') => Promise<void>;
  cancelPremium: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthDataContext = createContext<AuthDataContextValue | undefined>(undefined);

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  return Date.now();
}

export function AuthDataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryRecord[]>([]);

  const ensureUserProfile = useCallback(async (firebaseUser: User) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const path = `users/${firebaseUser.uid}`;
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const displayName = (firebaseUser.displayName || 'Penonton KineNime')
          .trim()
          .slice(0, 100);
        const email = (firebaseUser.email || '').trim().slice(0, 200);
        const photoURL = (firebaseUser.photoURL || '').trim().slice(0, 500);

        const payload: Record<string, unknown> = {
          uid: firebaseUser.uid,
          email,
          displayName: displayName || 'Penonton KineNime',
          isPremium: false,
          premiumPlan: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (photoURL) {
          payload.photoURL = photoURL;
        }
        await setDoc(userRef, payload);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setProfile(null);
        setFavorites([]);
        setWatchHistory([]);
      } else {
        void ensureUserProfile(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, [ensureUserProfile]);

  useEffect(() => {
    if (!authReady || !user) return;

    const userPath = `users/${user.uid}`;
    const unsubProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProfile({
            uid: String(data.uid || user.uid),
            email: String(data.email || user.email || ''),
            displayName: String(data.displayName || user.displayName || 'Pengguna'),
            photoURL: typeof data.photoURL === 'string' ? data.photoURL : undefined,
            isPremium: Boolean(data.isPremium),
            premiumPlan:
              data.premiumPlan === 'monthly' || data.premiumPlan === 'yearly'
                ? data.premiumPlan
                : 'free',
            premiumSince:
              typeof data.premiumSince === 'string' ? data.premiumSince : undefined,
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, userPath);
      }
    );

    const favPath = `users/${user.uid}/favorites`;
    const favQuery = query(
      collection(db, 'users', user.uid, 'favorites'),
      orderBy('addedAt', 'desc')
    );
    const unsubFavorites = onSnapshot(
      favQuery,
      (snapshot) => {
        const items: FavoriteRecord[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            userId: String(data.userId || user.uid),
            mediaId: String(data.mediaId || d.id),
            mediaType: data.mediaType === 'movie' ? 'movie' : 'anime',
            title: String(data.title || ''),
            addedAtMs: toMillis(data.addedAt),
          };
        });
        setFavorites(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, favPath);
      }
    );

    const historyPath = `users/${user.uid}/watchHistory`;
    const historyQuery = query(
      collection(db, 'users', user.uid, 'watchHistory'),
      orderBy('watchedAt', 'desc')
    );
    const unsubHistory = onSnapshot(
      historyQuery,
      (snapshot) => {
        const items: WatchHistoryRecord[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            userId: String(data.userId || user.uid),
            mediaId: String(data.mediaId || d.id),
            mediaType: data.mediaType === 'movie' ? 'movie' : 'anime',
            title: String(data.title || ''),
            genres: Array.isArray(data.genres)
              ? data.genres.map((g) => String(g)).slice(0, 5)
              : [],
            episode: typeof data.episode === 'number' ? data.episode : 1,
            progressPercent:
              typeof data.progressPercent === 'number' ? data.progressPercent : 0,
            watchedAtMs: toMillis(data.watchedAt),
          };
        });
        setWatchHistory(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, historyPath);
      }
    );

    return () => {
      unsubProfile();
      unsubFavorites();
      unsubHistory();
    };
  }, [authReady, user]);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserProfile(result.user);
      return true;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal masuk dengan akun Google.';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError('Login Google dibatalkan atau gagal. Silakan coba lagi.');
      }
      return false;
    } finally {
      setAuthBusy(false);
    }
  }, [ensureUserProfile]);

  const logout = useCallback(async () => {
    setAuthBusy(true);
    try {
      await signOut(auth);
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.mediaId)),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (media: MediaItem) => {
      if (!user) return;
      const favRef = doc(db, 'users', user.uid, 'favorites', media.id);
      const path = `users/${user.uid}/favorites/${media.id}`;
      try {
        if (favoriteIds.has(media.id)) {
          await deleteDoc(favRef);
        } else {
          await setDoc(favRef, {
            userId: user.uid,
            mediaId: media.id.slice(0, 64),
            mediaType: media.mediaType,
            title: media.title.trim().slice(0, 150),
            addedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [user, favoriteIds]
  );

  const recordWatchProgress = useCallback(
    async (media: MediaItem, episode: number, progressPercent: number) => {
      if (!user) return;
      const safeEpisode = Math.max(1, Math.min(2000, Math.round(episode)));
      const safeProgress = Math.max(0, Math.min(100, Math.round(progressPercent)));
      const safeGenres = media.genres
        .map((g) => g.trim().slice(0, 40))
        .filter(Boolean)
        .slice(0, 5);
      if (safeGenres.length === 0) safeGenres.push('Umum');

      const historyRef = doc(db, 'users', user.uid, 'watchHistory', media.id);
      const path = `users/${user.uid}/watchHistory/${media.id}`;
      try {
        const existingSnap = await getDoc(historyRef);
        if (existingSnap.exists()) {
          await updateDoc(historyRef, {
            episode: safeEpisode,
            progressPercent: safeProgress,
            genres: safeGenres,
            watchedAt: serverTimestamp(),
          });
        } else {
          await setDoc(historyRef, {
            userId: user.uid,
            mediaId: media.id.slice(0, 64),
            mediaType: media.mediaType,
            title: media.title.trim().slice(0, 150),
            genres: safeGenres,
            episode: safeEpisode,
            progressPercent: safeProgress,
            watchedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [user]
  );

  const removeWatchHistoryEntry = useCallback(
    async (mediaId: string) => {
      if (!user) return;
      const path = `users/${user.uid}/watchHistory/${mediaId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'watchHistory', mediaId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user]
  );

  const activatePremium = useCallback(
    async (plan: 'monthly' | 'yearly') => {
      if (!user) return;
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          isPremium: true,
          premiumPlan: plan,
          premiumSince: new Date().toISOString().slice(0, 50),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [user]
  );

  const cancelPremium = useCallback(async () => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isPremium: false,
        premiumPlan: 'free',
        premiumSince: '',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }, [user]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const value: AuthDataContextValue = {
    user,
    profile,
    authReady,
    authBusy,
    authError,
    favorites,
    watchHistory,
    favoriteIds,
    isPremium: Boolean(profile?.isPremium),
    loginWithGoogle,
    logout,
    toggleFavorite,
    recordWatchProgress,
    removeWatchHistoryEntry,
    activatePremium,
    cancelPremium,
    clearAuthError,
  };

  return (
    <AuthDataContext.Provider value={value}>{children}</AuthDataContext.Provider>
  );
}

export function useAuthData(): AuthDataContextValue {
  const ctx = useContext(AuthDataContext);
  if (!ctx) {
    throw new Error('useAuthData harus digunakan di dalam AuthDataProvider');
  }
  return ctx;
}
