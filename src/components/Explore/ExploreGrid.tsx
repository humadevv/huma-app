import React, { useState } from 'react';
import { 
  Search, 
  Heart, 
  MessageCircle, 
  Clapperboard, 
  Layers, 
  TrendingUp, 
  Tag 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContentCategory, Post, User } from '../../types';

export const ExploreGrid: React.FC = () => {
  const { 
    posts, 
    reels, 
    usersMap, 
    activeHashtag, 
    navigateToProfile, 
    openAlgorithmModal,
    openCommentsDrawer,
    darkMode 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState(activeHashtag || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories: string[] = [
    'All',
    'Architecture',
    'Travel',
    'Streetwear',
    'Food',
    'Minimal',
    'Nature',
    'Pets',
    'Tech',
    'Fitness'
  ];

  // Filter posts based on search query or category
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = searchQuery.trim() === '' ||
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Filter users matching search query (exclude hidden control panel account @c)
  const matchingUsers = (Object.values(usersMap) as User[]).filter((u) => 
    u.username !== 'c' && !u.isAdmin &&
    searchQuery.trim() !== '' && (
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-20">
      {/* Search Input Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search creators, hashtags (#photography), categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-12 pr-4 py-3 rounded-2xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500
            ${darkMode 
              ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500' 
              : 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400'}`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search Matching Users List */}
      {matchingUsers.length > 0 && (
        <div className={`mb-6 p-4 rounded-2xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
            Matching Accounts
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchingUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => navigateToProfile(user.id)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-rose-500/10 cursor-pointer transition-colors"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm text-white">
                    <span>@{user.username}</span>
                    {(user.isVerified || user.username === 'd') && (
                      <span className="text-sky-400 text-xs">✓</span>
                    )}
                    {user.username === 'd' && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase">
                        DEV
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400">{user.fullName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : darkMode
                  ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bento Masonry Algorithmic Explore Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-lg font-medium">No posts found matching "{searchQuery}"</p>
          <p className="text-sm mt-1">Try searching for #architecture, #travel, or select a category above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 md:gap-3">
          {filteredPosts.map((post, idx) => {
            const isFeaturedLarge = idx % 7 === 2; // Every 7th item takes a 2x2 featured span!

            return (
              <div
                key={post.id}
                onClick={() => openCommentsDrawer(post.id)}
                className={`relative group bg-zinc-900 rounded-xl overflow-hidden cursor-pointer aspect-square ${
                  isFeaturedLarge ? 'col-span-2 row-span-2 aspect-square' : ''
                }`}
              >
                <img
                  src={post.mediaUrls[0]}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Multiple Images Badge */}
                {post.mediaUrls.length > 1 && (
                  <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-md text-white backdrop-blur-sm z-10">
                    <Layers className="w-4 h-4" />
                  </div>
                )}

                {/* Hover Overlay with Likes & Comments Count */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white font-bold text-sm z-20">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-5 h-5 fill-white" />
                    <span>{post.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{post.commentsCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
