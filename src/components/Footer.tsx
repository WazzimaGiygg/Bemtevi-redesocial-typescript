import React from 'react';
import { useI18n } from '../i18n';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="https://wazzimagiygg.com/donate/" className="footer-link" target="_blank" rel="noopener noreferrer">
            {t('footer.donation')}
          </a>
          <span className="footer-divider">|</span>
          <a href="https://wazzimagiygg.com/desktop.html" className="footer-link" target="_blank" rel="noopener noreferrer">
            {t('footer.desktop')}
          </a>
          <span className="footer-divider">|</span>
          <a href="https://wazzimagiygg.com/LGPD" className="footer-link" target="_blank" rel="noopener noreferrer">
            {t('footer.lgpd')}
          </a>
          <span className="footer-divider">|</span>
          <a href="https://wazzimagiygg.com/MarcoCivil" className="footer-link" target="_blank" rel="noopener noreferrer">
            {t('footer.marcoCivil')}
          </a>
          <span className="footer-divider">|</span>
          <a href="https://support.wazzimagiygg.com/" className="footer-link" target="_blank" rel="noopener noreferrer">
            {t('footer.ticket')}
          </a>
          <span className="footer-divider">|</span>
          <a href="https://wazzimagiygg.com/produtos" className="footer-link highlight" target="_blank" rel="noopener noreferrer">
            {t('footer.products')}
          </a>
          <span className="footer-divider">|</span>
          <a href="https://painel.wazzimagiygg.com/" className="footer-link highlight" target="_blank" rel="noopener noreferrer">
            {t('footer.account')}
          </a>
        </div>
        <div className="footer-copyright">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
};
