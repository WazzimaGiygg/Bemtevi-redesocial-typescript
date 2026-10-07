import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';
import { useToast } from '../../context/ToastContext';
import { getPostComments, addPostComment } from '../../services/postService';
import type { Post, CommentItem } from '../../types';

interface CommentsModalProps {
  post: Post | null;
  onClose: () => void;
  onRequireLogin: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ post, onClose, onRequireLogin }) => {
  const { currentUser, userProfile, isBanned } = useAuth();
  const { t, getTimeAgo } = useI18n();
  const { showToast } = useToast();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (post) {
      setLoading(true);
      getPostComments(post.id)
        .then(setComments)
        .finally(() => setLoading(false));
    }
  }, [post]);

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (isBanned) {
      showToast(t('comments.banned'), 'error');
      return;
    }

    if (!text.trim()) {
      showToast(t('comments.emptyText'), 'error');
      return;
    }

    if (text.length > 280) {
      showToast(t('comments.maxLength'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const newComment = await addPostComment(
        post.id,
        currentUser.uid,
        userProfile?.nome || currentUser.displayName || 'Usuário',
        text.trim(),
        userProfile?.profilePictureUrl || currentUser.photoURL || null,
        post.userId
      );

      setComments((prev) => [...prev, newComment]);
      setText('');
      showToast(t('comments.success'), 'success');
      post.comentarios = (post.comentarios || 0) + 1;
    } catch (err: any) {
      showToast(err.message || t('comments.errorSend'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="flex items-center gap-2">
            <span className="material-icons text-xl">chat</span>
            <span>{t('comments.title')}</span>
          </h3>
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Post snippet */}
          <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl mb-4">
            <div className="text-xs text-neutral-400 mb-1 font-semibold">{post.userNome}</div>
            <div className="text-sm text-neutral-200">{post.conteudo}</div>
          </div>

          {/* Comments list */}
          <div className="comments-list max-h-72 overflow-y-auto space-y-3 mb-4 pr-1">
            {loading ? (
              <div className="loading py-8 text-neutral-500 text-sm text-center">
                {t('comments.loading')}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs">
                {t('comments.empty')}
              </div>
            ) : (
              comments.map((comment) => {
                const initial = (comment.userNome || 'U').charAt(0).toUpperCase();
                return (
                  <div key={comment.id} className="flex gap-2.5 items-start p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-800/60">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden">
                      {comment.userAvatar ? (
                        <img src={comment.userAvatar} alt={comment.userNome} className="w-full h-full object-cover" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-200">{comment.userNome}</span>
                        <span className="text-[10px] text-neutral-500">{getTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-1 break-words">{comment.texto}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Comment input form */}
          <form onSubmit={handleSubmit}>
            <textarea
              className="comment-input w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm text-white placeholder-neutral-500 resize-none outline-none focus:border-[#667eea]"
              rows={3}
              placeholder={t('comments.placeholder')}
              maxLength={280}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => {
                if (!currentUser) onRequireLogin();
              }}
            />

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-neutral-500">{text.length}/280</span>
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="btn-primary text-xs px-4 py-2 font-semibold disabled:opacity-50"
              >
                {submitting ? '...' : t('comments.button')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
