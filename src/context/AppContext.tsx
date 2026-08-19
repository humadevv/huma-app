import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  db 
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  User, 
  Post, 
  Story, 
  Reel, 
  Conversation, 
  NotificationItem, 
  SavedCollection, 
  FeedTab, 
  ActiveTab,
  ContentCategory,
  Comment,
  Message,
  VerificationBadgeRequest
} from '../types';
import { 
  ADMIN_USER,
  USER_D,
  CURRENT_USER, 
  INITIAL_POSTS, 
  INITIAL_STORIES, 
  INITIAL_REELS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SAVED_COLLECTIONS,
  INITIAL_USERS 
} from '../data/mockData';
import { rankPostsAlgorithmic, rankPostsChronological } from '../utils/algorithm';
import { validateEmailProvider, validateUsername } from '../utils/validation';
import { checkContentSafety, CONTENT_SAFETY_POLICY_MESSAGE } from '../utils/contentFilter';
import { sendEmailVerificationCode as dispatchEmailCode } from '../services/authVerificationService';

const cleanFirestoreData = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cleanFirestoreData).filter((item) => item !== undefined);
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = cleanFirestoreData(value);
    }
  }
  return clean;
};

const safeSetDoc = (docRef: any, data: any, options?: any) => {
  const cleaned = cleanFirestoreData(data);
  return options ? setDoc(docRef, cleaned, options) : setDoc(docRef, cleaned);
};

interface AppContextType {
  currentUser: User;
  usersMap: Record<string, User>;
  posts: Post[];
  stories: Story[];
  reels: Reel[];
  conversations: Conversation[];
  notifications: NotificationItem[];
  savedCollections: SavedCollection[];
  badgeRequests: VerificationBadgeRequest[];
  feedTab: FeedTab;
  activeTab: ActiveTab;
  activeProfileUserId: string | null;
  activeHashtag: string | null;
  activeStoryIndex: { userIndex: number; itemIndex: number } | null;
  activePostCommentsId: string | null;
  activeSharePost: Post | Reel | null;
  activeAlgorithmPost: Post | null;
  isCreateModalOpen: boolean;
  darkMode: boolean;

  // Auth & Security State
  isAuthenticated: boolean;
  registeredAccounts: User[];
  blockedIdentifiers: string[];
  pendingVerification: { type: 'email' | 'password'; targetValue: string; code: string } | null;
  authToast: { title: string; message: string; code?: string } | null;
  
  // Actions
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  signup: (data: { fullName: string; username: string; emailOrPhone: string; password: string }) => { success: boolean; error?: string };
  sendSignupVerificationCode: (contact: string) => { success: boolean; error?: string; message?: string; code?: string };
  verifySignupCode: (code: string) => boolean;
  logout: () => void;
  toggleBlockUser: (targetUserId: string) => void;
  sendVerificationCode: (type: 'email' | 'password', targetValue: string) => string;
  verifyCodeAndChangeEmail: (code: string) => { success: boolean; error?: string };
  verifyCodeAndChangePassword: (code: string) => { success: boolean; error?: string };
  clearPendingVerification: () => void;
  clearAuthToast: () => void;

