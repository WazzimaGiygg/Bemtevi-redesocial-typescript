import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getCachedUserData
} from './firebase';
import type { ChatMessage, ChatConversation } from '../types';

export function getChatId(userA: string, userB: string): string {
  return [userA, userB].sort().join('_');
}

export async function sendChatMessage(params: {
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  receiverId: string;
  message: string;
}): Promise<boolean> {
  const { senderId, senderName, senderAvatar, receiverId, message } = params;
  if (!message || message.trim().length === 0) return false;

  try {
    const chatId = getChatId(senderId, receiverId);
    const text = message.trim();

    const messageData = {
      senderId,
      senderName,
      senderAvatar: senderAvatar || null,
      receiverId,
      message: text,
      timestamp: serverTimestamp(),
      read: false
    };

    // Add message
    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

    // Update root chat
    await setDoc(
      doc(db, 'chats', chatId),
      {
        participants: [senderId, receiverId],
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    // Update conversation references for both users
    await setDoc(
      doc(db, 'usuarios', senderId, 'chats', receiverId),
      {
        chatId,
        lastMessage: text,
        lastMessageTime: serverTimestamp()
      },
      { merge: true }
    );

    await setDoc(
      doc(db, 'usuarios', receiverId, 'chats', senderId),
      {
        chatId,
        lastMessage: text,
        lastMessageTime: serverTimestamp()
      },
      { merge: true }
    );

    return true;
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    return false;
  }
}

export async function fetchUserChats(userId: string): Promise<ChatConversation[]> {
  try {
    const q = query(
      collection(db, 'usuarios', userId, 'chats'),
      orderBy('lastMessageTime', 'desc')
    );
    const snap = await getDocs(q);

    const conversations: ChatConversation[] = [];

    for (const d of snap.docs) {
      const data = d.data();
      const partnerId = d.id;

      // Use cached user data to prevent duplicate reads
      const partnerData = await getCachedUserData(partnerId);

      conversations.push({
        userId: partnerId,
        name: partnerData?.nome || partnerData?.name || 'Usuário',
        avatar: partnerData?.profilePictureUrl || null,
        lastMessage: data.lastMessage || '',
        lastMessageTime: data.lastMessageTime || new Date(),
        chatId: data.chatId || getChatId(userId, partnerId)
      });
    }

    return conversations;
  } catch (err) {
    console.error('Erro ao buscar conversas:', err);
    return [];
  }
}

export function subscribeToMessages(
  userIdA: string,
  userIdB: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  const chatId = getChatId(userIdA, userIdB);
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        messages.push({
          id: d.id,
          senderId: data.senderId,
          senderName: data.senderName || 'Usuário',
          senderAvatar: data.senderAvatar || null,
          receiverId: data.receiverId,
          message: data.message || '',
          timestamp: data.timestamp,
          read: !!data.read
        });
      });
      // Order chronologically for display
      onUpdate(messages.reverse());

      // Auto mark unread messages as read
      messages.forEach((m) => {
        if (m.receiverId === userIdA && !m.read) {
          updateDoc(doc(db, 'chats', chatId, 'messages', m.id), { read: true }).catch(() => {});
        }
      });
    },
    (err) => {
      console.warn('Erro no listener de mensagens:', err);
    }
  );
}
