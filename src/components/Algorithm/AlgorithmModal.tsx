import React from 'react';
import { X, Sparkles, Check, Info, ArrowUpRight, Cpu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { calculatePostScore } from '../../utils/algorithm';

export const AlgorithmModal: React.FC = () => {
  const { 
    activeAlgorithmPost, 
    closeAlgorithmModal, 
    currentUser, 
    usersMap, 
    darkMode 
  } = useApp();

  if (!activeAlgorithmPost) return null;

  const followedUserIds = new Set(
    (Object.values(usersMap) as User[]).filter((u) => u.isFollowing).map((u) => u.id)
  );

  const scoreResult = calculatePostScore(activeAlgorithmPost, currentUser, followedUserIds);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-colors relative ${
        darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Close Button */}
        <button
          onClick={closeAlgorithmModal}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2 text-amber-400">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-wider">
            Pure Recommendation Algorithm
          </span>
        </div>

        <h2 className="text-xl font-bold mb-1">Why am I seeing this post?</h2>
        <p className="text-xs text-zinc-400 mb-6">
          This post was selected for your feed based on pure mathematical engagement weights and recency decay. Zero AI involved.
        </p>

        {/* Total Score Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/30 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-400">Total Ranking Score</div>
            <div className="text-3xl font-extrabold text-white mt-0.5">
              {scoreResult.totalScore} <span className="text-sm font-normal text-zinc-400">/ 1200 pts</span>
            </div>
          </div>
          <Cpu className="w-10 h-10 text-amber-400 opacity-80" />
        </div>

        {/* Score Components Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800/80">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-zinc-300">⏱️ Recency Decay Score</span>
              <span className="text-rose-400">+{scoreResult.recencyScore} / 300 pts</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${(scoreResult.recencyScore / 300) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800/80">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-zinc-300">🔥 Total Engagement Metric</span>
              <span className="text-amber-400">+{scoreResult.engagementScore} / 400 pts</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500"
                style={{ width: `${(scoreResult.engagementScore / 400) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800/80">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-zinc-300">👥 Creator Follow Affinity</span>
              <span className="text-purple-400">+{scoreResult.creatorFollowBonus} / 250 pts</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${(scoreResult.creatorFollowBonus / 250) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800/80">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-zinc-300">🎯 Category Interest Match (#{activeAlgorithmPost.category})</span>
              <span className="text-emerald-400">+{scoreResult.categoryMatchScore} / 250 pts</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${(scoreResult.categoryMatchScore / 250) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Formula Note */}
        <div className="text-[11px] text-zinc-500 bg-zinc-900 p-3 rounded-xl border border-zinc-800 leading-relaxed">
          💡 <strong className="text-zinc-300">Did you know?</strong> Every time you like, comment on, save, or share a post in #{activeAlgorithmPost.category}, your user affinity score for #{activeAlgorithmPost.category} increases dynamically!
        </div>
      </div>
    </div>
  );
};
