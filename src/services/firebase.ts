import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  documentId,
  type Firestore,
  type DocumentSnapshot,
  type QuerySnapshot
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wzzm-ce3fc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wzzm-ce3fc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wzzm-ce3fc.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "249427877153",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:249427877153:web:0e4297294794a5aadeb260"
};

// Singleton App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Optimized Firestore with offline cache resilience
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// In-Memory Profile Cache to eliminate N+1 Firestore queries
export const userProfileCache = new Map<string, { data: any; cachedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getCachedUserData(userId: string) {
  const cached = userProfileCache.get(userId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const snap = await getDoc(doc(db, 'usuarios', userId));
    if (snap.exists()) {
      const data = snap.data();
      userProfileCache.set(userId, { data, cachedAt: Date.now() });
      return data;
    }
  } catch (err) {
    console.warn(`[Firebase Optimization] Could not fetch cached user ${userId}:`, err);
  }
  return null;
}

export function invalidateUserCache(userId: string) {
  userProfileCache.delete(userId);
}

export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  documentId,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type Firestore,
  type Auth,
  type User,
  type DocumentSnapshot,
  type QuerySnapshot
};