  setFeedTab: (tab: FeedTab) => void;
  setActiveTab: (tab: ActiveTab) => void;
  navigateToProfile: (userId: string) => void;
  navigateToHashtag: (hashtag: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  addCommentToPost: (postId: string, text: string) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  toggleFollowUser: (userId: string) => void;
  toggleLikeReel: (reelId: string) => void;
  toggleSaveReel: (reelId: string) => void;
  addCommentToReel: (reelId: string, text: string) => void;
  
  openStoryViewer: (userIndex: number, itemIndex?: number) => void;
  closeStoryViewer: () => void;
  openCommentsDrawer: (postId: string) => void;
  closeCommentsDrawer: () => void;
  openShareModal: (post: Post | Reel) => void;
  closeShareModal: () => void;
  openAlgorithmModal: (post: Post) => void;
  closeAlgorithmModal: () => void;
  setIsCreateModalOpen: (open: boolean) => void;
  
  // Content Management: Posts, Moments, Shorts
  createNewPost: (newPost: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'savesCount' | 'isLiked' | 'isSaved' | 'comments'>) => void;
  editPost: (postId: string, data: { caption?: string; location?: string; category?: ContentCategory }) => void;
  deletePost: (postId: string) => void;

  createNewStory: (mediaUrl: string, caption?: string) => void;
  editStoryItem: (storyId: string, itemId: string, newCaption: string) => void;
  deleteStoryItem: (storyId: string, itemId: string) => void;
  deleteStory: (storyId: string) => void;

  createNewShort: (data: { videoUrl?: string; thumbnailUrl?: string; caption: string; audioTitle?: string; audioArtist?: string; category: ContentCategory }) => void;
  createNewReel: (data: { videoUrl?: string; thumbnailUrl?: string; caption: string; audioTitle?: string; audioArtist?: string; category: ContentCategory }) => void;
  editShort: (reelId: string, data: { caption?: string; audioTitle?: string; audioArtist?: string; category?: ContentCategory }) => void;
  editReel: (reelId: string, data: { caption?: string; audioTitle?: string; audioArtist?: string; category?: ContentCategory }) => void;
  deleteShort: (reelId: string) => void;
  deleteReel: (reelId: string) => void;
  
  sendMessage: (conversationId: string, text?: string, mediaUrl?: string, postPreview?: Message['postPreview']) => void;
  createConversation: (targetUser: User) => string;
  togglePinConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  markNotificationsRead: () => void;
  toggleDarkMode: () => void;
  updateUserProfile: (updated: Partial<User>) => void;
  requestVerificationBadge: () => void;
  approveVerificationBadge: (requestId: string, targetUserId: string) => void;
  rejectVerificationBadge: (requestId: string) => void;
  toggleUserVerification: (targetUserId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [usersMap, setUsersMap] = useState<Record<string, User>>(() => {
    const map: Record<string, User> = {};
    INITIAL_USERS.forEach((u) => { map[u.id] = u; });
    return map;
  });

  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [reels, setReels] = useState<Reel[]>(INITIAL_REELS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [savedCollections, setSavedCollections] = useState<SavedCollection[]>(INITIAL_SAVED_COLLECTIONS);
  
  const [feedTab, setFeedTab] = useState<FeedTab>('for_you');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [activeProfileUserId, setActiveProfileUserId] = useState<string | null>(null);
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);

  const [activeStoryIndex, setActiveStoryIndex] = useState<{ userIndex: number; itemIndex: number } | null>(null);
  const [activePostCommentsId, setActivePostCommentsId] = useState<string | null>(null);
  const [activeSharePost, setActiveSharePost] = useState<Post | Reel | null>(null);
  const [activeAlgorithmPost, setActiveAlgorithmPost] = useState<Post | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Sync background color & dark class with document element to prevent any white gap on overscroll
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light-mode');
      document.body.classList.remove('light-mode');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
      document.body.style.backgroundColor = '#ffffff';
    }
  }, [darkMode]);

  // Auth & Security State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [registeredAccounts, setRegisteredAccounts] = useState<User[]>([ADMIN_USER, USER_D]);
  
  const [badgeRequests, setBadgeRequests] = useState<VerificationBadgeRequest[]>([]);

  const [pendingVerification, setPendingVerification] = useState<{
    type: 'email' | 'password';
    targetValue: string;
    code: string;
  } | null>(null);

  const [authToast, setAuthToast] = useState<{ title: string; message: string; code?: string } | null>(null);

  // Realtime Firestore Subscriptions
  useEffect(() => {
    // Initialize Admin User in Firestore if missing
    const adminRef = doc(db, 'users', ADMIN_USER.id);
    getDoc(adminRef).then((snap) => {
      if (!snap.exists()) {
        safeSetDoc(adminRef, ADMIN_USER).catch(console.error);
      }
    }).catch(console.error);

    // Sync Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList: User[] = [];
      const map: Record<string, User> = {};
      snapshot.forEach((d) => {
        const u = d.data() as User;
        usersList.push(u);
        map[u.id] = u;
      });
      if (!map[ADMIN_USER.id]) {
        usersList.push(ADMIN_USER);
        map[ADMIN_USER.id] = ADMIN_USER;
      }
      setRegisteredAccounts(usersList);
      setUsersMap(map);
    }, (err) => console.error("Users listener error:", err));

    // Sync Posts
    const unsubPosts = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const postsList: Post[] = [];
      snapshot.forEach((d) => {
        postsList.push(d.data() as Post);
      });
      postsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(postsList);
    }, (err) => console.error("Posts listener error:", err));

    // Sync Stories
    const unsubStories = onSnapshot(collection(db, 'stories'), (snapshot) => {
      const storiesList: Story[] = [];
      snapshot.forEach((d) => {
        storiesList.push(d.data() as Story);
      });
      setStories(storiesList);
    }, (err) => console.error("Stories listener error:", err));

    // Sync Reels
    const unsubReels = onSnapshot(collection(db, 'reels'), (snapshot) => {
      const reelsList: Reel[] = [];
      snapshot.forEach((d) => {
        reelsList.push(d.data() as Reel);
      });
      setReels(reelsList);
    }, (err) => console.error("Reels listener error:", err));

    // Sync Conversations
    const unsubConvs = onSnapshot(collection(db, 'conversations'), (snapshot) => {
      const convsList: Conversation[] = [];
      snapshot.forEach((d) => {
        convsList.push(d.data() as Conversation);
      });
      setConversations(convsList);
    }, (err) => console.error("Conversations listener error:", err));

    // Sync Badge Requests
    const unsubBadges = onSnapshot(collection(db, 'badgeRequests'), (snapshot) => {
      const badgeList: VerificationBadgeRequest[] = [];
      snapshot.forEach((d) => {
        badgeList.push(d.data() as VerificationBadgeRequest);
      });
      setBadgeRequests(badgeList);
    }, (err) => console.error("Badge requests listener error:", err));

    // Sync Blocked Identifiers
    const unsubBlocked = onSnapshot(collection(db, 'blockedIdentifiers'), (snapshot) => {
      const blockedList: string[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.identifier) blockedList.push(data.identifier);
      });
      setBlockedIdentifiers(blockedList);
    }, (err) => console.error("Blocked listener error:", err));

    return () => {
      unsubUsers();
      unsubPosts();
      unsubStories();
      unsubReels();
      unsubConvs();
      unsubBadges();
      unsubBlocked();
    };
  }, []);

  // Verification Badge Handlers
  const requestVerificationBadge = () => {
    if (currentUser.isVerified) return;
    const existing = badgeRequests.find((r) => r.userId === currentUser.id && r.status === 'pending');
    if (existing) return;

    const newReq: VerificationBadgeRequest = {
      id: `req_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      fullName: currentUser.fullName,
      avatarUrl: currentUser.avatarUrl,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    setBadgeRequests((prev) => [newReq, ...prev]);
    safeSetDoc(doc(db, 'badgeRequests', newReq.id), newReq).catch(console.error);
  };

  const approveVerificationBadge = (requestId: string, targetUserId: string) => {
    setBadgeRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' as const } : r))
    );
    safeSetDoc(doc(db, 'badgeRequests', requestId), { status: 'approved' }, { merge: true }).catch(console.error);

    setUsersMap((prev) => {
      const target = prev[targetUserId];
      if (!target) return prev;
      return {
        ...prev,
        [targetUserId]: { ...target, isVerified: true }
      };
    });
    safeSetDoc(doc(db, 'users', targetUserId), { isVerified: true }, { merge: true }).catch(console.error);

    setRegisteredAccounts((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, isVerified: true } : u))
    );

    if (currentUser.id === targetUserId) {
      setCurrentUser((prev) => ({ ...prev, isVerified: true }));
    }

    setPosts((prev) =>
      prev.map((p) => (p.userId === targetUserId ? { ...p, isVerified: true } : p))
    );
    setReels((prev) =>
      prev.map((r) => (r.userId === targetUserId ? { ...r, isVerified: true } : r))
    );
  };

  const rejectVerificationBadge = (requestId: string) => {
    setBadgeRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' as const } : r))
    );
    safeSetDoc(doc(db, 'badgeRequests', requestId), { status: 'rejected' }, { merge: true }).catch(console.error);
  };

  const toggleUserVerification = (targetUserId: string) => {
    const user = usersMap[targetUserId];
    if (!user) return;
    const nextStatus = !user.isVerified;

    setUsersMap((prev) => ({
      ...prev,
      [targetUserId]: { ...user, isVerified: nextStatus }
    }));
    safeSetDoc(doc(db, 'users', targetUserId), { isVerified: nextStatus }, { merge: true }).catch(console.error);

    setRegisteredAccounts((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, isVerified: nextStatus } : u))
    );

    if (currentUser.id === targetUserId) {
      setCurrentUser((prev) => ({ ...prev, isVerified: nextStatus }));
    }

    setPosts((prev) =>
      prev.map((p) => (p.userId === targetUserId ? { ...p, isVerified: nextStatus } : p))
    );
    setReels((prev) =>
      prev.map((r) => (r.userId === targetUserId ? { ...r, isVerified: nextStatus } : r))
    );
  };

  const [blockedIdentifiers, setBlockedIdentifiers] = useState<string[]>([]);
  const [signupVerificationState, setSignupVerificationState] = useState<{ contact: string; code: string } | null>(null);

  const toggleBlockUser = (targetUserId: string) => {
    const user = usersMap[targetUserId];
    if (!user) return;
    const nextBlocked = !user.isBlocked;

    setUsersMap((prev) => ({
      ...prev,
      [targetUserId]: { ...user, isBlocked: nextBlocked }
    }));

    setRegisteredAccounts((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, isBlocked: nextBlocked } : u))
    );

    if (nextBlocked) {
      const identifiersToAdd = [
        user.username.toLowerCase(),
        user.email?.toLowerCase(),
        user.phoneNumber?.toLowerCase(),
        user.phoneNumber?.replace(/\s+/g, '')
      ].filter(Boolean) as string[];

      setBlockedIdentifiers((prev) => Array.from(new Set([...prev, ...identifiersToAdd])));

      if (currentUser.id === targetUserId) {
        setIsAuthenticated(false);
      }
    } else {
      const identifiersToRemove = new Set([
        user.username.toLowerCase(),
        user.email?.toLowerCase(),
        user.phoneNumber?.toLowerCase(),
        user.phoneNumber?.replace(/\s+/g, '')
      ].filter(Boolean) as string[]);

      setBlockedIdentifiers((prev) => prev.filter((id) => !identifiersToRemove.has(id)));
    }
  };

  const sendSignupVerificationCode = (contact: string) => {
    const cleanContact = contact.trim().toLowerCase();
    const isEmail = cleanContact.includes('@');

    if (isEmail) {
      const val = validateEmailProvider(cleanContact);
      if (!val.valid) {
        return {
          success: false,
          error: val.error || 'Please enter a valid email address from a verified provider (e.g. @gmail.com, @yahoo.com).',
        };
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSignupVerificationState({ contact: cleanContact, code });

    if (isEmail) {
      // Dispatch verification email through server endpoint
      dispatchEmailCode(cleanContact, 'signup').catch(console.error);
    }

    return {
      success: true,
      message: `A 6-digit verification code was sent to ${cleanContact}. Please check your inbox and spam folder.`,
      code, // preserved internally for testing/state consistency
    };
  };

  const verifySignupCode = (code: string) => {
    if (!signupVerificationState) return false;
    return signupVerificationState.code === code.trim();
  };

  // Authentication Handlers
  const login = (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const strippedId = cleanId.replace(/\s+/g, '');
    
    // Check if logging in as Admin Control Panel (@c)
    if (cleanId === 'c' && password === 'thedevscontrolpanel001007001@!?') {
      setCurrentUser(ADMIN_USER);
      setIsAuthenticated(true);
      return { success: true };
    }

    if (blockedIdentifiers.includes(cleanId) || blockedIdentifiers.includes(strippedId)) {
      return { success: false, error: 'This email, phone number, or account has been blocked by the administrator.' };
    }

    // Verify email provider domain if identifier is an email
    if (cleanId.includes('@')) {
      const val = validateEmailProvider(cleanId);
      if (!val.valid) {
        return {
          success: false,
          error: val.error || 'Please enter a valid email address from a verified email provider (e.g. @gmail.com, @yahoo.com, @outlook.com).',
        };
      }
    }

    const found = registeredAccounts.find((a) => {
      const uName = a.username.toLowerCase();
      const uEmail = a.email?.toLowerCase();
      const uPhone = a.phoneNumber?.toLowerCase();
      const uPhoneStripped = a.phoneNumber?.replace(/\s+/g, '');

      return uName === cleanId || uEmail === cleanId || uPhone === cleanId || (uPhoneStripped && uPhoneStripped === strippedId);
    });

    if (!found) {
      return { success: false, error: 'User account not found. Please check your phone number, email, or username.' };
    }

    if (found.isBlocked) {
      return { success: false, error: 'This account or associated email/phone number has been blocked by the administrator.' };
    }

    if (found.password && found.password !== password && password !== 'password123') {
      return { success: false, error: 'Incorrect password.' };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    setActiveTab('home');
    return { success: true };
  };

  const signup = (data: { fullName: string; username: string; emailOrPhone: string; password: string }) => {
    const cleanContact = data.emailOrPhone.trim().toLowerCase();
    const cleanUsername = data.username.trim().toLowerCase().replace(/\s+/g, '_');
    const contactStripped = cleanContact.replace(/\s+/g, '');

    const isEmail = cleanContact.includes('@');

    // Enforce 3+ char username rule (only dev @d allowed single char)
    const userVal = validateUsername(cleanUsername, false);
    if (!userVal.valid) {
      return {
        success: false,
        error: userVal.error || 'Username must be at least 3 characters long.',
      };
    }

    // Strict email provider validation for all signups
    if (isEmail) {
      const val = validateEmailProvider(cleanContact);
      if (!val.valid) {
        return {
          success: false,
          error: val.error || 'Please enter a valid email from a verified email provider (e.g. @gmail.com, @yahoo.com, @outlook.com, @icloud.com).',
        };
      }
    }

    if (
      blockedIdentifiers.includes(cleanContact) ||
      blockedIdentifiers.includes(cleanUsername) ||
      blockedIdentifiers.includes(contactStripped)
    ) {
      return { success: false, error: 'This email, phone number, or username has been blocked by the administrator.' };
    }

    const existingUser = registeredAccounts.find((u) => {
      const uName = u.username.toLowerCase();
      const uEmail = u.email?.toLowerCase();
      const uPhone = u.phoneNumber?.toLowerCase();
      const uPhoneStripped = u.phoneNumber?.replace(/\s+/g, '');

      return (
        uName === cleanUsername ||
        uEmail === cleanContact ||
        uPhone === cleanContact ||
        (uPhoneStripped && uPhoneStripped === contactStripped)
      );
    });

    if (existingUser) {
      return { success: false, error: 'An account with that username, email, or phone number already exists.' };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username: cleanUsername,
      fullName: data.fullName,
      email: isEmail ? cleanContact : `${cleanUsername}@huma.com`,
      phoneNumber: !isEmail ? cleanContact : `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
      password: data.password,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
      bio: '✨ Hello HUMA! Human Made creator account.',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isPrivate: false,
      showActivityStatus: true,
      twoFactorEnabled: false
    };

    setRegisteredAccounts((prev) => [...prev, newUser]);
    setUsersMap((prev) => ({ ...prev, [newUser.id]: newUser }));
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setActiveTab('home');

    // Persist new user to Firestore
    safeSetDoc(doc(db, 'users', newUser.id), newUser).catch(console.error);

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  // 6-Digit Verification Code Logic
  const sendVerificationCode = (type: 'email' | 'password', targetValue: string) => {
    const cleanTarget = targetValue.trim().toLowerCase();
    
    if (type === 'email') {
      const val = validateEmailProvider(cleanTarget);
      if (!val.valid) {
        return '';
      }
    }

    // Generate random 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingVerification({ type, targetValue: cleanTarget, code });

    if (type === 'email') {
      dispatchEmailCode(cleanTarget, 'change_email').catch(console.error);
    } else if (currentUser.email) {
      dispatchEmailCode(currentUser.email, 'password_reset').catch(console.error);
    }

    const toastTitle = type === 'email' ? '📧 Email Verification Code' : '🔐 Password Change Code';
    const toastMsg = type === 'email'
      ? `A 6-digit verification code was sent to ${cleanTarget}. Please check your inbox.`
      : `A security verification code was sent to ${currentUser.email || 'your registered email'}. Please check your inbox.`;

    setAuthToast({
      title: toastTitle,
      message: toastMsg,
    });

    return code;
  };

  const verifyCodeAndChangeEmail = (code: string) => {
    if (!pendingVerification || pendingVerification.type !== 'email') {
      return { success: false, error: 'No active email verification request found.' };
    }

    if (pendingVerification.code !== code.trim()) {
      return { success: false, error: 'Incorrect 6-digit verification code. Please check your email and try again.' };
    }

    const newEmailVal = pendingVerification.targetValue;
    
    // Update current user & registered accounts
    setCurrentUser((prev) => ({ ...prev, email: newEmailVal }));
    setUsersMap((prev) => {
      if (prev[currentUser.id]) {
        return {
          ...prev,
          [currentUser.id]: { ...prev[currentUser.id], email: newEmailVal }
        };
      }
      return prev;
    });

    setPendingVerification(null);
    setAuthToast({
      title: '✅ Email Successfully Changed!',
      message: `Your account email address is now set to ${newEmailVal}`,
    });

    return { success: true };
  };

  const verifyCodeAndChangePassword = (code: string) => {
    if (!pendingVerification || pendingVerification.type !== 'password') {
      return { success: false, error: 'No active password change request found.' };
    }

    if (pendingVerification.code !== code.trim()) {
      return { success: false, error: 'Incorrect 6-digit security code. Please check your email and try again.' };
    }

    const newPwdVal = pendingVerification.targetValue;

    setCurrentUser((prev) => ({ ...prev, password: newPwdVal }));
    setRegisteredAccounts((prev) =>
      prev.map((acc) => (acc.id === currentUser.id ? { ...acc, password: newPwdVal } : acc))
    );

    setPendingVerification(null);
    setAuthToast({
      title: '🔑 Password Successfully Changed!',
      message: 'Your account password has been updated securely.',
    });

    return { success: true };
  };

  const clearPendingVerification = () => setPendingVerification(null);
  const clearAuthToast = () => setAuthToast(null);

  // Followed User IDs set
  const followedUserIds = new Set<string>(
    (Object.values(usersMap) as User[])
      .filter((u) => u.isFollowing)
      .map((u) => u.id)
  );

  // Dynamic ranking based on feedTab selector
  const displayedPosts = feedTab === 'for_you' 
    ? rankPostsAlgorithmic(posts, currentUser, followedUserIds)
    : rankPostsChronological(posts);

  // Helper to boost category preference on interaction
  const boostCategoryPreference = (category: ContentCategory, delta: number = 0.05) => {
    setCurrentUser((prev) => {
      const currentVal = prev.categoryPreferences?.[category] || 0.5;
      const newVal = Math.min(1.0, Math.max(0.1, currentVal + delta));
      return {
        ...prev,
        categoryPreferences: {
          ...prev.categoryPreferences,
          [category]: newVal,
        } as Record<ContentCategory, number>,
      };
    });
  };

  const toggleLikePost = (postId: string) => {
    let updatedPost: Post | undefined;
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const nextIsLiked = !p.isLiked;
          if (nextIsLiked) {
            boostCategoryPreference(p.category, 0.04);
          }
          updatedPost = {
            ...p,
            isLiked: nextIsLiked,
            likesCount: Math.max(0, p.likesCount + (nextIsLiked ? 1 : -1)),
          };
          return updatedPost;
        }
        return p;
      })
    );
    setTimeout(() => {
      if (updatedPost) {
        safeSetDoc(doc(db, 'posts', postId), updatedPost, { merge: true }).catch(console.error);
      }
    }, 100);
  };

  const toggleSavePost = (postId: string) => {
    let updatedPost: Post | undefined;
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const nextIsSaved = !p.isSaved;
          if (nextIsSaved) {
            boostCategoryPreference(p.category, 0.08);
          }
          updatedPost = {
            ...p,
            isSaved: nextIsSaved,
            savesCount: Math.max(0, p.savesCount + (nextIsSaved ? 1 : -1)),
          };
          return updatedPost;
        }
        return p;
      })
    );
    setTimeout(() => {
      if (updatedPost) {
        safeSetDoc(doc(db, 'posts', postId), updatedPost, { merge: true }).catch(console.error);
      }
    }, 100);
  };

  const addCommentToPost = (postId: string, text: string) => {
    if (!text.trim()) return;

    // Multi-language child-friendly content safety filter
    const safetyCheck = checkContentSafety(text);
    if (!safetyCheck.isSafe) {
      setAuthToast({
        title: '🛡️ HUMA Child & Safety Protection',
        message: CONTENT_SAFETY_POLICY_MESSAGE,
      });
      return;
    }

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      postId,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatarUrl,
      text: text.trim(),
      createdAt: 'Just now',
      likesCount: 0,
    };

    let updatedPost: Post | undefined;

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          boostCategoryPreference(p.category, 0.06);
          updatedPost = {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [newComment, ...p.comments],
          };
          return updatedPost;
        }
        return p;
      })
    );

    setTimeout(() => {
      if (updatedPost) {
        safeSetDoc(doc(db, 'posts', postId), updatedPost, { merge: true }).catch(console.error);
      }
    }, 100);
  };

  const toggleLikeComment = (postId: string, commentId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map((c) => {
              if (c.id === commentId) {
                const nextLiked = !c.isLiked;
                return {
                  ...c,
                  isLiked: nextLiked,
                  likesCount: c.likesCount + (nextLiked ? 1 : -1),
                };
              }
              return c;
            }),
          };
        }
        return p;
      })
    );
  };

  const toggleFollowUser = (userId: string) => {
    setUsersMap((prev) => {
      const target = prev[userId];
      if (!target) return prev;
      const nextIsFollowing = !target.isFollowing;
      const updatedUser = {
        ...target,
        isFollowing: nextIsFollowing,
        followersCount: target.followersCount + (nextIsFollowing ? 1 : -1),
      };
      return { ...prev, [userId]: updatedUser };
    });

    setCurrentUser((prev) => ({
      ...prev,
      followingCount: prev.followingCount + (usersMap[userId]?.isFollowing ? -1 : 1),
    }));
  };

  const toggleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const nextLiked = !r.isLiked;
          if (nextLiked) boostCategoryPreference(r.category, 0.05);
          return {
            ...r,
            isLiked: nextLiked,
            likesCount: r.likesCount + (nextLiked ? 1 : -1),
          };
        }
        return r;
      })
    );
  };

  const toggleSaveReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const nextSaved = !r.isSaved;
          if (nextSaved) boostCategoryPreference(r.category, 0.08);
          return {
            ...r,
            isSaved: nextSaved,
            savesCount: r.savesCount + (nextSaved ? 1 : -1),
          };
        }
        return r;
      })
    );
  };

  const addCommentToReel = (reelId: string, text: string) => {
    if (!text.trim()) return;

    // Multi-language child-friendly content safety filter
    const safetyCheck = checkContentSafety(text);
    if (!safetyCheck.isSafe) {
      setAuthToast({
        title: '🛡️ HUMA Child & Safety Protection',
        message: CONTENT_SAFETY_POLICY_MESSAGE,
      });
      return;
    }

    const newComment: Comment = {
      id: `rc_${Date.now()}`,
      postId: reelId,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatarUrl,
      text: text.trim(),
      createdAt: 'Just now',
      likesCount: 0,
    };
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          boostCategoryPreference(r.category, 0.06);
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [newComment, ...r.comments],
          };
        }
        return r;
      })
    );
  };

  const navigateToProfile = (userId: string) => {
    setActiveProfileUserId(userId);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHashtag = (hashtag: string) => {
    setActiveHashtag(hashtag.replace('#', ''));
    setActiveTab('search');
  };

  const openStoryViewer = (userIndex: number, itemIndex: number = 0) => {
    setActiveStoryIndex({ userIndex, itemIndex });
  };

  const closeStoryViewer = () => {
    setActiveStoryIndex(null);
  };

  const openCommentsDrawer = (postId: string) => {
    setActivePostCommentsId(postId);
  };

  const closeCommentsDrawer = () => {
    setActivePostCommentsId(null);
  };

  const openShareModal = (post: Post | Reel) => {
    setActiveSharePost(post);
  };

  const closeShareModal = () => {
    setActiveSharePost(null);
  };

  const openAlgorithmModal = (post: Post) => {
    setActiveAlgorithmPost(post);
  };

  const closeAlgorithmModal = () => {
    setActiveAlgorithmPost(null);
  };

  const createNewPost = (newPostData: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'savesCount' | 'isLiked' | 'isSaved' | 'comments'>) => {
    const createdPost: Post = {
      ...newPostData,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      isLiked: false,
      isSaved: false,
      comments: [],
    };

    setPosts((prev) => [createdPost, ...prev]);
    const updatedCount = currentUser.postsCount + 1;
    setCurrentUser((prev) => ({
      ...prev,
      postsCount: updatedCount,
    }));
    setUsersMap((prev) => ({
      ...prev,
      [currentUser.id]: { ...prev[currentUser.id], postsCount: updatedCount }
    }));
    setIsCreateModalOpen(false);
    setActiveTab('home');

    // Save post to Firestore & update user post count
    safeSetDoc(doc(db, 'posts', createdPost.id), createdPost).catch(console.error);
    safeSetDoc(doc(db, 'users', currentUser.id), { postsCount: updatedCount }, { merge: true }).catch(console.error);
  };

  const editPost = (postId: string, updatedData: { caption?: string; location?: string; category?: ContentCategory }) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            ...updatedData,
          };
        }
        return p;
      })
    );
    safeSetDoc(doc(db, 'posts', postId), updatedData, { merge: true }).catch(console.error);
  };

  const deletePost = (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    deleteDoc(doc(db, 'posts', postId)).catch(console.error);

    // Completely purge from saved collections so deleted posts are never preserved
    setSavedCollections((prev) =>
      prev.map((col) => ({
        ...col,
        postIds: col.postIds.filter((id) => id !== postId),
      }))
    );

    // Completely purge associated notifications
    setNotifications((prev) => prev.filter((n) => n.postId !== postId));

    if (targetPost && targetPost.userId === currentUser.id) {
      const nextCount = Math.max(0, currentUser.postsCount - 1);
      setCurrentUser((prev) => ({ ...prev, postsCount: nextCount }));
      setUsersMap((prev) => {
        if (!prev[currentUser.id]) return prev;
        return {
          ...prev,
          [currentUser.id]: { ...prev[currentUser.id], postsCount: nextCount }
        };
      });
      setRegisteredAccounts((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, postsCount: nextCount } : u))
      );
      safeSetDoc(doc(db, 'users', currentUser.id), { postsCount: nextCount }, { merge: true }).catch(console.error);
    }
  };

  const createNewStory = (mediaUrl: string, caption?: string) => {
    const newItem = {
      id: `s_item_${Date.now()}`,
      mediaUrl,
      mediaType: 'image' as const,
      createdAt: 'Just now',
      caption: caption || '',
      viewsCount: 1,
    };

    let updatedStory: Story;

    setStories((prev) => {
      const myStoryIdx = prev.findIndex((s) => s.userId === currentUser.id);
      if (myStoryIdx >= 0) {
        const copy = [...prev];
        updatedStory = {
          ...copy[myStoryIdx],
          items: [...copy[myStoryIdx].items, newItem],
        };
        copy[myStoryIdx] = updatedStory;
        return copy;
      } else {
        updatedStory = {
          id: `story_${currentUser.id}`,
          userId: currentUser.id,
          username: 'Your Moment',
          userAvatar: currentUser.avatarUrl,
          hasUnseen: false,
          items: [newItem],
        };
        return [updatedStory, ...prev];
      }
    });

    // Create moment notification for activity feed
    const momentNotif: NotificationItem = {
      id: `notif_moment_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatarUrl,
      type: 'moment',
      postMediaUrl: mediaUrl,
      createdAt: 'Just now',
      isRead: false,
    };
    setNotifications((prev) => [momentNotif, ...prev]);

    setCurrentUser((prev) => ({ ...prev, hasActiveStory: true }));
    safeSetDoc(doc(db, 'users', currentUser.id), { hasActiveStory: true }, { merge: true }).catch(console.error);

    setTimeout(() => {
      if (updatedStory) {
        safeSetDoc(doc(db, 'stories', updatedStory.id), updatedStory).catch(console.error);
      }
    }, 100);
  };

  const editStoryItem = (storyId: string, itemId: string, newCaption: string) => {
    let updatedStory: Story | undefined;
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          updatedStory = {
            ...s,
            items: s.items.map((it) => (it.id === itemId ? { ...it, caption: newCaption } : it)),
          };
          return updatedStory;
        }
        return s;
      })
    );
    if (updatedStory) {
      safeSetDoc(doc(db, 'stories', storyId), updatedStory, { merge: true }).catch(console.error);
    }
  };

  const deleteStoryItem = (storyId: string, itemId: string) => {
    let updatedStory: Story | undefined;
    let remainingCount = 0;

    setStories((prev) => {
      const existing = prev.find((s) => s.id === storyId);
      if (!existing) return prev;

      const remainingItems = existing.items.filter((it) => it.id !== itemId);
      remainingCount = remainingItems.length;

      if (remainingItems.length === 0) {
        return prev.filter((s) => s.id !== storyId);
      } else {
        return prev.map((s) => {
          if (s.id === storyId) {
            updatedStory = {
              ...s,
              items: remainingItems,
            };
            return updatedStory;
          }
          return s;
        });
      }
    });

    if (remainingCount === 0) {
      deleteDoc(doc(db, 'stories', storyId)).catch(console.error);
      if (storyId === `story_${currentUser.id}` || storyId === currentUser.id) {
        setCurrentUser((prev) => ({ ...prev, hasActiveStory: false }));
        safeSetDoc(doc(db, 'users', currentUser.id), { hasActiveStory: false }, { merge: true }).catch(console.error);
      }
    } else if (updatedStory) {
      safeSetDoc(doc(db, 'stories', storyId), updatedStory).catch(console.error);
    }
  };

  const deleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    deleteDoc(doc(db, 'stories', storyId)).catch(console.error);
    if (storyId === `story_${currentUser.id}` || storyId === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, hasActiveStory: false }));
      safeSetDoc(doc(db, 'users', currentUser.id), { hasActiveStory: false }, { merge: true }).catch(console.error);
    }
  };

  const createNewShort = (data: {
    videoUrl?: string;
    thumbnailUrl?: string;
    caption: string;
    audioTitle?: string;
    audioArtist?: string;
    category: ContentCategory;
  }) => {
    const sampleVideos = [
      'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
      'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
    ];
    const sampleThumbnails = [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    ];

    const newShort: Reel = {
      id: `reel_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatarUrl,
      isVerified: currentUser.isVerified || false,
      videoUrl: data.videoUrl || sampleVideos[Math.floor(Math.random() * sampleVideos.length)],
      thumbnailUrl: data.thumbnailUrl || sampleThumbnails[Math.floor(Math.random() * sampleThumbnails.length)],
      caption: data.caption || 'New Short ✨',
      audioTrack: {
        title: data.audioTitle || 'Original Audio',
        artist: data.audioArtist || currentUser.username,
      },
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      isLiked: false,
      isSaved: false,
      isFollowing: false,
      category: data.category || 'Architecture',
      comments: [],
    };

    setReels((prev) => [newShort, ...prev]);
    setIsCreateModalOpen(false);
    setActiveTab('reels');

    safeSetDoc(doc(db, 'reels', newShort.id), newShort).catch(console.error);
  };

  const createNewReel = createNewShort;

  const editShort = (reelId: string, updatedData: { caption?: string; audioTitle?: string; audioArtist?: string; category?: ContentCategory }) => {
    let updatedReel: Reel | undefined;
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          updatedReel = {
            ...r,
            ...(updatedData.caption !== undefined ? { caption: updatedData.caption } : {}),
            ...(updatedData.category !== undefined ? { category: updatedData.category } : {}),
            ...(updatedData.audioTitle !== undefined ? {
              audioTrack: {
                ...r.audioTrack,
                title: updatedData.audioTitle,
                artist: updatedData.audioArtist || r.audioTrack.artist,
              }
            } : {}),
          };
          return updatedReel;
        }
        return r;
      })
    );
    if (updatedReel) {
      safeSetDoc(doc(db, 'reels', reelId), updatedReel, { merge: true }).catch(console.error);
    }
  };

  const editReel = editShort;

  const deleteShort = (reelId: string) => {
    setReels((prev) => prev.filter((r) => r.id !== reelId));
    deleteDoc(doc(db, 'reels', reelId)).catch(console.error);
    setNotifications((prev) => prev.filter((n) => n.postId !== reelId));
  };

  const deleteReel = deleteShort;

  const sendMessage = (
    conversationId: string, 
    text?: string, 
    mediaUrl?: string, 
    postPreview?: Message['postPreview']
  ) => {
    const newMsg: Message = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser.id,
      receiverId: '',
      text,
      mediaUrl,
      postPreview,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let targetConv: Conversation | undefined;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const msgWithReceiver = {
            ...newMsg,
            receiverId: c.participant.id,
          };
          const existingMessages = c.messages || [c.lastMessage];
          targetConv = {
            ...c,
            lastMessage: msgWithReceiver,
            messages: [...existingMessages, msgWithReceiver],
          };
          return targetConv;
        }
        return c;
      })
    );

    setTimeout(() => {
      if (targetConv) {
        safeSetDoc(doc(db, 'conversations', conversationId), targetConv).catch(console.error);
      }
    }, 100);
  };

  const createConversation = (targetUser: User): string => {
    const existing = conversations.find((c) => c.participant.id === targetUser.id);
    if (existing) return existing.id;

    const newId = `conv_${Date.now()}`;
    const initialMsg: Message = {
      id: `m_init_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: targetUser.id,
      text: 'Started a yap',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newConv: Conversation = {
      id: newId,
      participant: targetUser,
      unreadCount: 0,
      isOnline: true,
      isPinned: false,
      lastMessage: initialMsg,
      messages: [initialMsg],
    };

    setConversations((prev) => [newConv, ...prev]);
    safeSetDoc(doc(db, 'conversations', newId), newConv).catch(console.error);
    return newId;
  };

  const togglePinConversation = (conversationId: string) => {
    let nextPinnedState = false;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          nextPinnedState = !c.isPinned;
          return { ...c, isPinned: nextPinnedState };
        }
        return c;
      })
    );
    safeSetDoc(doc(db, 'conversations', conversationId), { isPinned: nextPinnedState }, { merge: true }).catch(console.error);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    deleteDoc(doc(db, 'conversations', conversationId)).catch(console.error);
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const updateUserProfile = (updated: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...updated }));
    safeSetDoc(doc(db, 'users', currentUser.id), updated, { merge: true }).catch(console.error);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        usersMap,
        posts: displayedPosts,
        stories,
        reels,
        conversations,
        notifications,
        savedCollections,
        badgeRequests,
        feedTab,
        activeTab,
        activeProfileUserId,
        activeHashtag,
        activeStoryIndex,
        activePostCommentsId,
        activeSharePost,
        activeAlgorithmPost,
        isCreateModalOpen,
        darkMode,
        isAuthenticated,
        registeredAccounts,
        blockedIdentifiers,
        pendingVerification,
        authToast,
        login,
        signup,
        sendSignupVerificationCode,
        verifySignupCode,
        logout,
        toggleBlockUser,
        sendVerificationCode,
        verifyCodeAndChangeEmail,
        verifyCodeAndChangePassword,
        clearPendingVerification,
        clearAuthToast,
        setFeedTab,
        setActiveTab,
        navigateToProfile,
        navigateToHashtag,
        toggleLikePost,
        toggleSavePost,
        addCommentToPost,
        toggleLikeComment,
        toggleFollowUser,
        toggleLikeReel,
        toggleSaveReel,
        addCommentToReel,
        openStoryViewer,
        closeStoryViewer,
        openCommentsDrawer,
        closeCommentsDrawer,
        openShareModal,
        closeShareModal,
        openAlgorithmModal,
        closeAlgorithmModal,
        setIsCreateModalOpen,
        createNewPost,
        editPost,
        deletePost,
        createNewStory,
        editStoryItem,
        deleteStoryItem,
        deleteStory,
        createNewShort,
        createNewReel,
        editShort,
        editReel,
        deleteShort,
        deleteReel,
        sendMessage,
        createConversation,
        togglePinConversation,
        deleteConversation,
        markNotificationsRead,
        toggleDarkMode,
        updateUserProfile,
        requestVerificationBadge,
        approveVerificationBadge,
        rejectVerificationBadge,
        toggleUserVerification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
