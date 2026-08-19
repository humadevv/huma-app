import React from 'react';
import { 
  Home, 
  Search, 
  Compass, 
  Clapperboard, 
  MessageCircle, 
  Heart, 
  PlusSquare, 
  Sun, 
  Moon,
  Sparkles,
  Settings
} from 'lucide-react';
import { HumaLogo } from '../Common/HumaLogo';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    setIsCreateModalOpen, 
    notifications,
    conversations,
    darkMode,
    toggleDarkMode,
    navigateToProfile
  } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" /> },
    { id: 'search', label: 'Explore', icon: <Compass className="w-6 h-6" /> },
    { id: 'reels', label: 'Shorts', icon: <Clapperboard className="w-6 h-6" /> },
    { id: 'messages', label: 'Yaps', icon: <MessageCircle className="w-6 h-6" />, badge: unreadMessages },
    { id: 'notifications', label: 'Notifications', icon: <Heart className="w-6 h-6" />, badge: unreadNotifs },
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col justify-between h-screen sticky top-0 border-r z-30 transition-colors duration-200
        ${darkMode ? 'bg-black text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200'}
        w-16 xl:w-64 px-3 py-6`}
    >
      <div className="flex flex-col gap-6">
        {/* HUMA Brand Logo Header */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer px-2 py-1.5 text-xl font-bold tracking-tight group"
        >
          <HumaLogo size={32} />
          <div className="hidden xl:flex flex-col">
            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity leading-none">
              HUMA
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">
              Human Made
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl font-medium text-base transition-all duration-150 relative group
                  ${isActive 
                    ? darkMode ? 'bg-zinc-800/80 text-white font-semibold' : 'bg-zinc-100 text-black font-semibold' 
                    : darkMode ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-700 hover:bg-zinc-100'}`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full leading-none border-2 border-black">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline">{item.label}</span>
              </button>
            );
          })}

          {/* Create Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl font-medium text-base transition-all duration-150
              ${darkMode ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-700 hover:bg-zinc-100'}`}
          >
            <PlusSquare className="w-6 h-6 text-rose-500" />
            <span className="hidden xl:inline">Create</span>
          </button>

          {/* Profile Item */}
          <button
            onClick={() => navigateToProfile(currentUser.id)}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl font-medium text-base transition-all duration-150
              ${activeTab === 'profile' && currentUser.id === currentUser.id 
                ? darkMode ? 'bg-zinc-800/80 font-semibold' : 'bg-zinc-100 font-semibold'
                : darkMode ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-700 hover:bg-zinc-100'}`}
          >
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.username}
              className={`w-6 h-6 rounded-full object-cover ring-2 ${activeTab === 'profile' ? 'ring-rose-500' : 'ring-transparent'}`}
            />
            <span className="hidden xl:inline">Profile</span>
          </button>

          {/* Settings Item */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl font-medium text-base transition-all duration-150
              ${activeTab === 'settings' 
                ? darkMode ? 'bg-zinc-800/80 text-white font-semibold' : 'bg-zinc-100 text-black font-semibold' 
                : darkMode ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-700 hover:bg-zinc-100'}`}
          >
            <Settings className="w-6 h-6 text-[#0095f6]" />
            <span className="hidden xl:inline">Settings</span>
          </button>
        </nav>
      </div>

      {/* Footer controls: Dark Mode Toggle & Transparent Algo Badge */}
      <div className="flex flex-col gap-2 pt-4 border-t border-zinc-800/50">
        {/* Non-AI Transparency Statement */}
        <div className={`hidden xl:flex items-center gap-2 px-3 py-2 text-[11px] font-medium rounded-lg ${darkMode ? 'bg-zinc-900/90 text-zinc-400' : 'bg-zinc-100 text-zinc-600'}`}>
          <span>This app does not use AI for anything</span>
        </div>

        {/* Theme switcher button */}
        <button
          onClick={toggleDarkMode}
          className={`flex items-center gap-4 px-3 py-3 rounded-xl font-medium text-sm transition-all duration-150
            ${darkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'}`}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-800" />}
          <span className="hidden xl:inline">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
};
