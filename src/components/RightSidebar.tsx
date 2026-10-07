import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { getKarmaLevel, getSuggestions, toggleFollow, checkIsFollowing } from '../services/userService';
import { getTrendingTopics } from '../services/postService';
import type { TrendingTopic, UserProfile, AppView } from '../types';

interface RightSidebarProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string | null;
  onNavigate: (view: AppView, params?: any) => void;
  onRequireLogin: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onSelectCategory,
  selectedCategory,
  onNavigate,
  onRequireLogin
}) => {
  const { currentUser, userKarma } = useAuth();
  const { t, getKarmaLevelLabel, getCategoryLabel } = useI18n();
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getTrendingTopics(5).then(setTrending);
    getSuggestions(currentUser?.uid, 4).then(async (users) => {
      setSuggestions(users);
      if (currentUser) {
        const map: Record<string, boolean> = {};
        for (const u of users) {
          map[u.uid] = await checkIsFollowing(currentUser.uid, u.uid);
        }
        setFollowingMap(map);
      }
    });
  }, [currentUser?.uid]);

  const handleToggleFollow = async (targetUid: string) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    const isNowFollowing = await toggleFollow(currentUser.uid, targetUid);
    setFollowingMap((prev) => ({ ...prev, [targetUid]: isNowFollowing }));
  };

  const karmaLevel = getKarmaLevel(userKarma);
  const karmaTarget =
    userKarma >= 500
      ? 1000
      : userKarma >= 200
      ? 500
      : userKarma >= 100
      ? 200
      : userKarma >= 50
      ? 100
      : userKarma >= 20
      ? 50
      : 20;
  const progressPercent = Math.min(100, Math.round((userKarma / karmaTarget) * 100));

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

  return (
    <aside className="sidebar-right space-y-4">
      {/* Karma Status Card */}
      {currentUser && (
        <div className="card karma-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">Nível Bemtevi</span>
            <span className="badge-karma">⭐ {getKarmaLevelLabel(karmaLevel)}</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-2xl font-extrabold text-white tabular-nums">{userKarma}</span>
            <span className="text-xs text-neutral-500 tabular-nums">/ {karmaTarget} pts</span>
          </div>

          <div className="w-full bg-[#1e2338] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-[11px] text-neutral-400 mt-2.5 leading-relaxed">
            Interaja na comunidade para subir de nível e desbloquear distinções.
          </div>
        </div>
      )}

      {/* Trending Topics Widget */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1.5">
            <span>🔥</span> {t('trending.title')}
          </h3>
        </div>

        <div className="space-y-1">
          {trending.length === 0 ? (
            <div className="text-xs text-neutral-500 py-2">{t('trending.empty')}</div>
          ) : (
            trending.map((topic, idx) => (
              <div
                key={topic.name}
                className="trending-topic"
                onClick={() => onNavigate('explore', { query: topic.name })}
              >
                <div className="flex items-center gap-2">
                  <span className="trending-rank">#{idx + 1}</span>
                  <span className="trending-name">{topic.name}</span>
                </div>
                <span className="trending-count tabular-nums">{topic.count} {t('trending.posts')}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Connection Suggestions */}
      {suggestions.length > 0 && (
        <div className="card p-4">
          <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1.5 mb-3">
            <span>👥</span> {t('suggestions.title')}
          </h3>

          <div className="space-y-2.5">
            {suggestions.map((u) => {
              const isFollowing = !!followingMap[u.uid];
              const initial = u.nome.charAt(0).toUpperCase() || '?';

              return (
                <div key={u.uid} className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#141624] transition-colors">
                  <div
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                    onClick={() => onNavigate('profile', { userId: u.uid, userName: u.nome })}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                      {u.profilePictureUrl ? (
                        <img src={u.profilePictureUrl} alt={u.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate hover:underline">{u.nome}</div>
                      <div className="text-[10px] text-neutral-500 truncate tabular-nums">⭐ {u.karma || 0} karma</div>
                    </div>
                  </div>

                  <button
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all shrink-0 ${
                      isFollowing
                        ? 'bg-[#181c2e] text-neutral-300 border border-[#232742] hover:bg-[#20253d]'
                        : 'bg-[#6366f1] text-white hover:bg-[#4f46e5]'
                    }`}
                    onClick={() => handleToggleFollow(u.uid)}
                  >
                    {isFollowing ? '✓' : '+ Seguir'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Navigation Pills */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1.5">
            <span>🏷️</span> Categorias
          </h3>
          {selectedCategory && (
            <button
              className="text-[11px] text-indigo-400 hover:underline"
              onClick={() => onSelectCategory('Todas')}
            >
              Limpar
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-[#6366f1] text-white border-[#6366f1]'
                    : 'bg-[#141624] text-neutral-400 border-[#1e2338] hover:text-white hover:border-[#2b3152]'
                }`}
                onClick={() => onSelectCategory(isSelected ? 'Todas' : cat)}
              >
                {getCategoryLabel(cat)}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
