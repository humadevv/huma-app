import React, { useState } from 'react';
import { 
  Grid, 
  Clapperboard, 
  Bookmark, 
  UserCheck, 
  Settings, 
  CheckCircle2, 
  Link as LinkIcon, 
  MessageSquare, 
  Sparkles,
  Heart,
  MessageCircle,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, Post, Reel } from '../../types';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    activeProfileUserId, 
    usersMap, 
    posts, 
    reels, 
    toggleFollowUser, 
    createConversation, 
    setActiveTab, 
    openCommentsDrawer,
    updateUserProfile,
    darkMode 
  } = useApp();

  const [activeTab, setActiveProfileTab] = useState<'posts' | 'reels' | 'saved' | 'tagged'>('posts');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editWebsite, setEditWebsite] = useState(currentUser.website || '');

  const displayUser: User = activeProfileUserId && usersMap[activeProfileUserId] 
    ? usersMap[activeProfileUserId] 
    : currentUser;

  const isOwnProfile = displayUser.id === currentUser.id;

  const userPosts = posts.filter((p) => p.userId === displayUser.id);
  const userReels = reels.filter((r) => r.userId === displayUser.id);
  const savedPosts = posts.filter((p) => p.isSaved);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      bio: editBio,
      website: editWebsite,
    });
    setIsEditingProfile(false);
  };

  const handleSendMessage = () => {
    const convId = createConversation(displayUser);
    setActiveTab('messages');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-20">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 pb-8 border-b border-zinc-800">
        {/* Avatar with Dev text on top and Verified Blue Tick Overlay */}
        <div className="relative p-1 rounded-full bg-red-600 shadow-md shadow-red-600/40 ring-1 ring-red-500 shrink-0">
          {/* Dev label on top of profile picture */}
          {displayUser.username === 'd' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 text-[10px] font-black tracking-widest text-white ring-2 ring-black shadow-xl flex items-center gap-1 z-20 uppercase whitespace-nowrap">
              <Sparkles className="w-2.5 h-2.5 text-yellow-200 fill-yellow-200" />
              <span>DEV</span>
            </div>
          )}

          <img
            src={displayUser.avatarUrl}
            alt={displayUser.username}
            className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border-4 border-black"
          />
          {(displayUser.isVerified || displayUser.username === 'd') && (
            <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-1 md:p-1.5 rounded-full bg-[#0095f6] text-white ring-4 ring-black shadow-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 fill-white text-[#0095f6]" />
            </div>
          )}
        </div>

        {/* User Info & Stats */}
        <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
          {/* Top Row: Username + Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-1.5 font-bold text-xl md:text-2xl text-white">
              <span>{displayUser.username}</span>
              {(displayUser.isVerified || displayUser.username === 'd') && (
                <CheckCircle2 className="w-5 h-5 text-sky-500 fill-sky-500" />
              )}
              {displayUser.username === 'd' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold tracking-wider uppercase ml-1">
                  DEV
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-1.5 rounded-xl bg-[#0095f6] text-xs font-bold text-white hover:bg-sky-600 transition-colors shadow-sm"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
                    title="Account Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleFollowUser(displayUser.id)}
                    className={`px-5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      displayUser.isFollowing
                        ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                        : 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30'
                    }`}
                  >
                    {displayUser.isFollowing ? 'Following' : 'Follow'}
                  </button>

                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-1.5 rounded-xl bg-zinc-800 text-xs font-bold text-white hover:bg-zinc-700 transition-colors border border-zinc-700 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Yap</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center md:justify-start gap-8 text-sm">
            <div>
              <span className="font-bold text-white">{userPosts.length}</span>{' '}
              <span className="text-zinc-400">posts</span>
            </div>
            <div>
              <span className="font-bold text-white">{displayUser.followersCount.toLocaleString()}</span>{' '}
              <span className="text-zinc-400">followers</span>
            </div>
            <div>
              <span className="font-bold text-white">{displayUser.followingCount.toLocaleString()}</span>{' '}
              <span className="text-zinc-400">following</span>
            </div>
          </div>

          {/* Bio & Links */}
          <div className="text-sm leading-relaxed">
            <div className="font-bold text-white">{displayUser.fullName}</div>
            <div className="whitespace-pre-line text-zinc-300 mt-1">{displayUser.bio}</div>
            {displayUser.website && (
              <a
                href={displayUser.website}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 font-bold hover:underline flex items-center gap-1 mt-1.5 justify-center md:justify-start"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{displayUser.website.replace('https://', '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Drawer */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="my-6 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
          <div className="font-bold text-sm text-white">Edit Your Profile</div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Bio</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
              className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Website URL</label>
            <input
              type="text"
              value={editWebsite}
              onChange={(e) => setEditWebsite(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-1.5 text-xs text-zinc-400 hover:text-white font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Story Highlights Bar */}
      <div className="flex items-center gap-6 overflow-x-auto py-6 no-scrollbar border-b border-zinc-800/80">
        <div className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center bg-zinc-900 group-hover:border-zinc-500">
            <Plus className="w-6 h-6 text-zinc-400" />
          </div>
          <span className="text-xs font-medium text-zinc-400">New</span>
        </div>

        {['Tokyo 🇯🇵', 'Dolomites 🏔️', 'Berlin 🏛️', 'Film 🎞️'].map((hl, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group">
            <div className="p-0.5 rounded-full border-2 border-zinc-700 group-hover:border-rose-500">
              <img
                src={`https://images.unsplash.com/photo-${1513694203232 + idx * 1000}?auto=format&fit=crop&w=200&q=80`}
                alt={hl}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <span className="text-xs font-medium text-zinc-300">{hl}</span>
          </div>
        ))}
      </div>

      {/* Profile Tabs (POSTS, REELS, SAVED, TAGGED) */}
      <div className="flex items-center justify-center gap-12 border-b border-zinc-800">
        <button
          onClick={() => setActiveProfileTab('posts')}
          className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-wider border-t-2 -mt-[1px] transition-colors ${
            activeTab === 'posts'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('reels')}
          className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-wider border-t-2 -mt-[1px] transition-colors ${
            activeTab === 'reels'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Clapperboard className="w-4 h-4" />
          <span>Shorts ({userReels.length})</span>
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveProfileTab('saved')}
            className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-wider border-t-2 -mt-[1px] transition-colors ${
              activeTab === 'saved'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedPosts.length})</span>
          </button>
        )}
      </div>

      {/* Tab Content Display */}
      <div className="py-6">
        {activeTab === 'posts' && (
          userPosts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Grid className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-base text-zinc-400">No Posts Yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 md:gap-3">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => openCommentsDrawer(post.id)}
                  className="relative group bg-zinc-900 aspect-square rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={post.mediaUrls[0]}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold text-sm">
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
              ))}
            </div>
          )
        )}

        {activeTab === 'reels' && (
          userReels.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Clapperboard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-base text-zinc-400">No Shorts Yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 md:gap-3">
              {userReels.map((reel) => (
                <div
                  key={reel.id}
                  className="relative group bg-zinc-900 aspect-[9/16] rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white font-bold text-xs shadow-md">
                    <Clapperboard className="w-4 h-4 fill-white" />
                    <span>{reel.likesCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'saved' && (
          savedPosts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-base text-zinc-400">No Saved Posts</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 md:gap-3">
              {savedPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => openCommentsDrawer(post.id)}
                  className="relative group bg-zinc-900 aspect-square rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={post.mediaUrls[0]}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold text-sm">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-5 h-5 fill-white" />
                      <span>{post.likesCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
