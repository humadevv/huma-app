import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Navigation/Sidebar';
import { BottomNav } from './components/Navigation/BottomNav';
import { Header } from './components/Navigation/Header';
import { HomeFeed } from './components/Feed/HomeFeed';
import { ExploreGrid } from './components/Explore/ExploreGrid';
import { ReelsFeed } from './components/Reels/ReelsFeed';
import { DirectMessages } from './components/Messages/DirectMessages';
import { NotificationsTab } from './components/Notifications/NotificationsTab';
import { ProfileView } from './components/Profile/ProfileView';
import { SettingsView } from './components/Settings/SettingsView';
import { AuthModal } from './components/Auth/AuthModal';
import { AdminPanel } from './components/Admin/AdminPanel';
import { StoryViewer } from './components/Stories/StoryViewer';
import { CreateModal } from './components/Create/CreateModal';
import { AlgorithmModal } from './components/Algorithm/AlgorithmModal';
import { ShareModal } from './components/Common/ShareModal';
import { CommentsDrawer } from './components/Common/CommentsDrawer';
import { SplashScreen } from './components/Common/SplashScreen';

const AppContent: React.FC = () => {
  const { activeTab, darkMode, isAuthenticated, currentUser } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} darkMode={darkMode} />;
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
        <AuthModal />
      </div>
    );
  }

  // Admin View: Control Panel account (@c) sees ONLY the Admin Panel
  if (currentUser?.username === 'c' || (currentUser?.isAdmin && currentUser?.username !== 'd')) {
    return <AdminPanel />;
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${
      darkMode ? 'bg-black text-white' : 'bg-white text-zinc-900'
    }`}>
      {/* Auth Modal overlay when logged out */}
      {!isAuthenticated && <AuthModal />}

      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Mobile Header */}
        <Header />

        {/* View Router */}
        <div className="flex-1">
          {activeTab === 'home' && <HomeFeed />}
          {activeTab === 'search' && <ExploreGrid />}
          {activeTab === 'reels' && <ReelsFeed />}
          {activeTab === 'messages' && <DirectMessages />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav />
      </div>

      {/* Global Modals */}
      <StoryViewer />
      <CreateModal />
      <AlgorithmModal />
      <ShareModal />
      <CommentsDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
