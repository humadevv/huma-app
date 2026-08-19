import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  Music2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Share2,
  Edit3,
  Trash2,
  X,
  Check,
  MapPin,
  Tag
} from 'lucide-react';
import { Post, ContentCategory } from '../../types';
import { useApp } from '../../context/AppContext';

interface FeedItemProps {
  post: Post;
}

export const FeedItem: React.FC<FeedItemProps> = ({ post }) => {
  const { 
    currentUser,
    toggleLikePost, 
    toggleSavePost, 
    openCommentsDrawer, 
    openShareModal, 
    openAlgorithmModal,
    navigateToProfile,
    navigateToHashtag,
    addCommentToPost,
    editPost,
    deletePost,
    darkMode
  } = useApp();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  // Dropdown menu, Edit Modal & Delete Confirm states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Edit form state
  const [editCaption, setEditCaption] = useState(post.caption);
  const [editLocation, setEditLocation] = useState(post.location || '');
  const [editCategory, setEditCategory] = useState<ContentCategory>(post.category);

  const isOwner = post.userId === currentUser.id || currentUser.isAdmin;

  // Double tap to like post
  const handleDoubleTap = () => {
    if (!post.isLiked) {
      toggleLikePost(post.id);
    }
    setDoubleTapHeart(true);
    setTimeout(() => {
      setDoubleTapHeart(false);
    }, 900);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addCommentToPost(post.id, commentInput);
    setCommentInput('');
  };

  const handleSaveEdit = () => {
    editPost(post.id, {
      caption: editCaption,
      location: editLocation,
      category: editCategory,
    });
    setIsEditing(false);
  };

  const handleDeletePost = () => {
    deletePost(post.id);
    setIsConfirmingDelete(false);
    setIsMenuOpen(false);
  };

  const hasMultipleImages = post.mediaUrls.length > 1;

  return (
    <article 
      className={`border-b md:border md:rounded-2xl overflow-hidden transition-colors duration-200 mb-4 relative
        ${darkMode ? 'bg-black border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
    >
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div 
          onClick={() => navigateToProfile(post.userId)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-[2px] rounded-full bg-red-600 shadow-sm shadow-red-600/30 ring-1 ring-red-500">
            <img
              src={post.userAvatar}
              alt={post.username}
              className="w-9 h-9 rounded-full object-cover border-2 border-black"
            />
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-sm group-hover:underline">
              <span>{post.username}</span>
              {(post.isVerified || post.username === 'd') && (
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
              )}
              {post.username === 'd' && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase">
                  DEV
                </span>
              )}
            </div>
            {post.location && (
              <span className="text-[11px] text-zinc-400 block -mt-0.5">
                {post.location}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls: Algorithm Score Inspector & Options Menu */}
        <div className="flex items-center gap-1 relative">
          {post.algorithmBreakdown && (
            <button
              onClick={() => openAlgorithmModal(post)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              title="View pure mathematical algorithm ranking breakdown"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Score: {post.algorithmBreakdown.totalScore}</span>
            </button>
          )}

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div 
              className={`absolute right-0 top-10 w-48 rounded-2xl shadow-2xl border py-1.5 z-40 animate-in fade-in zoom-in-95
                ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
            >
              {isOwner ? (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditing(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-blue-400" />
                    <span>Edit Post</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsConfirmingDelete(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Post</span>
                  </button>
                </>
              ) : null}

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openShareModal(post);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 hover:bg-rose-500/10 transition-colors"
              >
                <Share2 className="w-4 h-4 text-zinc-400" />
                <span>Share Post</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  navigator.clipboard?.writeText(window.location.href);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 hover:bg-rose-500/10 transition-colors"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copy Link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Media Carousel Container */}
      <div 
        className="relative aspect-square w-full bg-zinc-900 overflow-hidden select-none cursor-pointer group"
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={post.mediaUrls[currentSlide]}
          alt={`Post by ${post.username}`}
          className="w-full h-full object-cover transition-all duration-300"
          style={{ filter: post.filterName ? `contrast(110%) saturate(120%)` : 'none' }}
        />

        {/* Animated Double Tap Heart Burst */}
        {doubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Heart className="w-28 h-28 text-rose-500 fill-rose-500 animate-ping opacity-90 drop-shadow-2xl" />
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {hasMultipleImages && (
          <>
            {currentSlide > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide((prev) => prev - 1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {currentSlide < post.mediaUrls.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide((prev) => prev + 1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Carousel Dots */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {post.mediaUrls.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    idx === currentSlide ? 'w-4 bg-rose-500' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Bar (Like, Comment, Share, Bookmark) */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleLikePost(post.id)}
            className="p-1 -ml-1 text-zinc-200 hover:text-rose-500 active:scale-125 transition-transform"
          >
            <Heart
              className={`w-6 h-6 ${
                post.isLiked ? 'text-rose-500 fill-rose-500' : 'text-zinc-200 hover:text-zinc-400'
              }`}
            />
          </button>

          <button
            onClick={() => openCommentsDrawer(post.id)}
            className="p-1 text-zinc-200 hover:text-zinc-400 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          <button
            onClick={() => openShareModal(post)}
            className="p-1 text-zinc-200 hover:text-zinc-400 transition-colors"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={() => toggleSavePost(post.id)}
          className="p-1 text-zinc-200 hover:text-zinc-400 transition-colors"
        >
          <Bookmark
            className={`w-6 h-6 ${
              post.isSaved ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'
            }`}
          />
        </button>
      </div>

      {/* Likes Counter & Information */}
      <div className="px-4 pb-2">
        <span className="font-bold text-sm">
          {post.likesCount.toLocaleString()} likes
        </span>

        {/* Audio Track Badge */}
        {post.audioTrack && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-400">
            <Music2 className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
            <span className="font-medium text-zinc-300">
              {post.audioTrack.title} • {post.audioTrack.artist}
            </span>
          </div>
        )}

        {/* Caption */}
        <div className="mt-1.5 text-sm leading-snug">
          <span 
            onClick={() => navigateToProfile(post.userId)}
            className="font-bold mr-2 cursor-pointer hover:underline"
          >
            {post.username}
          </span>
          <span>
            {post.caption.split(' ').map((word, i) => {
              if (word.startsWith('#')) {
                return (
                  <span
                    key={i}
                    onClick={() => navigateToHashtag(word)}
                    className="text-sky-400 font-medium cursor-pointer hover:underline mr-1"
                  >
                    {word}{' '}
                  </span>
                );
              }
              return word + ' ';
            })}
          </span>
        </div>

        {/* Comments Link */}
        {post.commentsCount > 0 && (
          <button
            onClick={() => openCommentsDrawer(post.id)}
            className="text-xs text-zinc-400 hover:text-zinc-300 mt-2 block font-medium"
          >
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Recent Comments Snippet */}
        {post.comments.slice(0, 2).map((c) => (
          <div key={c.id} className="text-xs mt-1 text-zinc-300">
            <span className="font-bold mr-1.5">{c.username}</span>
            <span>{c.text}</span>
          </div>
        ))}

        {/* Time Ago */}
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-2">
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Add Inline Comment Box */}
      <form 
        onSubmit={handleCommentSubmit}
        className="px-4 py-3 border-t border-zinc-800/60 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
        />
        {commentInput.trim() && (
          <button
            type="submit"
            className="text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors"
          >
            Post
          </button>
        )}
      </form>

      {/* Edit Post Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 relative ${
            darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-bold text-base mb-4">
              <span className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-rose-500" />
                Edit Post
              </span>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-full"
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  placeholder="Update caption..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Location</label>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Category</label>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl">
                  <Tag className="w-4 h-4 text-rose-500" />
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ContentCategory)}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  >
                    <option value="Architecture" className="bg-zinc-900">Architecture</option>
                    <option value="Travel" className="bg-zinc-900">Travel</option>
                    <option value="Streetwear" className="bg-zinc-900">Streetwear</option>
                    <option value="Food" className="bg-zinc-900">Food</option>
                    <option value="Minimal" className="bg-zinc-900">Minimal</option>
                    <option value="Nature" className="bg-zinc-900">Nature</option>
                    <option value="Pets" className="bg-zinc-900">Pets</option>
                    <option value="Tech" className="bg-zinc-900">Tech</option>
                    <option value="Fitness" className="bg-zinc-900">Fitness</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Post Confirmation Dialog */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 text-center relative ${
            darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">Delete Post?</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Are you sure you want to delete this post? This action cannot be undone and will remove it permanently.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDeletePost}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
