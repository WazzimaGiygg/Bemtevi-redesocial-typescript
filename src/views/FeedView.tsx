import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { PostInput } from '../components/PostInput';
import { PostCard } from '../components/PostCard';
import { fetchPosts } from '../services/postService';
import type { Post, FeedTab, AppView } from '../types';
import type { DocumentSnapshot } from '../services/firebase';

interface FeedViewProps {
  currentTab: FeedTab;
  onSelectTab: (tab: FeedTab) => void;
  categoryFilter: string | null;
  onClearCategoryFilter: () => void;
  onOpenComments: (post: Post) => void;
  onNavigate: (view: AppView, params?: any) => void;
  onRequireLogin: () => void;
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  }
};

const postItemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 24,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.2 }
  }
};

export const FeedView: React.FC<FeedViewProps> = ({
  currentTab,
  onSelectTab,
  categoryFilter,
  onClearCategoryFilter,
  onOpenComments,
  onNavigate,
  onRequireLogin
}) => {
  const { currentUser } = useAuth();
  const { t, getCategoryLabel } = useI18n();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll past the first viewport height
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadInitialPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetchPosts(currentTab, currentUser?.uid, categoryFilter, null, 15);
    setPosts(res.posts);
    setLastDoc(res.lastDoc);
    setHasMore(res.posts.length >= 15);
    setLoading(false);
  }, [currentTab, currentUser?.uid, categoryFilter]);

  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  const loadMorePosts = async () => {
    if (loadingMore || !lastDoc || !hasMore) return;
    setLoadingMore(true);
    const res = await fetchPosts(currentTab, currentUser?.uid, categoryFilter, lastDoc, 15);
    if (res.posts.length > 0) {
      setPosts((prev) => [...prev, ...res.posts]);
      setLastDoc(res.lastDoc);
      setHasMore(res.posts.length >= 15);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="feed-container relative">
      {/* Welcome Hero for Unauthenticated Visitors */}
      {!currentUser && (
        <div className="relative rounded-2xl overflow-hidden mb-6 border border-[#1e2338] shadow-2xl">
          <img
            src="/src/assets/images/bemtevi_social_banner_1791379501011.jpg"
            alt="Bemtevi Social Network"
            className="w-full h-44 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a10] via-[#090a10]/80 to-transparent p-6 flex flex-col justify-end">
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              A rede social livre, ágil e descentralizada. 🕊️
            </h3>
            <p className="text-xs text-neutral-300 mt-1 max-w-lg leading-relaxed">
              Mensagens de até 127 caracteres, comunidades participativas, gamificação por karma e conversas sem algoritmos invasivos.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                className="btn-primary text-xs px-4 py-2 font-semibold"
                onClick={onRequireLogin}
              >
                Criar Conta / Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed Header */}
      <div className="feed-header-top">
        <div className="flex items-center gap-2">
          <h2 className="feed-title flex items-center gap-2">
            <span>📱</span> {t('feed.title')}
          </h2>
          {categoryFilter && categoryFilter !== 'Todas' && (
            <span className="flex items-center gap-1.5 text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-medium">
              <span>{getCategoryLabel(categoryFilter)}</span>
              <button
                onClick={onClearCategoryFilter}
                className="hover:text-white font-bold ml-0.5"
                aria-label="Remover filtro"
              >
                &times;
              </button>
            </span>
          )}
        </div>

        {/* Feed tabs */}
        <div className="feed-tabs">
          <button
            className={`feed-tab ${currentTab === 'for-you' ? 'active' : ''}`}
            onClick={() => onSelectTab('for-you')}
          >
            {t('feed.tabs.forYou')}
          </button>
          <button
            className={`feed-tab ${currentTab === 'latest' ? 'active' : ''}`}
            onClick={() => onSelectTab('latest')}
          >
            {t('feed.tabs.latest')}
          </button>
          <button
            className={`feed-tab ${currentTab === 'my-posts' ? 'active' : ''}`}
            onClick={() => {
              if (!currentUser) onRequireLogin();
              else onSelectTab('my-posts');
            }}
          >
            {t('feed.tabs.myPosts')}
          </button>
        </div>
      </div>

      {/* Post Box */}
      <PostInput
        onPostCreated={handlePostCreated}
        onRequireLogin={onRequireLogin}
      />

      {/* Posts List with Framer Motion Staggered Entrance */}
      <div className="posts-container">
        {loading ? (
          <div className="py-16 text-center text-neutral-400 text-sm">
            <span className="material-icons animate-spin text-3xl mb-2 text-[#6366f1]">autorenew</span>
            <p>{t('feed.loading')}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-16 px-4">
            <span className="material-icons text-5xl text-neutral-600 mb-2">dynamic_feed</span>
            <h3 className="text-base font-semibold text-neutral-300 mb-1">{t('feed.empty')}</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Compartilhe uma ideia, link ou novidade de até 127 caracteres para iniciar a conversa!
            </p>
          </div>
        ) : (
          <>
            <motion.div
              variants={listContainerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    variants={postItemVariants}
                    layout
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <PostCard
                      post={post}
                      onOpenComments={onOpenComments}
                      onDeleteSuccess={handlePostDeleted}
                      onNavigate={onNavigate}
                      onRequireLogin={onRequireLogin}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {hasMore && (
              <div className="text-center pt-5 pb-3">
                <button
                  className="btn-secondary text-xs px-6 py-2.5 rounded-xl border border-[#212640] hover:bg-[#161a2b] text-neutral-300 transition-colors"
                  onClick={loadMorePosts}
                  disabled={loadingMore}
                >
                  {loadingMore ? t('feed.loading') : 'Carregar mais posts...'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating 'Scroll to top' button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 16 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={scrollToTop}
            className="fixed bottom-20 md:bottom-8 right-6 z-40 w-11 h-11 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center border border-indigo-400/30 cursor-pointer"
            title="Voltar ao topo"
            aria-label="Voltar ao topo"
          >
            <span className="material-icons text-xl font-bold">arrow_upward</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
