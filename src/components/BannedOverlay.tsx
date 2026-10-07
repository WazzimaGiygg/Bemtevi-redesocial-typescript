import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';

export const BannedOverlay: React.FC = () => {
  const { isBanned, banReason, logout } = useAuth();
  const { t } = useI18n();

  if (!isBanned) return null;

  return (
    <div id="bannedOverlay" className="banned-overlay">
      <div className="banned-box">
        <div className="icon">🚫</div>
        <h2>{t('banned.title')}</h2>
        <p>{t('banned.message')}</p>
        <div id="banDetails" className="ban-details">
          {t('banned.reason')} {banReason || 'Violação das políticas de uso'}
        </div>
        <p style={{ fontSize: 13, color: '#888', marginTop: 12 }}>
          {t('banned.support')}
        </p>
        <button className="btn-logout-banned" onClick={logout}>
          {t('banned.logout')}
        </button>
      </div>
    </div>
  );
};
