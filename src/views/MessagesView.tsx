import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';
import {
  fetchUserChats,
  subscribeToMessages,
  sendChatMessage
} from '../services/chatService';
import type { ChatConversation, ChatMessage } from '../types';

interface MessagesViewProps {
  initialChatUserId?: string;
  initialChatUserName?: string;
  onRequireLogin: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  initialChatUserId,
  initialChatUserName,
  onRequireLogin
}) => {
  const { currentUser, userProfile } = useAuth();
  const { t, getTimeAgo } = useI18n();
  const { showToast } = useToast();

  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ userId: string; name: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;

    setLoadingChats(true);
    fetchUserChats(currentUser.uid)
      .then((c) => {
        setChats(c);
        if (initialChatUserId) {
          const found = c.find((item) => item.userId === initialChatUserId);
          setSelectedChat({
            userId: initialChatUserId,
            name: found?.name || initialChatUserName || 'Usuário'
          });
        } else if (c.length > 0 && !selectedChat) {
          setSelectedChat({ userId: c[0].userId, name: c[0].name });
        }
      })
      .finally(() => setLoadingChats(false));
  }, [currentUser, initialChatUserId, initialChatUserName]);

  // Subscribe to active chat messages
  useEffect(() => {
    if (!currentUser || !selectedChat) {
      setMessages([]);
      return;
    }

    const unsub = subscribeToMessages(currentUser.uid, selectedChat.userId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsub();
  }, [currentUser, selectedChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser || !selectedChat) return;
    if (!messageInput.trim()) return;

    const text = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      const ok = await sendChatMessage({
        senderId: currentUser.uid,
        senderName: userProfile?.nome || currentUser.displayName || 'Usuário',
        senderAvatar: userProfile?.profilePictureUrl || currentUser.photoURL || null,
        receiverId: selectedChat.userId,
        message: text
      });

      if (!ok) {
        showToast('Erro ao enviar mensagem', 'error');
      } else {
        // Refresh chats list to show latest snippet
        fetchUserChats(currentUser.uid).then(setChats);
      }
    } catch {
      showToast('Erro ao enviar mensagem', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="feed-container card text-center py-16">
        <span className="material-icons text-5xl text-neutral-600 mb-2">lock</span>
        <h3 className="text-base font-bold text-white mb-2">Mensagens Diretas</h3>
        <p className="text-xs text-neutral-400 mb-4">Faça login para conversar em tempo real com outros usuários.</p>
        <button className="btn-primary text-xs px-5 py-2.5" onClick={onRequireLogin}>
          Entrar Agora
        </button>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="mb-4 pb-2 border-b border-neutral-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>💬</span> {t('nav.messages')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#161622] border border-neutral-800 rounded-2xl overflow-hidden min-h-[520px]">
        {/* Conversations List */}
        <div className="border-r border-neutral-800/80 flex flex-col">
          <div className="p-3 border-b border-neutral-800/80 font-semibold text-xs text-neutral-400 uppercase tracking-wider">
            Conversas
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-neutral-800/50">
            {loadingChats ? (
              <div className="p-6 text-center text-xs text-neutral-500">Carregando conversas...</div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                <span className="material-icons text-3xl mb-1 text-neutral-600">forum</span>
                <p>Nenhuma conversa ativa.</p>
                <p className="text-[11px] text-neutral-600 mt-1">Visite o perfil de um usuário para iniciar uma mensagem!</p>
              </div>
            ) : (
              chats.map((c) => {
                const isSelected = selectedChat?.userId === c.userId;
                const initial = c.name.charAt(0).toUpperCase();

                return (
                  <div
                    key={c.userId}
                    className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#667eea]/20' : 'hover:bg-neutral-800/50'
                    }`}
                    onClick={() => setSelectedChat({ userId: c.userId, name: c.name })}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center font-bold text-white text-sm shrink-0 overflow-hidden">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">{c.name}</span>
                        <span className="text-[10px] text-neutral-500">{getTimeAgo(c.lastMessageTime)}</span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{c.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active Chat Conversation */}
        <div className="md:col-span-2 flex flex-col h-[520px]">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900/60">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center font-bold text-white text-xs">
                  {selectedChat.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{selectedChat.name}</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    <span>Online no Bemtevi</span>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 text-xs">
                    <span className="material-icons text-4xl mb-1 text-neutral-600">chat_bubble_outline</span>
                    <p>Inicie uma conversa amigável com {selectedChat.name}!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === currentUser.uid;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs break-words leading-relaxed ${
                            isOwn
                              ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-br-none shadow-md'
                              : 'bg-neutral-800 text-neutral-200 rounded-bl-none border border-neutral-700/60'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-1 px-1">
                          {getTimeAgo(msg.timestamp)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-neutral-900/50 flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva uma mensagem..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#667eea]"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={sending || !messageInput.trim()}
                  className="btn-primary text-xs px-4 py-2 font-semibold disabled:opacity-50"
                >
                  {sending ? '...' : 'Enviar'}
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 text-xs p-6">
              <span className="material-icons text-5xl mb-2 text-neutral-600">mark_chat_unread</span>
              <p>Selecione uma conversa ao lado para começar a interagir.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
