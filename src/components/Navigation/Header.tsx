import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  ChevronDown, 
  Check,
  Sparkles,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import { HumaLogo } from '../Common/HumaLogo';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { 
    feedTab, 
    setFeedTab, 
    setActiveTab, 
    notifications, 
    conversations, 
    darkMode,
    toggleDarkMode
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <header 
      className={`sticky top-0 z-20 md:hidden border-b transition-colors duration-200 px-4 py-3 flex items-center justify-between
        ${darkMode ? 'bg-black/95 text-white border-zinc-800 backdrop-blur-md' : 'bg-white/95 text-zinc-900 border-zinc-200 backdrop-blur-md'}`}
    >
      {/* Brand logo & Feed Selector dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 focus:outline-none"
        >
          <HumaLogo size={26} />
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
              HUMA
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-400">
              Human Made
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 mt-1" />
        </button>

        {/* Dropdown Menu for Algorithm vs Chronological */}
        {isDropdownOpen && (
          <div 
            className={`absolute left-0 top-11 w-56 rounded-2xl shadow-2xl border py-2 z-40 animate-in fade-in zoom-in-95
              ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
          >
            <button
              onClick={() => {
                setFeedTab('for_you');
                setIsDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between hover:bg-rose-500/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div>
                  <div className="font-semibold">For You</div>
                  <div className="text-[11px] text-zinc-400">Featured Feed</div>
                </div>
              </div>
              {feedTab === 'for_you' && <Check className="w-4 h-4 text-rose-500" />}
            </button>

            <button
              onClick={() => {
                setFeedTab('following');
                setIsDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between hover:bg-rose-500/10 transition-colors"
            >
              <div>
                <div className="font-semibold">Following</div>
                <div className="text-[11px] text-zinc-400">Chronological Feed</div>
              </div>
              {feedTab === 'following' && <Check className="w-4 h-4 text-rose-500" />}
            </button>
          </div>
        )}
      </div>

      {/* Right Header Icons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-white transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-700" />}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className="relative p-1 text-zinc-200 hover:text-white transition-colors"
        >
          <Heart className="w-6 h-6" />
          {unreadNotifs > 0 && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-600 rounded-full ring-2 ring-black" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className="relative p-1 text-zinc-200 hover:text-white transition-colors"
          title="Yaps"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold bg-rose-600 text-white rounded-full leading-none border border-black">
              {unreadMessages}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className="p-1 text-zinc-200 hover:text-white transition-colors ml-0.5"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-[#0095f6]" />
        </button>
      </div>
    </header>
  );
};
