import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from './firebase';
import type { Community, Post } from '../types';

export async function fetchCommunities(
  filter: 'all' | 'mine' | 'popular' = 'all',
  userId?: string
): Promise<Community[]> {
  try {
    let q;

    if (filter === 'mine' && userId) {
      q = query(collection(db, 'comunidades'), where('members', 'array-contains', userId));
    } else if (filter === 'popular') {
      q = query(collection(db, 'comunidades'), orderBy('memberCount', 'desc'), limit(30));
    } else {
      q = query(collection(db, 'comunidades'), orderBy('memberCount', 'desc'), limit(30));
    }

    const snap = await getDocs(q);
    const result: Community[] = [];

    snap.forEach((d) => {
      const data = d.data();
      const members = data.members || [];
      result.push({
        id: d.id,
        name: data.name || 'Sem nome',
        description: data.description || '',
        category: data.category || 'Geral',
        creatorId: data.creatorId || '',
        creatorName: data.creatorName || '',
        memberCount: typeof data.memberCount === 'number' ? data.memberCount : members.length,
        postCount: typeof data.postCount === 'number' ? data.postCount : 0,
        members,
        createdAt: data.createdAt
      });
    });

    return result;
  } catch (err) {
    console.error('Erro ao buscar comunidades:', err);
    return [];
  }
}

export async function getCommunityById(communityId: string): Promise<Community | null> {
  try {
    const snap = await getDoc(doc(db, 'comunidades', communityId));
    if (!snap.exists()) return null;
    const data = snap.data();
    const members = data.members || [];
    return {
      id: snap.id,
      name: data.name || 'Sem nome',
      description: data.description || '',
      category: data.category || 'Geral',
      creatorId: data.creatorId || '',
      creatorName: data.creatorName || '',
      memberCount: typeof data.memberCount === 'number' ? data.memberCount : members.length,
      postCount: typeof data.postCount === 'number' ? data.postCount : 0,
      members,
      createdAt: data.createdAt
    };
  } catch (err) {
    console.error('Erro ao buscar comunidade:', err);
    return null;
  }
}

export async function createCommunity(params: {
  name: string;
  description: string;
  category: string;
  creatorId: string;
  creatorName: string;
}): Promise<Community> {
  const { name, description, category, creatorId, creatorName } = params;

  if (!name || name.trim().length < 3 || name.trim().length > 50) {
    throw new Error('O nome da comunidade deve ter entre 3 e 50 caracteres.');
  }

  const communityData = {
    name: name.trim(),
    description: description.trim(),
    category,
    creatorId,
    creatorName,
    memberCount: 1,
    postCount: 0,
    members: [creatorId],
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'comunidades'), communityData);

  return {
    id: docRef.id,
    ...communityData,
    createdAt: new Date()
  };
}

export async function toggleJoinCommunity(communityId: string, userId: string): Promise<boolean> {
  const communityRef = doc(db, 'comunidades', communityId);
  const snap = await getDoc(communityRef);
  if (!snap.exists()) throw new Error('Comunidade não encontrada');

  const data = snap.data();
  const members: string[] = data.members || [];
  const isMember = members.includes(userId);

  if (isMember) {
    await updateDoc(communityRef, {
      members: arrayRemove(userId),
      memberCount: increment(-1)
    });
    return false; // Left
  } else {
    await updateDoc(communityRef, {
      members: arrayUnion(userId),
      memberCount: increment(1)
    });
    return true; // Joined
  }
}

export async function getCommunityPosts(communityId: string, limitCount: number = 30): Promise<Post[]> {
  try {
    const q = query(
      collection(db, 'Bemtevi'),
      where('communityId', '==', communityId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const posts: Post[] = [];
    snap.forEach((d) => {
      const data = d.data();
      posts.push({
        id: d.id,
        conteudo: data.conteudo || '',
        userId: data.userId || '',
        userNome: data.userNome || 'Anônimo',
        userAvatar: data.userAvatar || null,
        categoria: data.categoria || 'Geral',
        link: data.link || null,
        communityId: data.communityId || null,
        communityName: data.communityName || null,
        likes: data.likes || 0,
        usuariosQueCurtiram: data.usuariosQueCurtiram || [],
        comentarios: data.comentarios || 0,
        shares: data.shares || 0,
        createdAt: data.createdAt
      });
    });
    return posts;
  } catch (err) {
    console.error('Erro ao buscar posts da comunidade:', err);
    return [];
  }
}
