import React from 'react';
import { Heart, MessageCircle, UserPlus, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsTab: React.FC = () => {
  const { 
    notifications, 
    markNotificationsRead, 
    toggleFollowUser, 
    usersMap, 
    navigateToProfile,
    darkMode 
  } = useApp();

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 pb-20">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white">Notifications</h1>
        <button
          onClick={markNotificationsRead}
          className="text-xs font-bold text-rose-500 hover:text-rose-400"
        >
          Mark all as read
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {notifications.map((notif) => {
          const user = usersMap[notif.userId];
          return (
            <div
              key={notif.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors border ${
                notif.isRead 
                  ? darkMode ? 'bg-black border-transparent' : 'bg-white border-transparent' 
                  : darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <div 
                onClick={() => navigateToProfile(notif.userId)}
                className="flex items-center gap-3 cursor-pointer group flex-1 mr-3"
              >
                <div className="relative shrink-0">
                  <img
                    src={notif.userAvatar}
                    alt={notif.username}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 p-1 text-white rounded-full ring-2 ring-black ${notif.type === 'moment' ? 'bg-red-600' : 'bg-rose-600'}`}>
                    {notif.type === 'like' && <Heart className="w-3 h-3 fill-white" />}
                    {notif.type === 'comment' && <MessageCircle className="w-3 h-3 fill-white" />}
                    {notif.type === 'follow' && <UserPlus className="w-3 h-3" />}
                    {notif.type === 'moment' && <Sparkles className="w-3 h-3 fill-white text-white" />}
                  </div>
                </div>

                <div className="text-sm leading-snug">
                  <span className="font-bold text-white group-hover:underline mr-1.5">
                    {notif.username}
                  </span>
                  <span className="text-zinc-300">
                    {notif.type === 'like' && 'liked your post.'}
                    {notif.type === 'comment' && `commented: "${notif.commentText}"`}
                    {notif.type === 'follow' && 'started following you.'}
                    {notif.type === 'moment' && 'created a new moment.'}
                  </span>
                  <span className="text-xs text-zinc-500 block mt-0.5">
                    {notif.createdAt}
                  </span>
                </div>
              </div>

              {/* Right Side Action / Media Preview */}
              {notif.type === 'follow' ? (
                <button
                  onClick={() => toggleFollowUser(notif.userId)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                    user?.isFollowing
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'bg-rose-600 text-white hover:bg-rose-500'
                  }`}
                >
                  {user?.isFollowing ? 'Following' : 'Follow Back'}
                </button>
              ) : notif.postMediaUrl ? (
                <img
                  src={notif.postMediaUrl}
                  alt="Post preview"
                  className="w-11 h-11 rounded-lg object-cover shrink-0 border border-zinc-800"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
