import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { AppView, FeedTab } from '../types';

interface MobileNavProps {
  currentView: AppView;
  onNavigate: (view: AppView, params?: any) => void;
  onSelectFeedTab: (tab: FeedTab) => void;
  onRequireLogin: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  onSelectFeedTab,
  onRequireLogin
}) => {
  const { currentUser, unreadNotifsCount } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0e18]/95 backdrop-blur-xl border-t border-[#1c2035] px-2 py-2 flex items-center justify-around">
      {/* Home / Feed */}
      <button
        type="button"
        className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-colors ${
          currentView === 'feed' ? 'text-[#6366f1]' : 'text-neutral-400 hover:text-white'
        }`}
        onClick={() => {
          onNavigate('feed');
          onSelectFeedTab('for-you');
        }}
      >
        <span className="material-icons text-xl">dynamic_feed</span>
        <span className="text-[10px] font-semibold">Feed</span>
      </button>

      {/* Explore */}
      <button
        type="button"
        className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-colors ${
          currentView === 'explore' ? 'text-[#6366f1]' : 'text-neutral-400 hover:text-white'
        }`}
        onClick={() => onNavigate('explore')}
      >
        <span className="material-icons text-xl">explore</span>
        <span className="text-[10px] font-semibold">Explorar</span>
      </button>

      {/* Communities */}
      <button
        type="button"
        className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-colors ${
          currentView === 'communities' || currentView === 'community'
            ? 'text-[#6366f1]'
            : 'text-neutral-400 hover:text-white'
        }`}
        onClick={() => onNavigate('communities')}
      >
        <span className="material-icons text-xl">groups</span>
        <span className="text-[10px] font-semibold">Grupos</span>
      </button>

      {/* Messages */}
      <button
        type="button"
        className={`flex flex-col items-center gap-1 p-1 rounded-xl relative transition-colors ${
          currentView === 'messages' ? 'text-[#6366f1]' : 'text-neutral-400 hover:text-white'
        }`}
        onClick={() => {
          if (!currentUser) onRequireLogin();
          else onNavigate('messages');
        }}
      >
        <span className="material-icons text-xl">chat</span>
        <span className="text-[10px] font-semibold">Chat</span>
      </button>

      {/* Profile */}
      <button
        type="button"
        className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-colors ${
          currentView === 'profile' ? 'text-[#6366f1]' : 'text-neutral-400 hover:text-white'
        }`}
        onClick={() => {
          if (!currentUser) onRequireLogin();
          else onNavigate('profile', { userId: currentUser.uid });
        }}
      >
        <span className="material-icons text-xl">account_circle</span>
        <span className="text-[10px] font-semibold">Perfil</span>
      </button>
    </nav>
  );
};
