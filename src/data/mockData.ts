import { User, Post, Story, Reel, Conversation, NotificationItem, SavedCollection } from '../types';

export const ADMIN_USER: User = {
  id: 'user_control_panel',
  username: 'c',
  fullName: 'Dev Control Panel',
  email: 'panel@huma.com',
  phoneNumber: '+15550000001',
  password: 'thedevscontrolpanel001007001@!?',
  avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
  bio: '🛡️ HUMA Dev Control Panel',
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isVerified: true,
  isAdmin: true,
};

export const USER_D: User = {
  id: 'user_d',
  username: 'd',
  fullName: 'Developer',
  email: 'd@gmail.com',
  phoneNumber: '+15550000002',
  password: 'password123',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  bio: '🛡️ HUMA Developer • Human Made',
  followersCount: 1,
  followingCount: 0,
  postsCount: 0,
  isVerified: true,
  isAdmin: false,
};

export const CURRENT_USER: User = USER_D;

export const INITIAL_USERS: User[] = [ADMIN_USER, USER_D];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_STORIES: Story[] = [];

export const INITIAL_REELS: Reel[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_SAVED_COLLECTIONS: SavedCollection[] = [];
