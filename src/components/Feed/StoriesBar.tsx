import React from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StoriesBar: React.FC = () => {
  const { 
    stories, 
    openStoryViewer, 
    currentUser, 
    setIsCreateModalOpen,
    darkMode 
  } = useApp();

  const myStoryIdx = stories.findIndex((s) => s.userId === currentUser.id);
  const hasMyMoment = myStoryIdx >= 0 && stories[myStoryIdx].items.length > 0;

  return (
    <div 
      className={`flex items-center gap-4 overflow-x-auto py-3 px-4 no-scrollbar border-b transition-colors duration-200
        ${darkMode ? 'bg-black border-zinc-900/80' : 'bg-white border-zinc-100'}`}
    >
      {/* Current User Moment Item */}
      <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
        <div className="relative">
          <div 
            onClick={() => {
              if (hasMyMoment) {
                openStoryViewer(myStoryIdx);
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className={`p-[2.5px] rounded-full transition-all duration-200 ${
              hasMyMoment 
                ? 'bg-red-600 shadow-md shadow-red-600/40 ring-1 ring-red-500' 
                : 'bg-zinc-700'
            }`}
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-black group-hover:scale-105 transition-transform"
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCreateModalOpen(true);
            }}
            className="absolute bottom-0 right-0 p-1 bg-red-600 text-white rounded-full border-2 border-black hover:bg-red-500 shadow-md"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
        <span className="text-[11px] font-medium text-zinc-300 max-w-[64px] truncate">
          Your Moment
        </span>
      </div>

      {/* Other Users' Moments */}
      {stories
        .filter((s) => s.userId !== currentUser.id)
        .map((story) => {
          const originalIdx = stories.findIndex((s) => s.id === story.id);
          return (
            <div
              key={story.id}
              onClick={() => openStoryViewer(originalIdx)}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
            >
              <div 
                className={`p-[2.5px] rounded-full transition-all duration-200 ${
                  story.hasUnseen 
                    ? 'bg-red-600 animate-pulse-subtle shadow-md shadow-red-600/40 ring-1 ring-red-500' 
                    : 'bg-zinc-700'
                }`}
              >
                <img
                  src={story.userAvatar}
                  alt={story.username}
                  className="w-16 h-16 rounded-full object-cover border-2 border-black group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[11px] font-medium text-zinc-300 max-w-[68px] truncate">
                {story.username}
              </span>
            </div>
          );
        })}
    </div>
  );
};
