import React from 'react';
import { StoriesBar } from './StoriesBar';
import { FeedItem } from './FeedItem';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { Sparkles, Check, Users } from 'lucide-react';

export const HomeFeed: React.FC = () => {
  const { 
    posts, 
    feedTab, 
    setFeedTab, 
    currentUser, 
    usersMap, 
    toggleFollowUser, 
    navigateToProfile,
    darkMode 
  } = useApp();

  const suggestedUsers = (Object.values(usersMap) as User[]).filter(
    (u) => u.id !== currentUser.id && !u.isFollowing
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex gap-10 justify-center py-4 px-0 md:px-4">
      {/* Main Center Feed */}
      <main className="w-full max-w-lg shrink-0">
        {/* Desktop Header Feed Tab Selector */}
        <div className="hidden md:flex items-center justify-between px-2 mb-4">
          <div className="flex items-center gap-6 border-b border-zinc-800 w-full pb-2">
            <button
              onClick={() => setFeedTab('for_you')}
              className={`flex items-center gap-2 pb-2 -mb-2 font-bold text-sm border-b-2 transition-all ${
                feedTab === 'for_you'
                  ? 'border-rose-500 text-rose-500'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>For You (Algorithmic)</span>
            </button>

            <button
              onClick={() => setFeedTab('following')}
              className={`flex items-center gap-2 pb-2 -mb-2 font-bold text-sm border-b-2 transition-all ${
                feedTab === 'following'
                  ? 'border-rose-500 text-rose-500'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Following (Chronological)</span>
            </button>
          </div>
        </div>

        {/* Top Stories Tray */}
        <div className="mb-4">
          <StoriesBar />
        </div>

        {/* Algorithm Status Banner */}
        <div className={`mx-2 mb-4 px-3 py-2 rounded-xl text-xs flex items-center justify-between border ${
          darkMode ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>
              {feedTab === 'for_you' 
                ? 'Sorted by engagement, category affinity & recency score' 
                : 'Sorted chronologically'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
            NO AI
          </span>
        </div>

        {/* Post Items */}
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <FeedItem key={post.id} post={post} />
          ))}
        </div>
      </main>

      {/* Right Desktop Suggestions Sidebar */}
      <aside className="hidden lg:block w-80 shrink-0 py-2">
        {/* Current User Quick Header */}
        <div className="flex items-center justify-between mb-6">
          <div 
            onClick={() => navigateToProfile(currentUser.id)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500/50"
            />
            <div>
              <div className="font-bold text-sm text-white group-hover:underline">
                {currentUser.username}
              </div>
              <div className="text-xs text-zinc-400">{currentUser.fullName}</div>
            </div>
          </div>
          <button 
            onClick={() => navigateToProfile(currentUser.id)}
            className="text-xs font-bold text-rose-500 hover:text-rose-400"
          >
            Switch
          </button>
        </div>

        {/* Suggested Accounts Section */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Suggested for you
          </span>
          <button className="text-xs font-bold text-white hover:text-zinc-300">
            See All
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {suggestedUsers.slice(0, 5).map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div 
                onClick={() => navigateToProfile(user.id)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-xs text-white group-hover:underline flex items-center gap-1">
                    <span>{user.username}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Suggested by algorithm
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleFollowUser(user.id)}
                className={`text-xs font-bold transition-colors ${
                  user.isFollowing
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-rose-500 hover:text-rose-400'
                }`}
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Meta */}
        <div className="mt-8 text-[11px] text-zinc-600 leading-relaxed">
          About • Help • Press • API • Jobs • Privacy • Terms • Locations • Language
          <div className="mt-2 text-zinc-500 font-mono">
            © 2026 HUMA • Human Made
          </div>
        </div>
      </aside>
    </div>
  );
};
