import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { PostCard } from '../components/PostCard';
import { getSavedPosts } from '../services/postService';
import type { Post, AppView } from '../types';

interface SavedPostsViewProps {
  onOpenComments: (post: Post) => void;
  onNavigate: (view: AppView, params?: any) => void;
  onRequireLogin: () => void;
}

export const SavedPostsView: React.FC<SavedPostsViewProps> = ({
  onOpenComments,
  onNavigate,
  onRequireLogin
}) => {
  const { currentUser } = useAuth();
  const { t } = useI18n();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    getSavedPosts(currentUser.uid)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="feed-container card text-center py-16">
        <span className="material-icons text-5xl text-neutral-600 mb-2">lock</span>
        <h3 className="text-base font-bold text-white mb-2">{t('nav.saved')}</h3>
        <p className="text-xs text-neutral-400 mb-4">Faça login para acessar os posts que você salvou.</p>
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
          <span>🔖</span> {t('nav.saved')}
        </h2>
      </div>

      {loading ? (
        <div className="loading py-16 text-center text-neutral-500 text-sm">
          Carregando salvos...
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-16 px-4">
          <span className="material-icons text-5xl text-neutral-600 mb-3">bookmark_border</span>
          <h3 className="text-base font-semibold text-neutral-300 mb-1">
            Nenhuma publicação salva ainda
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Clique no ícone de marcador em qualquer post para guardá-lo aqui.
          </p>
          <button className="btn-primary text-xs px-4 py-2" onClick={() => onNavigate('feed')}>
            Ir para o Feed
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenComments={onOpenComments}
              onDeleteSuccess={(deletedId) => setPosts((prev) => prev.filter((p) => p.id !== deletedId))}
              onNavigate={onNavigate}
              onRequireLogin={onRequireLogin}
            />
          ))}
        </div>
      )}
    </div>
  );
};
