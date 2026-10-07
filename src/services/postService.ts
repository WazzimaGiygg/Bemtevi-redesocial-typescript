import {
  db,
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
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  documentId,
  type DocumentSnapshot
} from './firebase';
import { updateUserKarma } from './userService';
import type { Post, CommentItem, FeedTab, TrendingTopic } from '../types';

export const CATEGORY_COLORS: Record<string, string> = {
  Geral: '#4a9eff',
  Tecnologia: '#00d2d3',
  Ciência: '#54a0ff',
  Arte: '#ff9ff3',
  Música: '#f368e0',
  Esportes: '#1dd1a1',
  Games: '#ff6b6b',
  Educação: '#feca57',
  Política: '#ff9f43',
  Entretenimento: '#ee5253'
};

export async function fetchPosts(
  feedTab: FeedTab,
  currentUserId?: string,
  categoryFilter?: string | null,
  lastDoc?: DocumentSnapshot | null,
  pageSize: number = 20
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  try {
    let constraints: any[] = [];

    if (categoryFilter && categoryFilter !== 'Todas' && categoryFilter !== 'Geral_All') {
      constraints.push(where('categoria', '==', categoryFilter));
    }

    if (feedTab === 'my-posts' && currentUserId) {
      constraints.push(where('userId', '==', currentUserId));
      constraints.push(orderBy('createdAt', 'desc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageSize));

    const q = query(collection(db, 'Bemtevi'), ...constraints);
    const snapshot = await getDocs(q);

    const posts: Post[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      posts.push({
        id: docSnap.id,
        conteudo: data.conteudo || '',
        userId: data.userId || '',
        userNome: data.userNome || 'Anônimo',
        userAvatar: data.userAvatar || null,
        categoria: data.categoria || 'Geral',
        link: data.link || null,
        communityId: data.communityId || null,
        communityName: data.communityName || null,
        likes: typeof data.likes === 'number' ? data.likes : (data.usuariosQueCurtiram?.length || 0),
        usuariosQueCurtiram: data.usuariosQueCurtiram || [],
        comentarios: typeof data.comentarios === 'number' ? data.comentarios : 0,
        shares: typeof data.shares === 'number' ? data.shares : 0,
        denuncias: data.denuncias || [],
        createdAt: data.createdAt
      });
    });

    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    return { posts, lastDoc: newLastDoc };
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return { posts: [], lastDoc: null };
  }
}

export async function createNewPost(params: {
  conteudo: string;
  userId: string;
  userNome: string;
  userAvatar?: string | null;
  categoria?: string;
  link?: string | null;
  communityId?: string | null;
  communityName?: string | null;
}): Promise<Post | null> {
  const { conteudo, userId, userNome, userAvatar, categoria = 'Geral', link, communityId, communityName } = params;

  if (!conteudo || conteudo.trim().length === 0 || conteudo.trim().length > 127) {
    throw new Error('O post deve ter entre 1 e 127 caracteres.');
  }

  const postData = {
    conteudo: conteudo.trim(),
    userId,
    userNome,
    userAvatar: userAvatar || null,
    categoria,
    link: link?.trim() || null,
    communityId: communityId || null,
    communityName: communityName || null,
    likes: 0,
    usuariosQueCurtiram: [],
    comentarios: 0,
    shares: 0,
    denuncias: [],
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'Bemtevi'), postData);

  // If in community, update community post count atomically
  if (communityId) {
    updateDoc(doc(db, 'comunidades', communityId), {
      postCount: increment(1)
    }).catch(() => {});
  }

  // Award karma to poster (+10)
  updateUserKarma(userId, 10);

  return {
    id: docRef.id,
    ...postData,
    createdAt: new Date()
  };
}

export async function toggleLikePost(postId: string, userId: string, postAuthorId?: string): Promise<{ liked: boolean; newCount: number }> {
  const postRef = doc(db, 'Bemtevi', postId);
  const snap = await getDoc(postRef);

  if (!snap.exists()) {
    throw new Error('Post não encontrado');
  }

  const data = snap.data();
  const likedUsers: string[] = data.usuariosQueCurtiram || [];
  const currentLikes: number = typeof data.likes === 'number' ? data.likes : likedUsers.length;
  const isCurrentlyLiked = likedUsers.includes(userId);

  if (isCurrentlyLiked) {
    const nextCount = Math.max(0, currentLikes - 1);
    await updateDoc(postRef, {
      likes: increment(-1),
      usuariosQueCurtiram: arrayRemove(userId)
    });
    if (postAuthorId && postAuthorId !== userId) {
      updateUserKarma(postAuthorId, -2);
    }
    return { liked: false, newCount: nextCount };
  } else {
    const nextCount = currentLikes + 1;
    await updateDoc(postRef, {
      likes: increment(1),
      usuariosQueCurtiram: arrayUnion(userId)
    });
    if (postAuthorId && postAuthorId !== userId) {
      updateUserKarma(postAuthorId, 2);
    }
    return { liked: true, newCount: nextCount };
  }
}

export async function toggleSavePost(postId: string, userId: string): Promise<boolean> {
  const savedRef = doc(db, 'usuarios', userId, 'savedPosts', postId);
  const snap = await getDoc(savedRef);

  if (snap.exists()) {
    await deleteDoc(savedRef);
    return false; // Removed
  } else {
    await setDoc(savedRef, {
      savedAt: serverTimestamp()
    });
    return true; // Saved
  }
}

export async function checkIfPostSaved(postId: string, userId: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'usuarios', userId, 'savedPosts', postId));
    return snap.exists();
  } catch {
    return false;
  }
}

