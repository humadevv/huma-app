export type AspectRatio = '1:1' | '4:5' | '16:9';

export type ContentCategory = 
  | 'Architecture' 
  | 'Nature' 
  | 'Streetwear' 
  | 'Food' 
  | 'Travel' 
  | 'Minimal' 
  | 'Pets' 
  | 'Fitness' 
  | 'Tech';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  avatarUrl: string;
  bio: string;
  website?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  hasActiveStory?: boolean;
  categoryPreferences?: Record<ContentCategory, number>; // user topic interest weights
  isPrivate?: boolean;
  showActivityStatus?: boolean;
  twoFactorEnabled?: boolean;
  isAdmin?: boolean;
}

export interface VerificationBadgeRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface VerificationRequest {
  type: 'email' | 'password';
  targetValue: string; // new email or new password
  code: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  isVerified?: boolean;
  location?: string;
  mediaUrls: string[]; // Supports multi-image carousels
  mediaType: 'image' | 'video';
  filterName?: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  category: ContentCategory;
  audioTrack?: {
    title: string;
    artist: string;
    coverUrl?: string;
  };
  comments: Comment[];
  aspectRatio?: AspectRatio;
  algorithmBreakdown?: {
    recencyScore: number;
    engagementScore: number;
    creatorFollowBonus: number;
    categoryMatchScore: number;
    totalScore: number;
  };
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  hasUnseen: boolean;
  items: {
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    createdAt: string;
    caption?: string;
    viewsCount: number;
  }[];
}

export interface Reel {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  isVerified?: boolean;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  audioTrack: {
    title: string;
    artist: string;
    coverUrl?: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  category: ContentCategory;
  comments: Comment[];
}

export type Short = Reel;

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  postPreview?: {
    postId: string;
    mediaUrl: string;
    username: string;
    caption: string;
  };
  createdAt: string;
  isLiked?: boolean;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
  isOnline?: boolean;
  isPinned?: boolean;
  messages?: Message[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'moment';
  postId?: string;
  postMediaUrl?: string;
  commentText?: string;
  createdAt: string;
  isRead: boolean;
  isFollowingBack?: boolean;
}

export interface SavedCollection {
  id: string;
  name: string;
  coverMediaUrl: string;
  postIds: string[];
}

export interface PhotoFilter {
  id: string;
  name: string;
  filterCss: string;
  previewClass?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sepia?: number;
  vignette?: boolean;
}

export type FeedTab = 'for_you' | 'following';
export type ActiveTab = 'home' | 'search' | 'reels' | 'messages' | 'notifications' | 'create' | 'profile' | 'settings';
