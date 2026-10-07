import React, { useState, useEffect, useCallback } from 'react';
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
    <div className="feed-container">
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

      {/* Posts List */}
      <div className="posts-container space-y-3">
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
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenComments={onOpenComments}
                onDeleteSuccess={handlePostDeleted}
                onNavigate={onNavigate}
                onRequireLogin={onRequireLogin}
              />
            ))}

            {hasMore && (
              <div className="text-center pt-3 pb-2">
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
    </div>
  );
};
