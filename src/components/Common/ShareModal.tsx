import React, { useState } from 'react';
import { X, Send, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShareModal: React.FC = () => {
  const { 
    activeSharePost, 
    closeShareModal, 
    conversations, 
    sendMessage, 
    darkMode 
  } = useApp();

  const [sentUserIds, setSentUserIds] = useState<Set<string>>(new Set());

  if (!activeSharePost) return null;

  const handleSendToConv = (convId: string, participantId: string) => {
    const postMediaUrl = 'mediaUrls' in activeSharePost ? activeSharePost.mediaUrls[0] : activeSharePost.thumbnailUrl;
    sendMessage(
      convId, 
      `Check out this post by @${activeSharePost.username}!`, 
      undefined, 
      {
        postId: activeSharePost.id,
        mediaUrl: postMediaUrl,
        username: activeSharePost.username,
        caption: activeSharePost.caption,
      }
    );

    setSentUserIds((prev) => new Set(prev).add(participantId));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-4 transition-colors relative ${
        darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 font-bold text-base">
          <span>Yap Post</span>
          <button onClick={closeShareModal} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of friends */}
        <div className="py-3 max-h-72 overflow-y-auto space-y-2">
          {conversations.filter((c) => c.participant.username !== 'c').map((conv) => {
            const hasSent = sentUserIds.has(conv.participant.id);
            return (
              <div
                key={conv.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={conv.participant.avatarUrl}
                    alt={conv.participant.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-sm">{conv.participant.username}</div>
                    <div className="text-xs text-zinc-400">{conv.participant.fullName}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleSendToConv(conv.id, conv.participant.id)}
                  disabled={hasSent}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    hasSent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white hover:bg-rose-500'
                  }`}
                >
                  {hasSent ? (
                    <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Sent</span>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
