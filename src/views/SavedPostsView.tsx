import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { PostCard } from '../components/PostCard';
import { subscribeToSavedPosts } from '../services/postService';
import type { Post, AppView } from '../types';

interface SavedPostsViewProps {
  onOpenComments: (post: Post) => void;
  onNavigate: (view: AppView, params?: any) => void;
  onRequireLogin: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 24
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export const SavedPostsView: React.FC<SavedPostsViewProps> = ({
  onOpenComments,
  onNavigate,
  onRequireLogin
}) => {
  const { currentUser } = useAuth();
  const { t } = useI18n();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time synchronization with Firestore profile bookmarks
  useEffect(() => {
    if (!currentUser) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToSavedPosts(currentUser.uid, (updatedPosts) => {
      setPosts(updatedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="feed-container card text-center py-16">
        <span className="material-icons text-5xl text-neutral-600 mb-2">lock</span>
        <h3 className="text-base font-bold text-white mb-2">{t('nav.saved')}</h3>
        <p className="text-xs text-neutral-400 mb-4">Faça login para acessar os posts que você salvou.</p>
        <button className="btn-primary text-xs px-5 py-2.5 font-semibold" onClick={onRequireLogin}>
          Entrar Agora
        </button>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {/* Header with counter */}
      <div className="mb-4 pb-2 border-b border-[#1c2035] flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🔖</span>
          <span>{t('nav.saved')}</span>
          {!loading && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 tabular-nums">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          )}
        </h2>
        <span className="text-xs text-neutral-500">Sincronizado com seu perfil</span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-neutral-400 text-sm">
          <span className="material-icons animate-spin text-3xl mb-2 text-[#6366f1]">autorenew</span>
          <p>Carregando posts salvos...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-16 px-4">
          <span className="material-icons text-5xl text-neutral-600 mb-3">bookmark_border</span>
          <h3 className="text-base font-semibold text-neutral-300 mb-1">
            Nenhuma publicação salva ainda
          </h3>
          <p className="text-xs text-neutral-500 mb-5 max-w-sm mx-auto">
            Clique no ícone de marcador 🔖 em qualquer post do feed para salvá-lo e acessá-lo aqui a qualquer momento.
          </p>
          <button className="btn-primary text-xs px-5 py-2.5 font-semibold" onClick={() => onNavigate('feed')}>
            Explorar Feed
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                variants={itemVariants}
                layout
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <PostCard
                  post={post}
                  onOpenComments={onOpenComments}
                  onDeleteSuccess={(deletedId) => setPosts((prev) => prev.filter((p) => p.id !== deletedId))}
                  onNavigate={onNavigate}
                  onRequireLogin={onRequireLogin}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
