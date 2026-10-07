import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';
import { fetchCommunities, toggleJoinCommunity } from '../services/communityService';
import type { Community, AppView } from '../types';

interface CommunitiesViewProps {
  onNavigate: (view: AppView, params?: any) => void;
  onOpenCreateModal: () => void;
  onRequireLogin: () => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  onNavigate,
  onOpenCreateModal,
  onRequireLogin
}) => {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<'all' | 'mine' | 'popular'>('all');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCommunities(filter, currentUser?.uid)
      .then(setCommunities)
      .finally(() => setLoading(false));
  }, [filter, currentUser?.uid]);

  const handleToggleJoin = async (e: React.MouseEvent, comm: Community) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    try {
      const isJoined = await toggleJoinCommunity(comm.id, currentUser.uid);
      showToast(isJoined ? t('communities.joined') : t('communities.left'), 'info');
      // Update local state
      setCommunities((prev) =>
        prev.map((c) => {
          if (c.id === comm.id) {
            const currentMembers = c.members || [];
            const newMembers = isJoined
              ? [...currentMembers, currentUser.uid]
              : currentMembers.filter((m) => m !== currentUser.uid);
            return {
              ...c,
              members: newMembers,
              memberCount: Math.max(0, c.memberCount + (isJoined ? 1 : -1))
            };
          }
          return c;
        })
      );
    } catch {
      showToast(t('errors.generic'), 'error');
    }
  };

  return (
    <div className="feed-container">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🏛️</span> {t('nav.communities')}
        </h2>
        <button
          className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
          onClick={() => {
            if (!currentUser) onRequireLogin();
            else onOpenCreateModal();
          }}
        >
          <span className="material-icons text-sm">add</span>
          <span>{t('communities.button')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'mine', 'popular'] as const).map((f) => {
          const labels = { all: 'Todos', mine: 'Minhas', popular: 'Populares' };
          return (
            <button
              key={f}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-[#667eea] text-white shadow'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
              onClick={() => {
                if (f === 'mine' && !currentUser) {
                  onRequireLogin();
                  return;
                }
                setFilter(f);
              }}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading py-16 text-center text-neutral-500">
          Carregando comunidades...
        </div>
      ) : communities.length === 0 ? (
        <div className="card text-center py-16 px-4">
          <span className="material-icons text-5xl text-neutral-600 mb-3">groups</span>
          <h3 className="text-base font-semibold text-neutral-300 mb-1">
            Nenhuma comunidade encontrada
          </h3>
          <p className="text-xs text-neutral-500 mb-4">
            Crie sua própria comunidade para reunir membros com interesses em comum!
          </p>
          <button
            className="btn-primary text-xs px-4 py-2"
            onClick={() => {
              if (!currentUser) onRequireLogin();
              else onOpenCreateModal();
            }}
          >
            ➕ Criar Comunidade
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {communities.map((comm) => {
            const isMember = currentUser && (comm.members || []).includes(currentUser.uid);
            const initial = comm.name.charAt(0).toUpperCase();

            return (
              <div
                key={comm.id}
                className="card hover:border-[#667eea]/50 transition-all cursor-pointer p-4 flex flex-col justify-between"
                onClick={() => onNavigate('community', { id: comm.id })}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center font-bold text-white text-base shrink-0">
                        {initial}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm hover:underline">{comm.name}</h3>
                        <span className="text-[11px] text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          {comm.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 line-clamp-2 my-2">
                    {comm.description || 'Comunidade colaborativa no Bemtevi.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 mt-2 text-xs">
                  <span className="text-neutral-500 text-[11px]">
                    {comm.memberCount} {t('communities.members')} • {comm.postCount} {t('communities.posts')}
                  </span>

                  <button
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                      isMember
                        ? 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-red-500/20 hover:text-red-400'
                        : 'bg-[#667eea] text-white hover:bg-[#5a6fd6]'
                    }`}
                    onClick={(e) => handleToggleJoin(e, comm)}
                  >
                    {isMember ? 'Membro' : '+ Entrar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
