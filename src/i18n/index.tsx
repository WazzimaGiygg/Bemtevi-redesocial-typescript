import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Locale } from '../types';
import { getTranslation } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  getCategoryLabel: (category: string) => string;
  getKarmaLevelLabel: (level: string) => string;
  getTimeAgo: (date: any) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('bemtevi_locale');
    if (saved && (saved === 'pt-BR' || saved === 'en-US' || saved === 'es-ES')) {
      return saved as Locale;
    }
    const nav = navigator.language || '';
    if (nav.startsWith('en')) return 'en-US';
    if (nav.startsWith('es')) return 'es-ES';
    return 'pt-BR';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('bemtevi_locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string, params?: Record<string, string | number>) => {
    return getTranslation(locale, key, params);
  };

  const getCategoryLabel = (category: string) => {
    return t(`categories.${category}`) || category;
  };

  const getKarmaLevelLabel = (level: string) => {
    return t(`karmaLevels.${level}`) || level;
  };

  const getTimeAgo = (dateInput: any): string => {
    if (!dateInput) return t('time.now');
    let date: Date;
    if (dateInput?.toDate && typeof dateInput.toDate === 'function') {
      date = dateInput.toDate();
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else if (dateInput?.seconds) {
      date = new Date(dateInput.seconds * 1000);
    } else {
      return t('time.now');
    }

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 45) return t('time.now');
    if (diffSec < 3600) {
      const mins = Math.max(1, Math.floor(diffSec / 60));
      return `${mins}${t('time.minute')}`;
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `${hours}${t('time.hour')}`;
    }
    if (diffSec < 604800) {
      const days = Math.floor(diffSec / 86400);
      return `${days}${t('time.day')}`;
    }
    const weeks = Math.floor(diffSec / 604800);
    return `${weeks}${t('time.week')}`;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, getCategoryLabel, getKarmaLevelLabel, getTimeAgo }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
};
