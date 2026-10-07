import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { getKarmaLevel } from '../services/userService';
import { markAllNotificationsAsRead, markNotificationAsRead } from '../services/notificationService';
import type { Locale, AppView } from '../types';

interface HeaderProps {
  onOpenLoginModal: () => void;
  onNavigate: (view: AppView, params?: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLoginModal, onNavigate }) => {
  const { currentUser, userProfile, userKarma, notifications, unreadNotifsCount, logout } = useAuth();
  const { locale, setLocale, t, getKarmaLevelLabel, getTimeAgo } = useI18n();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      onNavigate('explore', { query: headerSearch.trim() });
      setHeaderSearch('');
    }
  };

  const karmaLevel = getKarmaLevel(userKarma);
  const displayName = userProfile?.nome || currentUser?.displayName || t('header.visitor');
  const userInitial = displayName.charAt(0).toUpperCase() || '?';
  const displayEmail = userProfile?.email || currentUser?.email || (currentUser ? `@${currentUser.uid.substring(0, 8)}` : '');

  return (
    <header className="header">
      <div className="header-content">
        {/* Zone 1: Brand Wordmark */}
        <div
          className="logo-area-header"
          onClick={() => onNavigate('feed')}
        >
          <img
            src="/src/assets/images/bemtevi_app_avatar_1791379518256.jpg"
            alt="Bemtevi Logo"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="logo-text-group">
            <div className="flex items-center gap-1.5">
              <h1>Bemtevi</h1>
              <span className="beta-badge">BETA</span>
            </div>
            <small>Rede Social Livre</small>
          </div>
        </div>

        {/* Zone 2: Search Input */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <span className="material-icons absolute left-3 top-2.5 text-neutral-500 text-sm pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar no Bemtevi..."
              className="w-full bg-[#121420] text-xs text-white placeholder-neutral-500 rounded-xl pl-9 pr-4 py-2 border border-[#1c2035] focus:border-[#6366f1] focus:bg-[#161928] outline-none transition-all"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Zone 3: Actions & Profile */}
        <div className="user-info-header">
          {/* Integrated Language Selector */}
          <div className="relative flex items-center bg-[#141624] border border-[#1e2338] rounded-xl px-2.5 py-1 text-xs">
            <span className="text-xs mr-1 text-neutral-400">🌐</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              aria-label="Idioma"
              className="bg-transparent text-neutral-200 text-xs outline-none cursor-pointer pr-1"
            >
              <option value="pt-BR" className="bg-[#121420] text-white">PT</option>
              <option value="en-US" className="bg-[#121420] text-white">EN</option>
              <option value="es-ES" className="bg-[#121420] text-white">ES</option>
            </select>
          </div>

          {/* Karma Badge (when logged in) */}
          {currentUser && (
            <div
              className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer hover:bg-amber-500/15 transition-colors"
              title={`Karma: ${userKarma} pontos`}
              onClick={() => onNavigate('profile', { userId: currentUser.uid, userName: displayName })}
            >
              <span>⭐</span>
              <span className="tabular-nums">{userKarma}</span>
              <span className="text-[10px] text-amber-300/70 hidden lg:inline">({getKarmaLevelLabel(karmaLevel)})</span>
            </div>
          )}

          {/* Notifications Bell */}
          {currentUser && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                className="notification-bell"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                aria-label="Notificações"
              >
                <span className="material-icons text-lg">notifications</span>
                {unreadNotifsCount > 0 && (
                  <span className="notification-badge">{unreadNotifsCount}</span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <h3>{t('notifications.title')}</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          if (currentUser) markAllNotificationsAsRead(currentUser.uid);
                        }}
                      >
                        {t('notifications.markAllRead')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#1e2338]">
                    {notifications.length === 0 ? (
                      <div className="notification-empty">
                        <span className="material-icons text-3xl mb-1 text-neutral-600">notifications_off</span>
                        <p>{t('notifications.empty')}</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`notification-item cursor-pointer ${notif.read ? 'opacity-60' : 'bg-[#181b2c]'}`}
                          onClick={() => {
                            if (currentUser) markNotificationAsRead(currentUser.uid, notif.id);
                            setShowNotifDropdown(false);
                            if (notif.link) {
                              if (notif.link.includes('profile')) onNavigate('profile');
                              else if (notif.link.includes('messages')) onNavigate('messages');
                            }
                          }}
                        >
                          <div className="font-semibold text-xs text-white">{notif.title}</div>
                          <div className="text-xs text-neutral-300 mt-0.5">{notif.message}</div>
                          <div className="text-[10px] text-neutral-500 mt-1">{getTimeAgo(notif.createdAt)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Menu or Login button */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <div
                className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-[#151828] transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {userProfile?.profilePictureUrl ? (
                    <img
                      src={userProfile.profilePictureUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="user-name max-w-[100px] truncate">{displayName}</div>
                  <div className="user-email max-w-[100px] truncate">{displayEmail}</div>
                </div>
                <span className="material-icons text-xs text-neutral-500 hidden sm:block">
                  expand_more
                </span>
              </div>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 bg-[#121422] border border-[#1e2338] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-[#1c2035]">
                    <div className="font-semibold text-xs text-white truncate">{displayName}</div>
                    <div className="text-[11px] text-neutral-500 truncate">{displayEmail}</div>
                  </div>

                  <button
                    className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-[#181c30] flex items-center gap-2"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('profile', { userId: currentUser.uid, userName: displayName });
                    }}
                  >
                    <span className="material-icons text-sm text-neutral-400">person</span>
                    <span>{t('nav.myProfile')}</span>
                  </button>

                  <button
                    className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-[#181c30] flex items-center gap-2"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('saved');
                    }}
                  >
                    <span className="material-icons text-sm text-neutral-400">bookmark</span>
                    <span>{t('nav.saved')}</span>
                  </button>

                  <div className="border-t border-[#1c2035] my-1" />

                  <button
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                  >
                    <span className="material-icons text-sm">logout</span>
                    <span>{t('header.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn-login"
              id="btnLogin"
              onClick={onOpenLoginModal}
            >
              <span className="material-icons text-sm">login</span>
              <span>{t('header.login')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
