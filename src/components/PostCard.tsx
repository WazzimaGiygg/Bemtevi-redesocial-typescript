import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';
import {
  toggleLikePost,
  toggleSavePost,
  checkIfPostSaved,
  deletePost,
  reportPost,
  CATEGORY_COLORS
} from '../services/postService';
import type { Post, AppView } from '../types';

interface PostCardProps {
  post: Post;
  onOpenComments: (post: Post) => void;
  onDeleteSuccess?: (postId: string) => void;
  onNavigate: (view: AppView, params?: any) => void;
  onRequireLogin: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onDeleteSuccess,
  onNavigate,
  onRequireLogin
}) => {
  const { currentUser, isBanned } = useAuth();
  const { t, getTimeAgo, getCategoryLabel } = useI18n();
  const { showToast } = useToast();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [saved, setSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLiked(post.usuariosQueCurtiram?.includes(currentUser.uid) || false);
      checkIfPostSaved(post.id, currentUser.uid).then(setSaved);
    } else {
      setLiked(false);
      setSaved(false);
    }
    setLikesCount(post.likes || 0);

    const handleBookmarkEvent = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail?.postId === post.id) {
        setSaved(!!customEvt.detail.isSaved);
      }
    };

    window.addEventListener('bemtevi_bookmark_updated', handleBookmarkEvent);
    return () => window.removeEventListener('bemtevi_bookmark_updated', handleBookmarkEvent);
  }, [post, currentUser]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    if (isBanned) {
      showToast(t('post.banned'), 'error');
      return;
    }

    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await toggleLikePost(post.id, currentUser.uid, post.userId);
      setLiked(res.liked);
      setLikesCount(res.newCount);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      showToast(t('errors.generic'), 'error');
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    const prevSaved = saved;
    setSaved(!prevSaved);

    try {
      const isNowSaved = await toggleSavePost(post.id, currentUser.uid);
      setSaved(isNowSaved);
      showToast(isNowSaved ? t('post.saved') : t('post.unsaved'), 'info');
    } catch {
      setSaved(prevSaved);
      showToast(t('errors.generic'), 'error');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const shareUrl = `${window.location.origin}/?post=${post.id}`;
      await navigator.clipboard.writeText(shareUrl);
      showToast(t('post.shareCopied'), 'success');
    } catch {
      showToast(t('post.shareError'), 'error');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (!currentUser || currentUser.uid !== post.userId) return;

    if (!window.confirm(t('post.deleteConfirm'))) return;

    try {
      const ok = await deletePost(post.id, currentUser.uid);
      if (ok) {
        showToast(t('post.deleteSuccess'), 'success');
        if (onDeleteSuccess) onDeleteSuccess(post.id);
      }
    } catch {
      showToast(t('post.deleteError'), 'error');
    }
  };

  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    const reason = window.prompt(t('post.reportPrompt'));
    if (!reason || !reason.trim()) return;

    try {
      await reportPost(post.id, currentUser.uid, reason.trim());
      showToast(t('post.reportSuccess'), 'success');
    } catch {
      showToast(t('post.reportError'), 'error');
    }
  };

  const isOwner = currentUser && currentUser.uid === post.userId;
  const initial = (post.userNome || 'U').charAt(0).toUpperCase();
  const categoryColor = CATEGORY_COLORS[post.categoria] || '#6366f1';

  return (
    <article className="post-card group">
      <div className="post-header">
        <div
          className="flex items-start gap-3 cursor-pointer min-w-0"
          onClick={() => onNavigate('profile', { userId: post.userId, userName: post.userNome })}
        >
          <div className="post-avatar-img">
            {post.userAvatar ? (
              <img src={post.userAvatar} alt={post.userNome} className="w-full h-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="post-user-name hover:underline truncate">
                {post.userNome}
              </span>
              <span className="post-user-id truncate">
                @{post.userId ? post.userId.substring(0, 8) : 'anon'}
              </span>
              <span className="text-neutral-600 text-xs" aria-hidden="true">·</span>
              <span className="post-time">
                {getTimeAgo(post.createdAt)}
              </span>
            </div>

            {/* Zero-Pill compliant metadata line */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
              <span style={{ color: categoryColor }} className="font-semibold text-[11px]">
                {getCategoryLabel(post.categoria)}
              </span>
              {post.communityName && (
                <>
                  <span className="text-neutral-600" aria-hidden="true">·</span>
                  <span
                    className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-[11px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (post.communityId) onNavigate('community', { id: post.communityId });
                    }}
                  >
                    🏛️ {post.communityName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options Button */}
        <div className="relative">
          <button
            className="text-neutral-500 hover:text-neutral-200 p-1.5 rounded-lg hover:bg-[#1a1e30] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            aria-label="Opções do post"
          >
            <span className="material-icons text-base">more_horiz</span>
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-8 bg-[#151726] border border-[#232742] rounded-xl shadow-2xl py-1 z-30 min-w-[130px] animate-in fade-in duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {isOwner ? (
                <button
                  className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                  onClick={handleDelete}
                >
                  <span className="material-icons text-sm">delete</span>
                  <span>{t('actions.delete')}</span>
                </button>
              ) : (
                <button
                  className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-[#1f2338] flex items-center gap-2"
                  onClick={handleReport}
                >
                  <span className="material-icons text-sm">flag</span>
                  <span>{t('actions.report')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text */}
      <div className="post-content">
        {post.conteudo}
      </div>

      {/* Attached Link */}
      {post.link && (
        <div className="mb-3.5">
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="post-link"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-icons text-sm">link</span>
            <span className="truncate">{post.link}</span>
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="post-stats">
        <div className="flex items-center gap-5">
          {/* Like */}
          <button
            className={`stat-action ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            title={liked ? t('actions.unlike') : t('actions.like')}
          >
            <span className="material-icons text-lg">
              {liked ? 'favorite' : 'favorite_border'}
            </span>
            <span className="tabular-nums">{likesCount}</span>
          </button>

          {/* Comment */}
          <button
            className="stat-action"
            onClick={() => onOpenComments(post)}
            title={t('actions.comment')}
          >
            <span className="material-icons text-lg">chat_bubble_outline</span>
            <span className="tabular-nums">{post.comentarios || 0}</span>
          </button>

          {/* Share */}
          <button
            className="stat-action"
            onClick={handleShare}
            title={t('actions.share')}
          >
            <span className="material-icons text-lg">share</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          className={`stat-action flex items-center gap-1 transition-all ${
            saved
              ? 'text-amber-400 font-semibold'
              : 'hover:text-amber-300'
          }`}
          onClick={handleSave}
          title={saved ? 'Remover dos Salvos (Bookmark)' : 'Salvar nos Marcadores (Bookmark)'}
          aria-label={saved ? 'Remover bookmark' : 'Adicionar bookmark'}
        >
          <span className="material-icons text-lg transition-transform active:scale-125">
            {saved ? 'bookmark' : 'bookmark_border'}
          </span>
          <span className="text-[11px] hidden sm:inline">
            {saved ? 'Salvo' : 'Salvar'}
          </span>
        </button>
      </div>
    </article>
  );
};
