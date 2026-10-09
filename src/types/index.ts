export interface UserProfile {
  uid: string;
  nome: string;
  email?: string;
  profilePictureUrl?: string | null;
  bio?: string;
  karma?: number;
  isBanned?: boolean;
  banReason?: string;
  seguidoresCount?: number;
  seguindoCount?: number;
  postsCount?: number;
  savedPostIds?: string[];
  createdAt?: any;
}

export interface Post {
  id: string;
  conteudo: string;
  userId: string;
  userNome: string;
  userAvatar?: string | null;
  categoria: string;
  link?: string | null;
  communityId?: string | null;
  communityName?: string | null;
  likes: number;
  usuariosQueCurtiram?: string[];
  comentarios: number;
  shares?: number;
  denuncias?: string[];
  createdAt?: any;
}

export interface CommentItem {
  id: string;
  postId: string;
  userId: string;
  userNome: string;
  userAvatar?: string | null;
  texto: string;
  createdAt?: any;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  creatorId?: string;
  creatorName?: string;
  memberCount: number;
  postCount: number;
  members?: string[];
  createdAt?: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  receiverId: string;
  message: string;
  timestamp?: any;
  read: boolean;
}

export interface ChatConversation {
  userId: string;
  name: string;
  avatar?: string | null;
  lastMessage: string;
  lastMessageTime: any;
  chatId: string;
  unread?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt?: any;
}

export interface TrendingTopic {
  name: string;
  count: number;
}

export type FeedTab = 'for-you' | 'latest' | 'my-posts';
export type AppView = 'feed' | 'explore' | 'communities' | 'community' | 'messages' | 'saved' | 'profile';
export type Locale = 'pt-BR' | 'en-US' | 'es-ES';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  acceptedAt?: string;
}
