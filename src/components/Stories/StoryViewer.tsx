import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Send, 
  Eye, 
  Pause, 
  Play,
  Edit3,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StoryViewer: React.FC = () => {
  const { 
    stories, 
    activeStoryIndex, 
    closeStoryViewer, 
    openStoryViewer,
    sendMessage, 
    createConversation,
    currentUser,
    editStoryItem,
    deleteStoryItem,
    deleteStory
  } = useApp();

  const [itemIndex, setItemIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // Edit / Delete states
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editCaptionValue, setEditCaptionValue] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (activeStoryIndex) {
      setItemIndex(activeStoryIndex.itemIndex || 0);
      setIsLiked(false);
      setReplyText('');
      setIsEditingCaption(false);
      setIsConfirmingDelete(false);
    }
  }, [activeStoryIndex]);

  // Auto-advance story timer (5 seconds per frame)
  useEffect(() => {
    if (!activeStoryIndex || isPaused || isEditingCaption || isConfirmingDelete) return;

    const currentStoryUser = stories[activeStoryIndex.userIndex];
    if (!currentStoryUser || !currentStoryUser.items.length) return;

    const timer = setTimeout(() => {
      if (itemIndex < currentStoryUser.items.length - 1) {
        setItemIndex((prev) => prev + 1);
      } else if (activeStoryIndex.userIndex < stories.length - 1) {
        const nextUserIdx = activeStoryIndex.userIndex + 1;
        setItemIndex(0);
        openStoryViewer(nextUserIdx, 0);
      } else {
        closeStoryViewer();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [itemIndex, activeStoryIndex, isPaused, isEditingCaption, isConfirmingDelete, stories, closeStoryViewer, openStoryViewer]);

  if (!activeStoryIndex) return null;

  const currentStoryUser = stories[activeStoryIndex.userIndex];
  if (!currentStoryUser || !currentStoryUser.items.length) return null;

  const currentItem = currentStoryUser.items[itemIndex] || currentStoryUser.items[0];
  const isOwner = currentStoryUser.userId === currentUser.id || currentUser.isAdmin;

  const handleNext = () => {
    if (itemIndex < currentStoryUser.items.length - 1) {
      setItemIndex((prev) => prev + 1);
    } else if (activeStoryIndex.userIndex < stories.length - 1) {
      // Go to next user's story
      const nextUserIdx = activeStoryIndex.userIndex + 1;
      setItemIndex(0);
      openStoryViewer(nextUserIdx, 0);
    } else {
      closeStoryViewer();
    }
  };

  const handlePrev = () => {
    if (itemIndex > 0) {
      setItemIndex((prev) => prev - 1);
    } else if (activeStoryIndex.userIndex > 0) {
      const prevUserIdx = activeStoryIndex.userIndex - 1;
      const prevUserStories = stories[prevUserIdx].items;
      setItemIndex(prevUserStories.length - 1);
      openStoryViewer(prevUserIdx, prevUserStories.length - 1);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const convId = createConversation({
      id: currentStoryUser.userId,
      username: currentStoryUser.username,
      fullName: currentStoryUser.username,
      avatarUrl: currentStoryUser.userAvatar,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    });

    sendMessage(convId, `Replied to moment: "${replyText}"`, currentItem.mediaUrl);
    setReplyText('');
    setIsPaused(false);
  };

  const handleSaveCaption = () => {
    editStoryItem(currentStoryUser.id, currentItem.id, editCaptionValue);
    setIsEditingCaption(false);
  };

  const handleDeleteMoment = () => {
    if (currentStoryUser.items.length <= 1) {
      deleteStory(currentStoryUser.id);
      closeStoryViewer();
    } else {
      deleteStoryItem(currentStoryUser.id, currentItem.id);
      setIsConfirmingDelete(false);
      if (itemIndex >= currentStoryUser.items.length - 1) {
        setItemIndex(Math.max(0, currentStoryUser.items.length - 2));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-xl animate-in fade-in duration-200">
      {/* Close button */}
      <button
        onClick={closeStoryViewer}
        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white bg-zinc-800/60 rounded-full backdrop-blur-md transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Story Container */}
      <div className="relative w-full max-w-sm h-full max-h-[92vh] bg-zinc-900 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl border border-zinc-800">
        {/* Top Header & Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Progress Segment Bars */}
          <div className="flex gap-1.5 mb-3">
            {currentStoryUser.items.map((it, idx) => (
              <div
                key={it.id}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-white transition-all duration-100 ease-linear ${
                    idx < itemIndex 
                      ? 'w-full' 
                      : idx === itemIndex && !isPaused && !isEditingCaption && !isConfirmingDelete
                        ? 'w-full animate-progress-5s' 
                        : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* User Info Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentStoryUser.userAvatar}
                alt={currentStoryUser.username}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-red-600"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-white block leading-tight">
                    {currentStoryUser.username}
                  </span>
                  {(currentStoryUser.isVerified || currentStoryUser.username === 'd') && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                  )}
                  {currentStoryUser.username === 'd' && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase">
                      DEV
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-zinc-300">
                  {currentItem.createdAt}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setEditCaptionValue(currentItem.caption || '');
                      setIsEditingCaption(true);
                    }}
                    className="p-1.5 text-zinc-300 hover:text-white bg-black/40 rounded-full"
                    title="Edit Moment Caption"
                  >
                    <Edit3 className="w-4 h-4 text-blue-400" />
                  </button>

                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="p-1.5 text-zinc-300 hover:text-white bg-black/40 rounded-full"
                    title="Delete Moment"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </>
              )}

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 text-white/80 hover:text-white"
              >
                {isPaused ? <Play className="w-5 h-5 fill-white" /> : <Pause className="w-5 h-5 fill-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Media Background */}
        <div 
          className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <img
            src={currentItem.mediaUrl}
            alt="Moment media"
            className="w-full h-full object-cover"
          />

          {/* Interactive Tap Zones for Next/Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-0 top-16 bottom-20 w-1/3 z-20 text-transparent"
          >
            Previous
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-0 top-16 bottom-20 w-1/3 z-20 text-transparent"
          >
            Next
          </button>

          {/* Caption Overlay */}
          {currentItem.caption && !isEditingCaption && (
            <div className="absolute bottom-20 left-4 right-4 z-30 p-3 bg-black/60 rounded-xl backdrop-blur-md text-white text-sm font-medium text-center border border-white/10">
              {currentItem.caption}
            </div>
          )}
        </div>

        {/* Story Bottom Reply Controls */}
        <div className="relative z-30 p-3 bg-black/80 flex items-center gap-3 border-t border-zinc-800">
          <form onSubmit={handleSendReply} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Reply to ${currentStoryUser.username}'s moment...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              className="w-full bg-zinc-800/80 text-white placeholder-zinc-400 text-sm px-4 py-2.5 rounded-full border border-zinc-700/60 focus:outline-none focus:border-rose-500"
            />
            {replyText.trim() && (
              <button
                type="submit"
                className="p-2 text-rose-500 hover:text-rose-400 font-semibold"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </form>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 text-white hover:text-rose-500 transition-colors"
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Edit Caption Overlay Modal */}
        {isEditingCaption && (
          <div className="absolute inset-0 z-40 bg-black/90 flex flex-col justify-center p-5 animate-in fade-in">
            <h4 className="text-white font-bold text-base mb-3 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-rose-500" />
              Edit Moment Caption
            </h4>
            <textarea
              value={editCaptionValue}
              onChange={(e) => setEditCaptionValue(e.target.value)}
              rows={3}
              placeholder="Moment caption..."
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-rose-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingCaption(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCaption}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Delete Moment Confirmation Overlay Modal */}
        {isConfirmingDelete && (
          <div className="absolute inset-0 z-40 bg-black/90 flex flex-col justify-center p-6 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-white font-bold text-base mb-1">Delete this Moment?</h4>
            <p className="text-xs text-zinc-400 mb-5">
              This moment will be permanently removed.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDeleteMoment}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
              >
                Delete Moment
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border border-zinc-700 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
