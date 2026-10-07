import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { PostCard } from '../components/PostCard';
import { getTrendingTopics } from '../services/postService';
import { db, collection, getDocs, query, orderBy, limit } from '../services/firebase';
import type { Post, Community, UserProfile, TrendingTopic, AppView } from '../types';

interface ExploreViewProps {
  initialQuery?: string;
  onOpenComments: (post: Post) => void;
  onNavigate: (view: AppView, params?: any) => void;
  onRequireLogin: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  initialQuery = '',
  onOpenComments,
  onNavigate,
  onRequireLogin
}) => {
  const { currentUser } = useAuth();
  const { t } = useI18n();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'users' | 'communities'>('all');
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    getTrendingTopics(10).then(setTrending);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (term: string) => {
    const qStr = term.trim().toLowerCase();
    if (!qStr) {
      setPosts([]);
      setUsers([]);
      setCommunities([]);
      return;
    }

    setLoading(true);
    try {
      // Search posts
      const postsSnap = await getDocs(query(collection(db, 'Bemtevi'), orderBy('createdAt', 'desc'), limit(40)));
      const matchedPosts: Post[] = [];
      postsSnap.forEach((d) => {
        const data = d.data();
        const text = (data.conteudo || '').toLowerCase();
        const cat = (data.categoria || '').toLowerCase();
        const author = (data.userNome || '').toLowerCase();
        if (text.includes(qStr) || cat.includes(qStr) || author.includes(qStr)) {
          matchedPosts.push({ id: d.id, ...data } as Post);
        }
      });
      setPosts(matchedPosts);

      // Search users
      const usersSnap = await getDocs(query(collection(db, 'usuarios'), limit(40)));
      const matchedUsers: UserProfile[] = [];
      usersSnap.forEach((d) => {
        const data = d.data();
        const name = (data.nome || '').toLowerCase();
        const bio = (data.bio || '').toLowerCase();
        if (name.includes(qStr) || bio.includes(qStr)) {
          matchedUsers.push({ uid: d.id, ...data } as UserProfile);
        }
      });
      setUsers(matchedUsers);

      // Search communities
      const commsSnap = await getDocs(query(collection(db, 'comunidades'), limit(40)));
      const matchedComms: Community[] = [];
      commsSnap.forEach((d) => {
        const data = d.data();
        const name = (data.name || '').toLowerCase();
        const desc = (data.description || '').toLowerCase();
        const cat = (data.category || '').toLowerCase();
        if (name.includes(qStr) || desc.includes(qStr) || cat.includes(qStr)) {
          matchedComms.push({ id: d.id, ...data } as Community);
        }
      });
      setCommunities(matchedComms);
    } catch (err) {
      console.warn('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  return (
    <div className="feed-container">
      <div className="feed-header mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
          <span>🧭</span> {t('nav.explore')}
        </h2>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative mb-3">
          <input
            type="text"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#667eea]"
            placeholder="Pesquisar posts, tags (#), usuários ou comunidades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="material-icons absolute left-3 top-3.5 text-neutral-500 text-lg">search</span>
          {searchQuery && (
            <button
              type="button"
              className="absolute right-3 top-3 text-neutral-500 hover:text-white"
              onClick={() => {
                setSearchQuery('');
                setPosts([]);
                setUsers([]);
                setCommunities([]);
              }}
            >
              &times;
            </button>
          )}
        </form>

        {/* Search tabs */}
        <div className="flex gap-2 border-b border-neutral-800 pb-2">
          {(['all', 'posts', 'users', 'communities'] as const).map((tab) => {
            const labels = {
              all: 'Todos',
              posts: 'Posts',
              users: 'Usuários',
              communities: 'Comunidades'
            };
            return (
              <button
                key={tab}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === tab ? 'bg-[#667eea] text-white' : 'text-neutral-400 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* When no search query: show Trending Topics showcase */}
      {!searchQuery.trim() && (
        <div className="card mb-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <span>🔥</span> Assuntos do Momento no Bemtevi
          </h3>
          <div className="space-y-2">
            {trending.map((topic, i) => (
              <div
                key={topic.name}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 cursor-pointer border border-neutral-800/50 transition-all"
                onClick={() => {
                  setSearchQuery(topic.name);
                  performSearch(topic.name);
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#667eea]">#{i + 1}</span>
                  <span className="text-sm font-semibold text-white">{topic.name}</span>
                </div>
                <span className="text-xs text-neutral-500">{topic.count} posts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="loading py-12 text-center text-neutral-500">Buscando...</div>
      ) : searchQuery.trim() ? (
        <div className="space-y-4">
          {/* Users results */}
          {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
            <div className="card">
              <h3 className="text-xs uppercase font-bold text-neutral-400 mb-3 tracking-wider">Usuários ({users.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {users.map((u) => (
                  <div
                    key={u.uid}
                    className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900/50 hover:bg-neutral-800 cursor-pointer"
                    onClick={() => onNavigate('profile', { userId: u.uid, userName: u.nome })}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center font-bold text-white text-sm shrink-0 overflow-hidden">
                      {u.profilePictureUrl ? (
                        <img src={u.profilePictureUrl} alt={u.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span>{u.nome?.charAt(0).toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{u.nome}</div>
                      <div className="text-xs text-neutral-500 truncate">{u.bio || `@${u.uid.substring(0, 8)}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Communities results */}
          {(activeTab === 'all' || activeTab === 'communities') && communities.length > 0 && (
            <div className="card">
              <h3 className="text-xs uppercase font-bold text-neutral-400 mb-3 tracking-wider">Comunidades ({communities.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {communities.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-neutral-900/50 hover:bg-neutral-800 cursor-pointer border border-neutral-800/60"
                    onClick={() => onNavigate('community', { id: c.id })}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">🏛️</span>
                      <span className="text-sm font-semibold text-white">{c.name}</span>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2">{c.description || 'Comunidade no Bemtevi'}</p>
                    <div className="text-[11px] text-neutral-500 mt-2">{c.memberCount || 1} membros</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts results */}
          {(activeTab === 'all' || activeTab === 'posts') && (
            <div>
              {posts.length > 0 && (
                <h3 className="text-xs uppercase font-bold text-neutral-400 mb-2 px-1 tracking-wider">Posts ({posts.length})</h3>
              )}
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenComments={onOpenComments}
                  onNavigate={onNavigate}
                  onRequireLogin={onRequireLogin}
                />
              ))}
            </div>
          )}

          {posts.length === 0 && users.length === 0 && communities.length === 0 && (
            <div className="card text-center py-12 text-neutral-500">
              <span className="material-icons text-4xl mb-2 text-neutral-600">search_off</span>
              <p>Nenhum resultado encontrado para &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
