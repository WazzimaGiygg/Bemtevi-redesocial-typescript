import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { useToast } from '../context/ToastContext';

export const CookieConsent: React.FC = () => {
  const { t } = useI18n();
  const { showToast } = useToast();

  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [advertising, setAdvertising] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('bemtevi_cookie_consent');
    if (!saved) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const saveConsent = (prefs: { essential: boolean; analytics: boolean; advertising: boolean }) => {
    localStorage.setItem(
      'bemtevi_cookie_consent',
      JSON.stringify({
        ...prefs,
        acceptedAt: new Date().toISOString()
      })
    );
    setVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, analytics: true, advertising: true });
    showToast(t('cookie.accepted'), 'success');
  };

  const handleRejectAll = () => {
    saveConsent({ essential: true, analytics: false, advertising: false });
    showToast(t('cookie.rejected'), 'info');
  };

  const handleSaveCustom = () => {
    saveConsent({ essential: true, analytics, advertising });
    showToast(t('cookie.saved'), 'success');
  };

  return (
    <div className={`cookie-consent ${visible ? 'show' : ''}`}>
      <div className="cookie-content">
        <div className="cookie-text">
          <h3>{t('cookie.title')}</h3>
          <p>
            {t('cookie.message')}
            <a
              href="https://wazzimagiygg.com/LGPD"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4a9eff', textDecoration: 'underline' }}
            >
              {t('cookie.privacy')}
            </a>
            .
          </p>

          {showCustomize && (
            <div className="cookie-options mt-3">
              <label>
                <input type="checkbox" checked disabled />
                <span>{t('cookie.essential')}</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                <span>{t('cookie.analytics')}</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={advertising}
                  onChange={(e) => setAdvertising(e.target.checked)}
                />
                <span>{t('cookie.advertising')}</span>
              </label>
            </div>
          )}
        </div>

        <div className="cookie-buttons">
          {showCustomize ? (
            <>
              <button className="cookie-btn accept" onClick={handleSaveCustom}>
                💾 Salvar Escolhas
              </button>
              <button
                className="cookie-btn customize"
                onClick={() => setShowCustomize(false)}
              >
                Voltar
              </button>
            </>
          ) : (
            <>
              <button className="cookie-btn accept" onClick={handleAcceptAll}>
                {t('cookie.acceptAll')}
              </button>
              <button className="cookie-btn reject" onClick={handleRejectAll}>
                {t('cookie.rejectAll')}
              </button>
              <button
                className="cookie-btn customize"
                onClick={() => setShowCustomize(true)}
              >
                {t('cookie.customize')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
