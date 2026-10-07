import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';
import { PostCard } from '../components/PostCard';
import {
  getUserProfile,
  toggleFollow,
  checkIsFollowing
} from '../services/userService';
import { db, collection, getDocs, query, where, orderBy, limit } from '../services/firebase';
import type { UserProfile, Post, AppView } from '../types';

interface ProfileViewProps {
  userId: string;
  userName?: string;
  onOpenComments: (post: Post) => void;
  onNavigate: (view: AppView, params?: any) => void;
  onRequireLogin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  userName,
  onOpenComments,
  onNavigate,
  onRequireLogin
}) => {
  const { currentUser, updateBio } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');

  const isOwnProfile = currentUser && currentUser.uid === userId;

  useEffect(() => {
    setLoading(true);

    const loadData = async () => {
      try {
        const uProfile = await getUserProfile(userId);
        if (uProfile) {
          setProfile(uProfile);
          setBioInput(uProfile.bio || '');
        } else {
          setProfile({
            uid: userId,
            nome: userName || 'Usuário',
            bio: '',
            karma: 0
          });
        }

        if (currentUser && currentUser.uid !== userId) {
          const following = await checkIsFollowing(currentUser.uid, userId);
          setIsFollowing(following);
        }

        // Fetch user posts
        const postsSnap = await getDocs(
          query(
            collection(db, 'Bemtevi'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(30)
          )
        );
        const userPosts: Post[] = [];
        postsSnap.forEach((d) => {
          userPosts.push({ id: d.id, ...d.data() } as Post);
        });
        setPosts(userPosts);
      } catch (err) {
        console.warn('Erro ao carregar dados do perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, userName, currentUser]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    try {
      const nowFollowing = await toggleFollow(currentUser.uid, userId);
      setIsFollowing(nowFollowing);
      setProfile((prev) => {
        if (!prev) return null;
        const currentCount = prev.seguidoresCount || 0;
        return {
          ...prev,
          seguidoresCount: Math.max(0, currentCount + (nowFollowing ? 1 : -1))
        };
      });
      showToast(nowFollowing ? 'Seguindo usuário!' : 'Deixou de seguir.', 'info');
    } catch {
      showToast(t('errors.generic'), 'error');
    }
  };

  const handleSaveBio = async () => {
    if (!currentUser) return;
    if (bioInput.length > 160) {
      showToast('A bio deve ter no máximo 160 caracteres.', 'error');
      return;
    }

    try {
      const ok = await updateBio(bioInput);
      if (ok) {
        setProfile((prev) => (prev ? { ...prev, bio: bioInput } : null));
        setIsEditingBio(false);
        showToast('Bio atualizada com sucesso!', 'success');
      }
    } catch {
      showToast('Erro ao atualizar bio.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="feed-container py-16 text-center text-neutral-500">
        Carregando perfil...
      </div>
    );
  }

  const displayName = profile?.nome || userName || 'Usuário';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="feed-container">
      {/* Profile Card */}
      <div className="card overflow-hidden p-0 mb-6 border border-neutral-800">
        {/* Cover */}
        <div
          className="profile-cover h-40 relative bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url('/src/assets/images/bemtevi_social_banner_1791379501011.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#10121d] via-black/30 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 relative pt-0 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <div className="flex items-end gap-4">
              <div className="profile-avatar-large w-24 h-24 rounded-full bg-neutral-900 border-4 border-black flex items-center justify-center font-bold text-white text-3xl shrink-0 overflow-hidden shadow-2xl">
                {profile?.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <div className="mb-1">
                <h1 className="text-xl font-bold text-white leading-tight">{displayName}</h1>
                <div className="text-xs text-neutral-500">@{userId.substring(0, 10)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  className="btn-secondary text-xs px-4 py-2 border border-neutral-700 hover:bg-neutral-800"
                  onClick={() => setIsEditingBio(true)}
                >
                  ✏️ Editar Bio
                </button>
              ) : (
                <>
                  <button
                    className={`text-xs px-4 py-2 rounded-xl font-semibold transition-all ${
                      isFollowing
                        ? 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700'
                        : 'btn-primary'
                    }`}
                    onClick={handleToggleFollow}
                  >
                    {isFollowing ? '✓ Seguindo' : '+ Seguir'}
                  </button>

                  <button
                    className="btn-secondary text-xs px-3.5 py-2 border border-neutral-700 hover:bg-neutral-800 flex items-center gap-1"
                    onClick={() => {
                      if (!currentUser) onRequireLogin();
                      else onNavigate('messages', { userId, userName: displayName });
                    }}
                  >
                    <span className="material-icons text-sm">chat</span>
                    <span>Mensagem</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bio section */}
          {isEditingBio ? (
            <div className="my-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800">
              <textarea
                className="w-full bg-transparent text-sm text-white resize-none outline-none placeholder-neutral-500"
                rows={2}
                maxLength={160}
                placeholder="Escreva algo sobre você (máx. 160 caracteres)..."
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800">
                <span className="text-[11px] text-neutral-500">{bioInput.length}/160</span>
                <div className="flex gap-2">
                  <button
                    className="text-xs text-neutral-400 px-3 py-1 hover:text-white"
                    onClick={() => setIsEditingBio(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-primary text-xs px-3.5 py-1"
                    onClick={handleSaveBio}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-300 max-w-xl my-2 leading-relaxed">
              {profile?.bio || <span className="text-neutral-500 italic">Nenhuma biografia adicionada.</span>}
            </p>
          )}

          {/* Stats Bar */}
          <div className="flex items-center gap-6 pt-4 border-t border-neutral-800/80 mt-4 text-xs">
            <div>
              <span className="font-bold text-white text-base block">{posts.length}</span>
              <span className="text-neutral-500">{t('profile.posts')}</span>
            </div>
            <div>
              <span className="font-bold text-white text-base block">{profile?.seguidoresCount || 0}</span>
              <span className="text-neutral-500">{t('profile.followers')}</span>
            </div>
            <div>
              <span className="font-bold text-white text-base block">{profile?.seguindoCount || 0}</span>
              <span className="text-neutral-500">{t('profile.following')}</span>
            </div>
            <div>
              <span className="font-bold text-amber-400 text-base block">⭐ {profile?.karma || 0}</span>
              <span className="text-neutral-500">{t('profile.karma')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts Header */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>📝</span> {t('profile.posts')} de {displayName}
        </h2>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="card text-center py-12 text-neutral-500 text-xs">
            <span className="material-icons text-4xl mb-2 text-neutral-600">note_add</span>
            <p>{t('profile.noPosts')}</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenComments={onOpenComments}
              onDeleteSuccess={(deletedId) => setPosts((prev) => prev.filter((p) => p.id !== deletedId))}
              onNavigate={onNavigate}
              onRequireLogin={onRequireLogin}
            />
          ))
        )}
      </div>
    </div>
  );
};
