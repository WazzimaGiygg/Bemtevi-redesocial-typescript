import {
  db,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from './firebase';
import type { NotificationItem } from '../types';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string | null
): Promise<void> {
  try {
    await addDoc(collection(db, 'usuarios', userId, 'notificacoes'), {
      title,
      message,
      link: link || null,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Erro ao criar notificação:', err);
  }
}

export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: NotificationItem[]) => void
): () => void {
  const q = query(
    collection(db, 'usuarios', userId, 'notificacoes'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          userId,
          title: data.title || '',
          message: data.message || '',
          link: data.link || null,
          read: !!data.read,
          createdAt: data.createdAt
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Erro ao monitorar notificações:', err);
    }
  );
}

export async function markNotificationAsRead(userId: string, notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'usuarios', userId, 'notificacoes', notifId), {
      read: true
    });
  } catch (err) {
    console.warn('Erro ao marcar notificação como lida:', err);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const snap = await getDocs(
      query(collection(db, 'usuarios', userId, 'notificacoes'), limit(30))
    );
    const promises = snap.docs
      .filter((d) => !d.data().read)
      .map((d) => updateDoc(d.ref, { read: true }));
    await Promise.all(promises);
  } catch (err) {
    console.warn('Erro ao marcar todas notificações:', err);
  }
}
