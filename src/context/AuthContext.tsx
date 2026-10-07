import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from '../services/firebase';
import {
  registerUser,
  checkIfUserIsBanned,
  getUserKarma,
  getUserProfile,
  updateUserBio as updateBioService
} from '../services/userService';
import { subscribeToNotifications } from '../services/notificationService';
import type { UserProfile, NotificationItem } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isBanned: boolean;
  banReason?: string;
  userKarma: number;
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateBio: (newBio: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | undefined>();
  const [userKarma, setUserKarma] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Listen to Firebase auth state
  useEffect(() => {
    let notifUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const profile = await registerUser(user);
          setUserProfile(profile);

          const banCheck = await checkIfUserIsBanned(user.uid);
          if (banCheck.isBanned) {
            setIsBanned(true);
            setBanReason(banCheck.reason);
            await signOut(auth);
            setCurrentUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }

          const karma = await getUserKarma(user.uid);
          setUserKarma(karma);

          // Subscribe to notifications
          notifUnsub = subscribeToNotifications(user.uid, (items) => {
            setNotifications(items);
          });
        } catch (err) {
          console.warn('Erro ao carregar dados do usuário:', err);
        }
      } else {
        // Check if guest demo session is saved
        const guestData = localStorage.getItem('bemtevi_guest_user');
        if (guestData) {
          try {
            const parsed = JSON.parse(guestData);
            setCurrentUser({
              uid: parsed.uid,
              displayName: parsed.nome,
              email: parsed.email,
              photoURL: parsed.profilePictureUrl
            } as User);
            setUserProfile(parsed);
            setUserKarma(parsed.karma || 15);
          } catch {
            setCurrentUser(null);
            setUserProfile(null);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setUserKarma(0);
          setNotifications([]);
        }
      }
      setLoading(false);
    });

    return () => {
      authUnsub();
      if (notifUnsub) notifUnsub();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Firebase Auth error:', error);
      // If popup was blocked or failed due to iframe constraints, fall back to guest demo option
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/internal-error'
      ) {
        throw new Error('O popup do Google foi bloqueado pelo navegador. Você pode entrar como Convidado para testar.');
      }
      throw error;
    }
  };

  const loginAsGuest = () => {
    const guestUid = 'guest_' + Math.random().toString(36).substring(2, 8);
    const guestProfile: UserProfile = {
      uid: guestUid,
      nome: 'Explorador Bemtevi',
      email: 'explorador@bemtevi.social',
      profilePictureUrl: null,
      karma: 25,
      bio: 'Apaixonado por conversas e tecnologia no Bemtevi!'
    };
    localStorage.setItem('bemtevi_guest_user', JSON.stringify(guestProfile));
    setCurrentUser({
      uid: guestProfile.uid,
      displayName: guestProfile.nome,
      email: guestProfile.email,
      photoURL: null
    } as User);
    setUserProfile(guestProfile);
    setUserKarma(25);
  };

  const logout = async () => {
    localStorage.removeItem('bemtevi_guest_user');
    await signOut(auth).catch(() => {});
    setCurrentUser(null);
    setUserProfile(null);
    setUserKarma(0);
    setNotifications([]);
  };

  const updateBio = async (newBio: string): Promise<boolean> => {
    if (!currentUser) return false;
    const ok = await updateBioService(currentUser.uid, newBio);
    if (ok) {
      setUserProfile((prev) => (prev ? { ...prev, bio: newBio } : null));
    }
    return ok;
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const p = await getUserProfile(currentUser.uid);
    if (p) setUserProfile(p);
    const k = await getUserKarma(currentUser.uid);
    setUserKarma(k);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isBanned,
        banReason,
        userKarma,
        notifications,
        unreadNotifsCount,
        loginWithGoogle,
        loginAsGuest,
        logout,
        updateBio,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