// Optimized batch fetch of saved posts
export async function getSavedPosts(userId: string): Promise<Post[]> {
  try {
    const savedSnap = await getDocs(
      query(collection(db, 'usuarios', userId, 'savedPosts'), orderBy('savedAt', 'desc'), limit(50))
    );

    if (savedSnap.empty) return [];

    const postIds = savedSnap.docs.map((d) => d.id);
    const posts: Post[] = [];

    // Chunk into batches of 10 for documentId() 'in' query (Firestore max 30)
    for (let i = 0; i < postIds.length; i += 10) {
      const chunk = postIds.slice(i, i + 10);
      const postsQuery = query(collection(db, 'Bemtevi'), where(documentId(), 'in', chunk));
      const chunkSnap = await getDocs(postsQuery);
      chunkSnap.forEach((d) => {
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
    }

    return posts;
  } catch (err) {
    console.error('Erro ao buscar posts salvos:', err);
    return [];
  }
}

export async function deletePost(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'Bemtevi', postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return false;
    const data = snap.data();
    if (data.userId !== userId) {
      throw new Error('Você não tem permissão para excluir este post.');
    }
    await deleteDoc(postRef);

    if (data.communityId) {
      updateDoc(doc(db, 'comunidades', data.communityId), {
        postCount: increment(-1)
      }).catch(() => {});
    }

    return true;
  } catch (err) {
    console.error('Erro ao deletar post:', err);
    return false;
  }
}

export async function reportPost(postId: string, userId: string, reason: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'Bemtevi', postId);
    await updateDoc(postRef, {
      denuncias: arrayUnion({
        userId,
        motivo: reason,
        data: new Date().toISOString()
      })
    });
    return true;
  } catch (err) {
    console.error('Erro ao denunciar post:', err);
    return false;
  }
}

// Comments
export async function getPostComments(postId: string): Promise<CommentItem[]> {
  try {
    const q = query(collection(db, 'Bemtevi', postId, 'comentarios'), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    const comments: CommentItem[] = [];
    snap.forEach((d) => {
      const data = d.data();
      comments.push({
        id: d.id,
        postId,
        userId: data.userId,
        userNome: data.userNome || 'Anônimo',
        userAvatar: data.userAvatar || null,
        texto: data.texto || data.conteudo || '',
        createdAt: data.createdAt
      });
    });
    return comments;
  } catch (err) {
    console.error('Erro ao buscar comentários:', err);
    return [];
  }
}

export async function addPostComment(
  postId: string,
  userId: string,
  userNome: string,
  texto: string,
  userAvatar?: string | null,
  postAuthorId?: string
): Promise<CommentItem> {
  if (!texto || texto.trim().length === 0 || texto.trim().length > 280) {
    throw new Error('Comentário inválido (máx. 280 caracteres)');
  }

  const commentData = {
    userId,
    userNome,
    userAvatar: userAvatar || null,
    texto: texto.trim(),
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'Bemtevi', postId, 'comentarios'), commentData);

  // Increment comment count on post atomically
  await updateDoc(doc(db, 'Bemtevi', postId), {
    comentarios: increment(1)
  });

  // Award karma
  updateUserKarma(userId, 5);
  if (postAuthorId && postAuthorId !== userId) {
    updateUserKarma(postAuthorId, 3);
  }

  return {
    id: docRef.id,
    postId,
    userId,
    userNome,
    userAvatar: userAvatar || null,
    texto: texto.trim(),
    createdAt: new Date()
  };
}

// Trending Topics Cache
let trendingCache: { topics: TrendingTopic[]; cachedAt: number } | null = null;
const TRENDING_CACHE_MS = 60 * 1000; // 1 min

export async function getTrendingTopics(count: number = 10): Promise<TrendingTopic[]> {
  if (trendingCache && Date.now() - trendingCache.cachedAt < TRENDING_CACHE_MS) {
    return trendingCache.topics.slice(0, count);
  }

  try {
    const q = query(collection(db, 'Bemtevi'), orderBy('createdAt', 'desc'), limit(60));
    const snap = await getDocs(q);

    const counts: Record<string, number> = {};

    snap.forEach((d) => {
      const text = d.data().conteudo || '';
      // Extract hashtags
      const hashtags = text.match(/#[a-zA-Z0-9_\u00C0-\u017F]+/g) || [];
      hashtags.forEach((tag: string) => {
        const clean = tag.toLowerCase();
        counts[clean] = (counts[clean] || 0) + 1;
      });

      // Also significant words (3+ chars)
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w: string) => w.length > 4 && !['sobre', 'muito', 'fazer', 'agora', 'estou', 'todos', 'você', 'minha'].includes(w));
      words.forEach((w: string) => {
        counts[w] = (counts[w] || 0) + 1;
      });
    });

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Fallback default topics if none yet
    const defaults: TrendingTopic[] = [
      { name: '#Tecnologia', count: 18 },
      { name: '#Bemtevi', count: 14 },
      { name: '#OpenSource', count: 11 },
      { name: '#TypeScript', count: 9 },
      { name: '#Brasil', count: 7 }
    ];

    const result = sorted.length > 0 ? sorted : defaults;
    trendingCache = { topics: result, cachedAt: Date.now() };
    return result.slice(0, count);
  } catch (err) {
    console.warn('Erro ao calcular trending topics:', err);
    return [
      { name: '#Tecnologia', count: 18 },
      { name: '#Bemtevi', count: 14 },
      { name: '#OpenSource', count: 11 }
    ];
  }
}
