import React from 'react';
import { 
  Home, 
  Compass, 
  Clapperboard, 
  MessageCircle, 
  PlusSquare 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    setIsCreateModalOpen, 
    conversations,
    darkMode,
    navigateToProfile
  } = useApp();

  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const tabs: { id: ActiveTab; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', icon: <Home className="w-6 h-6" /> },
    { id: 'search', icon: <Compass className="w-6 h-6" /> },
    { id: 'reels', icon: <Clapperboard className="w-6 h-6" /> },
    { id: 'messages', icon: <MessageCircle className="w-6 h-6" />, badge: unreadMessages },
  ];

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 md:hidden border-t z-30 transition-colors duration-200 px-6 py-2.5 flex items-center justify-between
        ${darkMode ? 'bg-black text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200'}`}
    >
      {tabs.slice(0, 2).map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`p-2 rounded-xl transition-all relative ${
            activeTab === tab.id ? 'text-rose-500 scale-110' : darkMode ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          {tab.icon}
        </button>
      ))}

      {/* Center Create Button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="p-2 rounded-xl text-rose-500 active:scale-95 transition-transform"
      >
        <PlusSquare className="w-7 h-7" />
      </button>

      {tabs.slice(2).map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`p-2 rounded-xl transition-all relative ${
            activeTab === tab.id ? 'text-rose-500 scale-110' : darkMode ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          {tab.icon}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-bold bg-rose-600 text-white rounded-full leading-none border border-black">
              {tab.badge}
            </span>
          )}
        </button>
      ))}

      {/* Profile Avatar */}
      <button
        onClick={() => navigateToProfile(currentUser.id)}
        className={`p-0.5 rounded-full border-2 transition-transform ${
          activeTab === 'profile' ? 'border-rose-500 scale-105' : 'border-transparent'
        }`}
      >
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.username}
          className="w-6 h-6 rounded-full object-cover"
        />
      </button>
    </div>
  );
};
