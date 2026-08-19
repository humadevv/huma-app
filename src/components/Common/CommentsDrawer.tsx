import React, { useState } from 'react';
import { X, Heart, Send, Sparkles, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { checkContentSafety, CONTENT_SAFETY_POLICY_MESSAGE } from '../../utils/contentFilter';

export const CommentsDrawer: React.FC = () => {
  const { 
    activePostCommentsId, 
    closeCommentsDrawer, 
    posts, 
    reels, 
    addCommentToPost, 
    addCommentToReel, 
    toggleLikeComment,
    currentUser,
    darkMode 
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);

  if (!activePostCommentsId) return null;

  const targetPost = posts.find((p) => p.id === activePostCommentsId);
  const targetReel = reels.find((r) => r.id === activePostCommentsId);

  const commentsList = targetPost ? targetPost.comments : targetReel ? targetReel.comments : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSafetyWarning(null);
    if (!commentText.trim()) return;

    const safety = checkContentSafety(commentText);
    if (!safety.isSafe) {
      setSafetyWarning(CONTENT_SAFETY_POLICY_MESSAGE);
      return;
    }

    if (targetPost) {
      addCommentToPost(targetPost.id, commentText);
    } else if (targetReel) {
      addCommentToReel(targetReel.id, commentText);
    }
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-lg h-[80vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col transition-colors relative overflow-hidden ${
        darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Top Handle / Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-bold text-base">
          <div className="flex items-center gap-2">
            <span>Comments</span>
            <span className="text-xs text-zinc-400 font-normal">
              ({commentsList.length})
            </span>
          </div>
          <button onClick={closeCommentsDrawer} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {commentsList.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-rose-500 opacity-60" />
              <p className="font-bold text-sm text-zinc-400">No comments yet</p>
              <p className="text-xs text-zinc-500 mt-1">Start the conversation!</p>
            </div>
          ) : (
            commentsList.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <img
                    src={c.userAvatar}
                    alt={c.username}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold text-white mr-2">{c.username}</span>
                    <span className="text-zinc-300">{c.text}</span>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold mt-1">
                      <span>{c.createdAt}</span>
                      <span>{c.likesCount} likes</span>
                      <button className="hover:text-white">Reply</button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => targetPost && toggleLikeComment(targetPost.id, c.id)}
                  className="p-1 text-zinc-400 hover:text-rose-500"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      c.isLiked ? 'text-rose-500 fill-rose-500' : ''
                    }`}
                  />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Child & Safety Warning Alert */}
        {safetyWarning && (
          <div className="mx-3 my-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-200 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-amber-300">Safety Notice</span>
              {safetyWarning}
            </div>
            <button onClick={() => setSafetyWarning(null)} className="text-amber-400 hover:text-amber-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Add Comment Input Footer */}
        <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 flex items-center gap-3 bg-zinc-900">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <input
            type="text"
            placeholder={`Add a comment as ${currentUser.username}...`}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="text-sm font-bold text-rose-500 hover:text-rose-400 disabled:opacity-40"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};
