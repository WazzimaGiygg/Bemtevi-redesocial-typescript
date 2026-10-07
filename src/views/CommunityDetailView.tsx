import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';
import { PostCard } from '../components/PostCard';
import { PostInput } from '../components/PostInput';
import {
  getCommunityById,
  toggleJoinCommunity,
  getCommunityPosts
} from '../services/communityService';
import type { Community, Post, AppView } from '../types';

interface CommunityDetailViewProps {
  communityId: string;
  onOpenComments: (post: Post) => void;
  onNavigate: (view: AppView, params?: any) => void;
  onRequireLogin: () => void;
}

export const CommunityDetailView: React.FC<CommunityDetailViewProps> = ({
  communityId,
  onOpenComments,
  onNavigate,
  onRequireLogin
}) => {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getCommunityById(communityId), getCommunityPosts(communityId)])
      .then(([comm, commPosts]) => {
        setCommunity(comm);
        setPosts(commPosts);
      })
      .finally(() => setLoading(false));
  }, [communityId]);

  const handleToggleJoin = async () => {
    if (!currentUser || !community) {
      onRequireLogin();
      return;
    }

    try {
      const isJoined = await toggleJoinCommunity(community.id, currentUser.uid);
      showToast(isJoined ? t('communities.joined') : t('communities.left'), 'info');
      setCommunity((prev) => {
        if (!prev) return null;
        const currentMembers = prev.members || [];
        const newMembers = isJoined
          ? [...currentMembers, currentUser.uid]
          : currentMembers.filter((m) => m !== currentUser.uid);
        return {
          ...prev,
          members: newMembers,
          memberCount: Math.max(0, prev.memberCount + (isJoined ? 1 : -1))
        };
      });
    } catch {
      showToast(t('errors.generic'), 'error');
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    if (community) {
      setCommunity((prev) => (prev ? { ...prev, postCount: prev.postCount + 1 } : null));
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="feed-container py-16 text-center text-neutral-500">
        Carregando comunidade...
      </div>
    );
  }

  if (!community) {
    return (
      <div className="feed-container card text-center py-16">
        <span className="material-icons text-5xl text-red-400 mb-2">error_outline</span>
        <h3 className="text-base font-bold text-white mb-2">{t('communities.notFound')}</h3>
        <button className="btn-primary text-xs px-4 py-2 mt-2" onClick={() => onNavigate('communities')}>
          ← Voltar para Comunidades
        </button>
      </div>
    );
  }

  const isMember = currentUser && (community.members || []).includes(currentUser.uid);

  return (
    <div className="feed-container">
      {/* Back button */}
      <div className="mb-3">
        <button
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
          onClick={() => onNavigate('communities')}
        >
          <span className="material-icons text-sm">arrow_back</span>
          <span>Voltar para Comunidades</span>
        </button>
      </div>

      {/* Community Header Card */}
      <div className="card mb-5 p-5 border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center font-bold text-white text-2xl shrink-0 shadow-lg">
              {community.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{community.name}</h1>
                <span className="text-[11px] bg-[#667eea]/20 text-[#667eea] px-2.5 py-0.5 rounded-full font-medium">
                  {community.category}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 max-w-md">{community.description}</p>
              <div className="text-xs text-neutral-500 mt-2">
                👥 {community.memberCount} membros • 📝 {community.postCount} publicações
              </div>
            </div>
          </div>

          <button
            className={`text-xs px-5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
              isMember
                ? 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-red-500/20 hover:text-red-400'
                : 'btn-primary'
            }`}
            onClick={handleToggleJoin}
          >
            {isMember ? '✓ Inscrito (Sair)' : '+ Participar'}
          </button>
        </div>
      </div>

      {/* Post to this community */}
      <PostInput
        communityId={community.id}
        communityName={community.name}
        onPostCreated={handlePostCreated}
        onRequireLogin={onRequireLogin}
      />

      {/* Feed of posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="card text-center py-12 text-neutral-500 text-xs">
            <span className="material-icons text-4xl mb-2 text-neutral-600">note_add</span>
            <p>Nenhuma publicação nesta comunidade ainda.</p>
            {isMember && <p className="text-neutral-400 mt-1">Seja o primeiro a postar!</p>}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenComments={onOpenComments}
              onDeleteSuccess={handlePostDeleted}
              onNavigate={onNavigate}
              onRequireLogin={onRequireLogin}
            />
          ))
        )}
      </div>
    </div>
  );
};
