import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  limit,
  serverTimestamp,
  increment,
  getCachedUserData,
  invalidateUserCache,
  type User
} from './firebase';
import type { UserProfile } from '../types';

export function getKarmaLevel(karma: number): string {
  if (karma >= 500) return 'Lendário';
  if (karma >= 200) return 'Veterano';
  if (karma >= 100) return 'Membro Ativo';
  if (karma >= 50) return 'Entusiasta';
  if (karma >= 20) return 'Iniciante';
  return 'Novato';
}

export async function registerUser(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'usuarios', user.uid);
  let profile: UserProfile = {
    uid: user.uid,
    nome: user.displayName || 'Usuário',
    email: user.email || '',
    profilePictureUrl: user.photoURL || null,
    karma: 0,
    bio: ''
  };

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        nome: user.displayName || 'Usuário',
        email: user.email || '',
        profilePictureUrl: user.photoURL || null,
        criadoEm: serverTimestamp(),
        ultimoLogin: serverTimestamp(),
        karma: 0,
        banido: false,
        bio: ''
      });
    } else {
      const data = snap.data();
      profile = {
        uid: user.uid,
        nome: data.nome || user.displayName || 'Usuário',
        email: data.email || user.email || '',
        profilePictureUrl: data.profilePictureUrl || user.photoURL || null,
        karma: typeof data.karma === 'number' ? data.karma : 0,
        bio: data.bio || '',
        isBanned: !!data.banido,
        banReason: data.motivoBan || data.banReason || 'Violação das políticas de uso'
      };
      await updateDoc(userRef, {
        ultimoLogin: serverTimestamp()
      }).catch(() => {});
    }
  } catch (error) {
    console.warn('Erro ao registrar usuário no Firestore:', error);
  }

  invalidateUserCache(user.uid);
  return profile;
}

export async function checkIfUserIsBanned(userId: string): Promise<{ isBanned: boolean; reason?: string }> {
  try {
    const snap = await getDoc(doc(db, 'usuarios', userId));
    if (snap.exists()) {
      const data = snap.data();
      if (data.banido) {
        return { isBanned: true, reason: data.motivoBan || 'Violação das políticas de uso' };
      }
    }
  } catch (err) {
    console.warn('Erro ao verificar banimento:', err);
  }
  return { isBanned: false };
}

export async function getUserKarma(userId: string): Promise<number> {
  try {
    const data = await getCachedUserData(userId);
    if (data && typeof data.karma === 'number') {
      return data.karma;
    }
    const snap = await getDoc(doc(db, 'usuarios', userId));
    if (snap.exists()) {
      const val = snap.data().karma;
      return typeof val === 'number' ? val : 0;
    }
  } catch (err) {
    console.warn('Erro ao buscar karma:', err);
  }
  return 0;
}

export async function updateUserKarma(userId: string, amount: number): Promise<void> {
  try {
    const userRef = doc(db, 'usuarios', userId);
    await updateDoc(userRef, {
      karma: increment(amount)
    });
    invalidateUserCache(userId);
  } catch (err) {
    console.warn('Erro ao atualizar karma:', err);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'usuarios', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    let bio = data.bio || '';

    // Check subcollection perfil if bio is empty
    if (!bio) {
      try {
        const perfilSnap = await getDoc(doc(db, 'usuarios', userId, 'perfil', 'dados'));
        if (perfilSnap.exists()) {
          bio = perfilSnap.data().bio || '';
        }
      } catch {}
    }

    // Counts
    let seguidoresCount = 0;
    let seguindoCount = 0;
    try {
      const segSnap = await getDocs(collection(db, 'usuarios', userId, 'seguidores'));
      seguidoresCount = segSnap.size;
      const seguiSnap = await getDocs(collection(db, 'usuarios', userId, 'seguindo'));
      seguindoCount = seguiSnap.size;
    } catch {}

    return {
      uid: userId,
      nome: data.nome || 'Usuário',
      email: data.email || '',
      profilePictureUrl: data.profilePictureUrl || null,
      bio,
      karma: data.karma || 0,
      isBanned: !!data.banido,
      banReason: data.motivoBan,
      seguidoresCount,
      seguindoCount
    };
  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    return null;
  }
}

export async function updateUserBio(userId: string, bio: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'usuarios', userId), { bio: bio.trim() });
    await setDoc(doc(db, 'usuarios', userId, 'perfil', 'dados'), {
      bio: bio.trim(),
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(() => {});
    invalidateUserCache(userId);
    return true;
  } catch (err) {
    console.error('Erro ao salvar bio:', err);
    return false;
  }
}

export async function checkIsFollowing(currentUserId: string, targetUserId: string): Promise<boolean> {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return false;
  try {
    const snap = await getDoc(doc(db, 'usuarios', currentUserId, 'seguindo', targetUserId));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function toggleFollow(currentUserId: string, targetUserId: string): Promise<boolean> {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) return false;

  const followingRef = doc(db, 'usuarios', currentUserId, 'seguindo', targetUserId);
  const followersRef = doc(db, 'usuarios', targetUserId, 'seguidores', currentUserId);

  const snap = await getDoc(followingRef);
  if (snap.exists()) {
    await deleteDoc(followingRef);
    await deleteDoc(followersRef).catch(() => {});
    return false; // Now unfollowed
  } else {
    await setDoc(followingRef, {
      userId: targetUserId,
      seguidoDesde: serverTimestamp()
    });
    await setDoc(followersRef, {
      seguidorId: currentUserId,
      seguidoDesde: serverTimestamp()
    }).catch(() => {});
    return true; // Now following
  }
}

export async function getSuggestions(currentUserId?: string, count: number = 5): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'usuarios'), limit(15));
    const snap = await getDocs(q);
    const users: UserProfile[] = [];
    snap.forEach((d) => {
      if (!currentUserId || d.id !== currentUserId) {
        const data = d.data();
        if (!data.banido) {
          users.push({
            uid: d.id,
            nome: data.nome || 'Usuário',
            profilePictureUrl: data.profilePictureUrl || null,
            bio: data.bio || '',
            karma: data.karma || 0
          });
        }
      }
    });
    return users.slice(0, count);
  } catch (err) {
    console.warn('Erro ao buscar sugestões:', err);
    return [];
  }
}
