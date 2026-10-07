import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';
import { useToast } from '../../context/ToastContext';
import { createCommunity } from '../../services/communityService';
import type { Community } from '../../types';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (community: Community) => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const { currentUser, userProfile, isBanned } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Geral');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || isBanned) {
      showToast(t('communities.loginRequired'), 'error');
      return;
    }

    if (!name.trim() || name.trim().length < 3) {
      showToast(t('communities.nameRequired'), 'error');
      return;
    }

    setLoading(true);
    try {
      const newComm = await createCommunity({
        name: name.trim(),
        description: description.trim(),
        category,
        creatorId: currentUser.uid,
        creatorName: userProfile?.nome || currentUser.displayName || 'Usuário'
      });

      showToast(t('communities.success'), 'success');
      onCreated(newComm);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      showToast(err.message || t('communities.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="flex items-center gap-2">
            <span>🏛️</span>
            <span>{t('communities.title')}</span>
          </h3>
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              {t('communities.name')}
            </label>
            <input
              type="text"
              className="modal-input w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-[#667eea]"
              placeholder={t('communities.namePlaceholder')}
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="text-[11px] text-neutral-500 mt-1">{t('communities.nameMin')}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              {t('communities.description')}
            </label>
            <textarea
              className="modal-textarea w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 resize-none outline-none focus:border-[#667eea]"
              rows={3}
              placeholder={t('communities.descriptionPlaceholder')}
              maxLength={300}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              {t('communities.category')}
            </label>
            <select
              className="modal-input w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#667eea]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || name.trim().length < 3}
            className="btn-primary w-full py-3 font-semibold text-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Criando...' : t('communities.button')}
          </button>
        </form>
      </div>
    </div>
  );
};
