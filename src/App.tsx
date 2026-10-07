import React, { useState } from 'react';
import { I18nProvider, useI18n } from './i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import { RightSidebar } from './components/RightSidebar';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';
import { BannedOverlay } from './components/BannedOverlay';
import { LoginModal } from './components/modals/LoginModal';
import { CommentsModal } from './components/modals/CommentsModal';
import { CreateCommunityModal } from './components/modals/CreateCommunityModal';
import { MobileNav } from './components/MobileNav';

import { FeedView } from './views/FeedView';
import { ExploreView } from './views/ExploreView';
import { CommunitiesView } from './views/CommunitiesView';
import { CommunityDetailView } from './views/CommunityDetailView';
import { MessagesView } from './views/MessagesView';
import { SavedPostsView } from './views/SavedPostsView';
import { ProfileView } from './views/ProfileView';

import type { AppView, FeedTab, Post, Community } from './types';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState<AppView>('feed');
  const [currentFeedTab, setCurrentFeedTab] = useState<FeedTab>('for-you');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewParams, setViewParams] = useState<any>({});

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [createCommunityModalOpen, setCreateCommunityModalOpen] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);

  const handleNavigate = (view: AppView, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequireLogin = () => {
    setLoginModalOpen(true);
  };

  const handleCommunityCreated = (community: Community) => {
    handleNavigate('community', { id: community.id });
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Main Layout Container */}
      <div className="app-container flex-1">
        {/* Left Nav */}
        <SidebarNav
          currentView={currentView}
          currentFeedTab={currentFeedTab}
          onNavigate={handleNavigate}
          onSelectFeedTab={(tab) => {
            setCurrentFeedTab(tab);
            setSelectedCategory(null);
          }}
          onOpenCreateCommunityModal={() => setCreateCommunityModalOpen(true)}
          onRequireLogin={handleRequireLogin}
        />

        {/* Center View */}
        <main className="feed-container min-h-[500px]">
          {currentView === 'feed' && (
            <FeedView
              currentTab={currentFeedTab}
              onSelectTab={setCurrentFeedTab}
              categoryFilter={selectedCategory}
              onClearCategoryFilter={() => setSelectedCategory(null)}
              onOpenComments={(post) => setActiveCommentPost(post)}
              onNavigate={handleNavigate}
              onRequireLogin={handleRequireLogin}
            />
          )}

          {currentView === 'explore' && (
            <ExploreView
              initialQuery={viewParams.query || ''}
              onOpenComments={(post) => setActiveCommentPost(post)}
              onNavigate={handleNavigate}
              onRequireLogin={handleRequireLogin}
            />
          )}

          {currentView === 'communities' && (
            <CommunitiesView
              onNavigate={handleNavigate}
              onOpenCreateModal={() => setCreateCommunityModalOpen(true)}
              onRequireLogin={handleRequireLogin}
            />
          )}

          {currentView === 'community' && (
            <CommunityDetailView
              communityId={viewParams.id}
              onOpenComments={(post) => setActiveCommentPost(post)}
              onNavigate={handleNavigate}
              onRequireLogin={handleRequireLogin}
            />
          )}

          {currentView === 'messages' && (
            <MessagesView
              initialChatUserId={viewParams.userId}
              initialChatUserName={viewParams.userName}
              onRequireLogin={handleRequireLogin}
            />
          )}

          {currentView === 'saved' && (
            <SavedPostsView
              onOpenComments={(post) => setActiveCommentPost(post)}
              onNavigate={handleNavigate}
              onRequireLogin={handleRequireLogin}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              userId={viewParams.userId || currentUser?.uid || ''}
              userName={viewParams.userName || currentUser?.displayName || ''}
              onOpenComments={(post) => setActiveCommentPost(post)}
              onNavigate={handleNavigate}
              onRequireLogin={handleRequireLogin}
            />
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat === 'Todas' ? null : cat);
            if (currentView !== 'feed') {
              setCurrentView('feed');
            }
          }}
          onNavigate={handleNavigate}
          onRequireLogin={handleRequireLogin}
        />
      </div>

      {/* Mobile Navigation Dock */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onSelectFeedTab={(tab) => {
          setCurrentFeedTab(tab);
          setSelectedCategory(null);
        }}
        onRequireLogin={handleRequireLogin}
      />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <CommentsModal
        post={activeCommentPost}
        onClose={() => setActiveCommentPost(null)}
        onRequireLogin={handleRequireLogin}
      />

      <CreateCommunityModal
        isOpen={createCommunityModalOpen}
        onClose={() => setCreateCommunityModalOpen(false)}
        onCreated={handleCommunityCreated}
      />

      {/* Cookie Consent & Banned Overlay */}
      <CookieConsent />
      <BannedOverlay />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <I18nProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </I18nProvider>
    </ToastProvider>
  );
}
