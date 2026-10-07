import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import type { AppView, FeedTab } from '../types';

interface SidebarNavProps {
  currentView: AppView;
  currentFeedTab: FeedTab;
  onNavigate: (view: AppView, params?: any) => void;
  onSelectFeedTab: (tab: FeedTab) => void;
  onOpenCreateCommunityModal: () => void;
  onRequireLogin: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentView,
  currentFeedTab,
  onNavigate,
  onSelectFeedTab,
  onOpenCreateCommunityModal,
  onRequireLogin
}) => {
  const { currentUser, userProfile } = useAuth();
  const { t } = useI18n();

  const handleFeedTab = (tab: FeedTab) => {
    onNavigate('feed');
    onSelectFeedTab(tab);
  };

  const handleProtectedAction = (action: () => void) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    action();
  };

  const displayName = userProfile?.nome || currentUser?.displayName || 'Visitante';
  const initial = displayName.charAt(0).toUpperCase() || '?';

  return (
    <aside className="sidebar-left flex flex-col justify-between h-[calc(100vh-110px)]">
      <div className="space-y-4">
        {/* Navigation list */}
        <nav className="nav-menu">
          <div
            className={`nav-item ${currentView === 'feed' && currentFeedTab === 'for-you' ? 'active' : ''}`}
            onClick={() => handleFeedTab('for-you')}
          >
            <span className="material-icons nav-icon">dynamic_feed</span>
            <span>{t('nav.forYou')}</span>
          </div>

          <div
            className={`nav-item ${currentView === 'feed' && currentFeedTab === 'latest' ? 'active' : ''}`}
            onClick={() => handleFeedTab('latest')}
          >
            <span className="material-icons nav-icon">schedule</span>
            <span>{t('feed.tabs.latest')}</span>
          </div>

          <div
            className={`nav-item ${currentView === 'feed' && currentFeedTab === 'my-posts' ? 'active' : ''}`}
            onClick={() => handleProtectedAction(() => handleFeedTab('my-posts'))}
          >
            <span className="material-icons nav-icon">person_outline</span>
            <span>{t('nav.myPosts')}</span>
          </div>

          <div className="nav-divider" />

          <div
            className={`nav-item ${currentView === 'explore' ? 'active' : ''}`}
            onClick={() => onNavigate('explore')}
          >
            <span className="material-icons nav-icon">explore</span>
            <span>{t('nav.explore')}</span>
          </div>

          <div
            className={`nav-item ${currentView === 'communities' ? 'active' : ''}`}
            onClick={() => onNavigate('communities')}
          >
            <span className="material-icons nav-icon">groups</span>
            <span>{t('nav.communities')}</span>
          </div>

          <div
            className={`nav-item ${currentView === 'messages' ? 'active' : ''}`}
            onClick={() => handleProtectedAction(() => onNavigate('messages'))}
          >
            <span className="material-icons nav-icon">chat</span>
            <span>{t('nav.messages')}</span>
          </div>

          <div
            className={`nav-item ${currentView === 'saved' ? 'active' : ''}`}
            onClick={() => handleProtectedAction(() => onNavigate('saved'))}
          >
            <span className="material-icons nav-icon">bookmark_border</span>
            <span>{t('nav.saved')}</span>
          </div>

          {currentUser && (
            <div
              className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => onNavigate('profile', { userId: currentUser.uid, userName: displayName })}
            >
              <span className="material-icons nav-icon">account_circle</span>
              <span>{t('nav.myProfile')}</span>
            </div>
          )}
        </nav>

        {/* Action Button */}
        <div className="pt-2">
          <button
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold shadow-indigo-500/20"
            onClick={() => handleProtectedAction(onOpenCreateCommunityModal)}
          >
            <span className="material-icons text-base">add_circle_outline</span>
            <span>{t('nav.createCommunity')}</span>
          </button>
        </div>
      </div>

      {/* Mini Profile Card at Bottom */}
      {currentUser && (
        <div
          className="mt-auto p-2.5 rounded-2xl bg-[#121422] border border-[#1d2238] flex items-center gap-2.5 cursor-pointer hover:bg-[#181c30] transition-colors"
          onClick={() => onNavigate('profile', { userId: currentUser.uid, userName: displayName })}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden">
            {userProfile?.profilePictureUrl ? (
              <img src={userProfile.profilePictureUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">{displayName}</div>
            <div className="text-[11px] text-neutral-400 truncate">@{currentUser.uid.substring(0, 8)}</div>
          </div>
        </div>
      )}
    </aside>
  );
};
