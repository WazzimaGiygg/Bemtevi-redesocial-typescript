import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';
import { useToast } from '../../context/ToastContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginAsGuest } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast('Login realizado com sucesso!', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || t('login.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    showToast('Entrou em modo Convidado!', 'success');
    onClose();
  };

  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="flex items-center gap-2">
            <span className="material-icons text-xl">login</span>
            <span>{t('login.title')}</span>
          </h3>
          <button className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body text-center">
          <p className="text-neutral-400 text-sm mb-6">{t('login.subtitle')}</p>

          <button
            id="google-login-btn"
            className="btn-primary w-full flex items-center justify-center gap-3 py-3 text-sm font-semibold mb-3 hover:opacity-95"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>{loading ? 'Conectando...' : t('login.google')}</span>
          </button>

          <button
            className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5 text-xs text-neutral-300 border border-neutral-700 hover:bg-neutral-800"
            onClick={handleGuestLogin}
          >
            <span className="material-icons text-sm">person_outline</span>
            <span>Entrar como Convidado (Demo Rápido)</span>
          </button>

          <div className="mt-6 pt-4 border-t border-neutral-800 text-[11px] text-neutral-500 space-y-1">
            <p>{t('login.description')}</p>
            <p className="text-neutral-600">{t('login.features')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
