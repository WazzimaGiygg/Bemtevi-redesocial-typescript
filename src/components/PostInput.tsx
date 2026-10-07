import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';
import { createNewPost } from '../services/postService';
import type { Post } from '../types';

interface PostInputProps {
  onPostCreated: (post: Post) => void;
  communityId?: string | null;
  communityName?: string | null;
  onRequireLogin: () => void;
}

export const PostInput: React.FC<PostInputProps> = ({
  onPostCreated,
  communityId,
  communityName,
  onRequireLogin
}) => {
  const { currentUser, userProfile, isBanned } = useAuth();
  const { t, getCategoryLabel } = useI18n();
  const { showToast } = useToast();

  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [categoria, setCategoria] = useState('Geral');
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const maxLen = 127;
  const len = text.length;
  const remaining = maxLen - len;
  const percentage = Math.min(100, Math.round((len / maxLen) * 100));

  // Circular progress calculation
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let progressColor = '#6366f1';
  if (remaining <= 7) progressColor = '#ef4444';
  else if (remaining <= 20) progressColor = '#f59e0b';

  const categories = [
    'Geral',
    'Tecnologia',
    'Ciência',
    'Arte',
    'Música',
    'Esportes',
    'Games',
    'Educação',
    'Política',
    'Entretenimento'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (isBanned) {
      showToast(t('post.banned'), 'error');
      return;
    }

    if (!text.trim()) {
      showToast(t('post.empty'), 'error');
      return;
    }

    if (text.length > maxLen) {
      showToast(t('post.maxLength'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const newPost = await createNewPost({
        conteudo: text,
        userId: currentUser.uid,
        userNome: userProfile?.nome || currentUser.displayName || 'Usuário',
        userAvatar: userProfile?.profilePictureUrl || currentUser.photoURL || null,
        categoria: communityId ? 'Comunidade' : categoria,
        link: link.trim() || null,
        communityId: communityId || null,
        communityName: communityName || null
      });

      if (newPost) {
        onPostCreated(newPost);
        setText('');
        setLink('');
        setShowLinkInput(false);
        setIsFocused(false);
        showToast(t('post.success'), 'success');
      }
    } catch (err: any) {
      showToast(err.message || t('post.error'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = userProfile?.nome || currentUser?.displayName || 'Visitante';
  const initial = displayName.charAt(0).toUpperCase() || '?';

  return (
    <div className={`post-box transition-all ${isFocused ? 'ring-1 ring-indigo-500/40 bg-[#131522]' : 'bg-[#10121d]'}`}>
      <form onSubmit={handleSubmit}>
        <div className="post-input-area">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center font-bold text-white text-sm shrink-0 overflow-hidden shadow-md">
            {userProfile?.profilePictureUrl ? (
              <img src={userProfile.profilePictureUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{currentUser ? initial : '👤'}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <textarea
              className="post-textarea"
              rows={isFocused || text ? 3 : 2}
              placeholder={communityName ? `Postar em ${communityName}...` : t('post.placeholder')}
              maxLength={maxLen}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => {
                if (!currentUser) onRequireLogin();
                else setIsFocused(true);
              }}
            />

            {showLinkInput && (
              <div className="mt-2 flex items-center gap-2 bg-[#0c0d15] px-3 py-2 rounded-xl border border-[#1e2338]">
                <span className="material-icons text-neutral-500 text-sm">link</span>
                <input
                  type="url"
                  placeholder={t('post.linkPlaceholder')}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-transparent text-xs text-neutral-200 outline-none placeholder-neutral-600"
                />
                {link && (
                  <button
                    type="button"
                    onClick={() => setLink('')}
                    className="text-neutral-500 hover:text-neutral-300 text-xs"
                  >
                    &times;
                  </button>
                )}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-[#1c2035] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!communityId && (
                  <select
                    className="bg-[#151828] text-neutral-300 text-xs px-2.5 py-1.5 rounded-xl border border-[#212640] outline-none cursor-pointer hover:border-indigo-500/50 transition-colors"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-[#10121d] text-white">
                        {getCategoryLabel(c)}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${
                    showLinkInput
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-[#151828] text-neutral-400 border-[#212640] hover:text-white hover:border-neutral-600'
                  }`}
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  title="Anexar Link"
                >
                  <span className="material-icons text-xs">link</span>
                  <span>Link</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Circular Character Limit Ring */}
                <div className="flex items-center gap-1.5" title={`${remaining} caracteres restantes`}>
                  <svg className="w-6 h-6 transform -rotate-90">
                    <circle
                      cx="12"
                      cy="12"
                      r={radius}
                      stroke="#22273e"
                      strokeWidth="2.5"
                      fill="transparent"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r={radius}
                      stroke={progressColor}
                      strokeWidth="2.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-150"
                    />
                  </svg>
                  <span className={`text-[11px] font-semibold tabular-nums ${remaining <= 15 ? 'text-amber-400' : 'text-neutral-500'}`}>
                    {remaining}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || (currentUser !== null && !text.trim())}
                  className="btn-primary text-xs px-4 py-2 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? '...' : t('post.button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
