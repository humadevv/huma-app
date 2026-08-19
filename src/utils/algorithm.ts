import { Post, Reel, ContentCategory, User } from '../types';

export interface AlgorithmScoreResult {
  recencyScore: number;
  engagementScore: number;
  creatorFollowBonus: number;
  categoryMatchScore: number;
  totalScore: number;
  breakdownExplanation: string[];
}

/**
 * Calculates a transparent, deterministic algorithm recommendation score for a post
 */
export function calculatePostScore(
  post: Post,
  currentUser: User,
  followedUserIds: Set<string>
): AlgorithmScoreResult {
  const now = new Date().getTime();
  const createdTime = new Date(post.createdAt).getTime();
  const hoursAgo = Math.max(0, (now - createdTime) / (1000 * 60 * 60));

  // 1. Recency Decay Score (Max 300 pts)
  // Half-life decay (~14 hrs)
  const recencyScore = Math.round(Math.exp(-0.05 * hoursAgo) * 300);

  // 2. Engagement Weight Score (Max 400 pts)
  // Formula: Likes(1) + Comments(2.5) + Saves(4) + Shares(5)
  const rawEngagement = 
    (post.likesCount * 1) + 
    (post.commentsCount * 2.5) + 
    (post.savesCount * 4) + 
    (post.sharesCount * 5);
  const engagementScore = Math.min(400, Math.round(Math.sqrt(rawEngagement) * 18));

  // 3. Creator Follow Bonus (250 pts)
  const isFollowed = followedUserIds.has(post.userId) || post.userId === currentUser.id;
  const creatorFollowBonus = isFollowed ? 250 : 0;

  // 4. Category Match Score (Max 250 pts)
  const categoryWeights = currentUser.categoryPreferences || {};
  const userCatWeight = categoryWeights[post.category] || 0.5; // range 0.1 to 1.0
  const categoryMatchScore = Math.round(userCatWeight * 250);

  const totalScore = recencyScore + engagementScore + creatorFollowBonus + categoryMatchScore;

  const hoursAgoDisplay = hoursAgo < 1 
    ? `${Math.round(hoursAgo * 60)} minutes ago` 
    : `${hoursAgo.toFixed(1)} hours ago`;

  const breakdownExplanation = [
    `⏱️ Recency (+${recencyScore}/300 pts): Posted ${hoursAgoDisplay}.`,
    `🔥 Engagement (+${engagementScore}/400 pts): ${post.likesCount} likes, ${post.commentsCount} comments, ${post.savesCount} saves, ${post.sharesCount} shares.`,
    `👥 Follow Affinity (+${creatorFollowBonus}/250 pts): ${isFollowed ? 'You follow @' + post.username : 'Not currently following @' + post.username}.`,
    `🎯 Category Match (+${categoryMatchScore}/250 pts): Based on your ${(userCatWeight * 100).toFixed(0)}% interest weight in #${post.category}.`
  ];

  return {
    recencyScore,
    engagementScore,
    creatorFollowBonus,
    categoryMatchScore,
    totalScore,
    breakdownExplanation,
  };
}

/**
 * Ranks posts using the HUMA Pure Recommendation Algorithm
 */
export function rankPostsAlgorithmic(
  posts: Post[],
  currentUser: User,
  followedUserIds: Set<string>
): Post[] {
  const scoredPosts = posts.map((post) => {
    const scoreResult = calculatePostScore(post, currentUser, followedUserIds);
    return {
      ...post,
      algorithmBreakdown: {
        recencyScore: scoreResult.recencyScore,
        engagementScore: scoreResult.engagementScore,
        creatorFollowBonus: scoreResult.creatorFollowBonus,
        categoryMatchScore: scoreResult.categoryMatchScore,
        totalScore: scoreResult.totalScore,
      },
    };
  });

  return [...scoredPosts].sort((a, b) => {
    const scoreA = a.algorithmBreakdown?.totalScore || 0;
    const scoreB = b.algorithmBreakdown?.totalScore || 0;
    return scoreB - scoreA;
  });
}

/**
 * Returns purely chronological posts for "Following" feed mode
 */
export function rankPostsChronological(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Ranks reels for the Reels algorithm feed
 */
export function rankReelsAlgorithmic(
  reels: Reel[],
  currentUser: User,
  followedUserIds: Set<string>
): Reel[] {
  return [...reels].sort((a, b) => {
    const catWeightA = (currentUser.categoryPreferences?.[a.category] || 0.5) * 100 + (a.likesCount * 0.1);
    const catWeightB = (currentUser.categoryPreferences?.[b.category] || 0.5) * 100 + (b.likesCount * 0.1);
    const followBonusA = followedUserIds.has(a.userId) ? 100 : 0;
    const followBonusB = followedUserIds.has(b.userId) ? 100 : 0;

    return (catWeightB + followBonusB) - (catWeightA + followBonusA);
  });
}
