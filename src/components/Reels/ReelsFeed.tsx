import React, { useState, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Music2, 
  CheckCircle2, 
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  X,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, ContentCategory } from '../../types';
import { rankReelsAlgorithmic } from '../../utils/algorithm';

export const ReelsFeed: React.FC = () => {
  const { 
    reels, 
    toggleLikeReel, 
    toggleSaveReel, 
    openCommentsDrawer, 
    openShareModal, 
    toggleFollowUser, 
    usersMap, 
    currentUser,
    navigateToProfile,
    editShort,
    deleteShort,
    darkMode
  } = useApp();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Edit / Delete State
  const [editingShortId, setEditingShortId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editAudioTitle, setEditAudioTitle] = useState('');
  const [editCategory, setEditCategory] = useState<ContentCategory>('Architecture');
  const [deletingShortId, setDeletingShortId] = useState<string | null>(null);
  const [activeMenuShortId, setActiveMenuShortId] = useState<string | null>(null);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const rankedReels = rankReelsAlgorithmic(
    reels, 
    currentUser, 
    new Set((Object.values(usersMap) as User[]).filter((u) => u.isFollowing).map((u) => u.id))
  );

  const handleVideoClick = (idx: number) => {
    const v = videoRefs.current[idx];
    if (v) {
      if (v.paused) {
        v.play();
        setIsPlaying(true);
      } else {
        v.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activeIndex && index >= 0 && index < rankedReels.length) {
      setActiveIndex(index);
      setIsPlaying(true);
      videoRefs.current.forEach((v, i) => {
        if (v) {
          if (i === index) {
            v.currentTime = 0;
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      });
    }
  };

  const handleOpenEdit = (reel: typeof reels[0]) => {
    setEditingShortId(reel.id);
    setEditCaption(reel.caption);
    setEditAudioTitle(reel.audioTrack.title);
    setEditCategory(reel.category);
    setActiveMenuShortId(null);
  };

  const handleSaveEdit = () => {
    if (!editingShortId) return;
    editShort(editingShortId, {
      caption: editCaption,
      audioTitle: editAudioTitle,
      category: editCategory,
    });
    setEditingShortId(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingShortId) return;
    deleteShort(deletingShortId);
    setDeletingShortId(null);
    setActiveMenuShortId(null);
  };

  return (
    <div 
      onScroll={handleScroll}
      className="w-full h-[calc(100vh-64px)] md:h-screen overflow-y-snap bg-black snap-y snap-mandatory scroll-smooth flex flex-col items-center"
    >
      {rankedReels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3">
          <p className="text-base font-semibold">No Shorts found</p>
          <span className="text-xs">Create your first short using the + button!</span>
        </div>
      ) : null}

      {rankedReels.map((reel, idx) => {
        const creator = usersMap[reel.userId];
        const isFollowingCreator = creator?.isFollowing;
        const isOwner = reel.userId === currentUser.id || currentUser.isAdmin;

        return (
          <div
            key={reel.id}
            className="relative w-full max-w-sm md:max-w-md h-full snap-start shrink-0 bg-zinc-950 overflow-hidden flex items-center justify-center border-x border-zinc-800"
          >
            {/* Video Element */}
            <video
              ref={(el) => (videoRefs.current[idx] = el)}
              src={reel.videoUrl}
              poster={reel.thumbnailUrl}
              loop
              muted={isMuted}
              playsInline
              autoPlay={idx === 0}
              onClick={() => handleVideoClick(idx)}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Floating Options & Mute Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setActiveMenuShortId(activeMenuShortId === reel.id ? null : reel.id)}
                    className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {activeMenuShortId === reel.id && (
                    <div className="absolute right-0 top-11 w-40 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl py-1 z-40 animate-in fade-in">
                      <button
                        onClick={() => handleOpenEdit(reel)}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-white flex items-center gap-2 hover:bg-zinc-800"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Edit Short</span>
                      </button>
                      <button
                        onClick={() => {
                          setDeletingShortId(reel.id);
                          setActiveMenuShortId(null);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-400 flex items-center gap-2 hover:bg-zinc-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Short</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Bottom Caption & Profile Metadata */}
            <div className="absolute bottom-4 left-4 right-16 z-30 flex flex-col gap-2.5 text-white">
              {/* Profile & Follow button */}
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => navigateToProfile(reel.userId)}
                  className="relative cursor-pointer group"
                >
                  <img
                    src={reel.userAvatar}
                    alt={reel.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500"
                  />
                  {!isFollowingCreator && reel.userId !== currentUser.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollowUser(reel.userId);
                      }}
                      className="absolute -bottom-1 -right-1 p-0.5 bg-rose-600 text-white rounded-full border border-black"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </button>
                  )}
                </div>

                <div 
                  onClick={() => navigateToProfile(reel.userId)}
                  className="cursor-pointer group"
                >
                  <div className="flex items-center gap-1 font-bold text-sm text-white group-hover:underline">
                    <span>{reel.username}</span>
                    {(reel.isVerified || reel.username === 'd') && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                    )}
                    {reel.username === 'd' && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase">
                        DEV
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-300">Shorts Creator</span>
                </div>

                {!isFollowingCreator && reel.userId !== currentUser.id && (
                  <button
                    onClick={() => toggleFollowUser(reel.userId)}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-colors ml-1"
                  >
                    Follow
                  </button>
                )}
              </div>

              {/* Reel Caption */}
              <p className="text-sm font-medium leading-snug line-clamp-2">
                {reel.caption}
              </p>

              {/* Audio Track Tag */}
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                <Music2 className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
                <span className="truncate max-w-[200px]">
                  {reel.audioTrack.title} • {reel.audioTrack.artist}
                </span>
              </div>
            </div>

            {/* Right Side Vertical Action Bar */}
            <div className="absolute right-3 bottom-8 z-30 flex flex-col items-center gap-5 text-white">
              {/* Like */}
              <button
                onClick={() => toggleLikeReel(reel.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
                  <Heart
                    className={`w-7 h-7 ${
                      reel.isLiked ? 'text-rose-500 fill-rose-500' : 'text-white'
                    }`}
                  />
                </div>
                <span className="text-xs font-bold">
                  {reel.likesCount.toLocaleString()}
                </span>
              </button>

              {/* Comment */}
              <button
                onClick={() => openCommentsDrawer(reel.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold">
                  {reel.commentsCount.toLocaleString()}
                </span>
              </button>

              {/* Share */}
              <button
                onClick={() => openShareModal(reel)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
                  <Share2 className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold">{reel.sharesCount}</span>
              </button>

              {/* Save */}
              <button
                onClick={() => toggleSaveReel(reel.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
                  <Bookmark
                    className={`w-7 h-7 ${
                      reel.isSaved ? 'text-amber-400 fill-amber-400' : 'text-white'
                    }`}
                  />
                </div>
                <span className="text-xs font-bold">{reel.savesCount}</span>
              </button>

              {/* Spinning Vinyl Audio Disc */}
              <div className="mt-2 p-1 rounded-full border-2 border-white/60 bg-black animate-spin-slow shadow-xl">
                <img
                  src={reel.userAvatar}
                  alt="audio"
                  className="w-7 h-7 rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Edit Short Modal Dialog */}
      {editingShortId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <span className="font-bold text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-rose-500" />
                Edit Short
              </span>
              <button 
                onClick={() => setEditingShortId(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Caption</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  placeholder="Short caption..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Audio Title</label>
                <input
                  type="text"
                  value={editAudioTitle}
                  onChange={(e) => setEditAudioTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  placeholder="Audio track name..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as ContentCategory)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Architecture">Architecture</option>
                  <option value="Travel">Travel</option>
                  <option value="Streetwear">Streetwear</option>
                  <option value="Food">Food</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Nature">Nature</option>
                  <option value="Pets">Pets</option>
                  <option value="Tech">Tech</option>
                  <option value="Fitness">Fitness</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingShortId(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Short Confirmation Dialog */}
      {deletingShortId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-center text-white">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">Delete Short?</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Are you sure you want to delete this short? This action cannot be undone.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDeleteConfirm}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white"
              >
                Delete Short
              </button>
              <button
                onClick={() => setDeletingShortId(null)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-zinc-800 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ShortsFeed = ReelsFeed;
