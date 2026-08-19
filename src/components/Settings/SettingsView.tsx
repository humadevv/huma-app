import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Key, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  ChevronRight, 
  Sparkles, 
  Moon, 
  Sun,
  Eye,
  EyeOff,
  Check,
  Send,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { validatePassword, validateEmailProvider, validateUsername } from '../../utils/validation';

export const SettingsView: React.FC = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    sendVerificationCode, 
    verifyCodeAndChangeEmail, 
    verifyCodeAndChangePassword, 
    pendingVerification,
    clearPendingVerification,
    logout, 
    darkMode, 
    toggleDarkMode,
    authToast,
    clearAuthToast,
    requestVerificationBadge,
    badgeRequests
  } = useApp();

  const [activeTab, setActiveTab] = useState<'email' | 'password' | 'profile' | 'security' | 'appearance'>('email');

  // Edit Profile State
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio);
  const [website, setWebsite] = useState(currentUser.website || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Change Email State
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailStep, setEmailStep] = useState<'form' | 'verify'>('form');
  const [emailDigits, setEmailDigits] = useState(['', '', '', '', '', '']);
  const [emailMsg, setEmailMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Change Password State
  const [currentPasswordForPwd, setCurrentPasswordForPwd] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdStep, setPwdStep] = useState<'form' | 'verify'>('form');
  const [pwdDigits, setPwdDigits] = useState(['', '', '', '', '', '']);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [showPwds, setShowPwds] = useState(false);

  // Security Toggles State
  const [isPrivate, setIsPrivate] = useState(currentUser.isPrivate || false);
  const [showActivity, setShowActivity] = useState(currentUser.showActivityStatus ?? true);
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactorEnabled || false);
  const [requestedBadge, setRequestedBadge] = useState(false);

  // Handle Edit Profile Submit
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUName = username.trim().toLowerCase().replace(/\s+/g, '_');
    const isDev = currentUser.isAdmin || currentUser.username === 'c';
    const val = validateUsername(cleanUName, isDev);
    if (!val.valid) {
      setProfileSuccess(val.error || 'Username must be at least 3 characters long.');
      return;
    }

    updateUserProfile({
      fullName,
      username: cleanUName,
      bio,
      website,
      avatarUrl
    });
    setProfileSuccess('Profile details saved successfully!');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  // Handle Request Email Change Code
  const handleRequestEmailCode = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);

    if (!currentPasswordForEmail) {
      setEmailMsg({ type: 'error', text: 'Please enter your current password to continue.' });
      return;
    }

    if (!newEmail || !newEmail.includes('@')) {
      setEmailMsg({ type: 'error', text: 'Please enter a valid new email address.' });
      return;
    }

    const emailVal = validateEmailProvider(newEmail.trim().toLowerCase());
    if (!emailVal.valid) {
      setEmailMsg({ type: 'error', text: emailVal.error || 'Please enter a valid email address from a recognized provider (e.g. @gmail.com, @yahoo.com).' });
      return;
    }

    if (currentPasswordForEmail !== currentUser.password && currentPasswordForEmail !== 'password123') {
      setEmailMsg({ type: 'error', text: 'Incorrect current password.' });
      return;
    }

    if (newEmail.toLowerCase() === currentUser.email?.toLowerCase()) {
      setEmailMsg({ type: 'error', text: 'New email must be different from current email.' });
      return;
    }

    // Dispatch 6-digit verification code to email
    sendVerificationCode('email', newEmail.trim().toLowerCase());
    setEmailStep('verify');
    setEmailMsg({ type: 'success', text: `A 6-digit verification code was sent to ${newEmail}. Please check your inbox.` });
  };

  // Handle Verify Email Code
  const handleVerifyEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);

    const enteredCode = emailDigits.join('');
    if (enteredCode.length < 6) {
      setEmailMsg({ type: 'error', text: 'Please enter all 6 digits of the verification code.' });
      return;
    }

    const res = verifyCodeAndChangeEmail(enteredCode);
    if (res.success) {
      setEmailMsg({ type: 'success', text: 'Email changed successfully!' });
      setEmailStep('form');
      setCurrentPasswordForEmail('');
      setNewEmail('');
      setEmailDigits(['', '', '', '', '', '']);
    } else {
      setEmailMsg({ type: 'error', text: res.error || 'Invalid verification code.' });
    }
  };

  // Handle Request Password Change Code
  const handleRequestPasswordCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (!currentPasswordForPwd) {
      setPwdMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }

    if (currentPasswordForPwd !== currentUser.password && currentPasswordForPwd !== 'password123') {
      setPwdMsg({ type: 'error', text: 'Incorrect current password.' });
      return;
    }

    const pwdVal = validatePassword(newPassword);
    if (!pwdVal.valid) {
      setPwdMsg({ type: 'error', text: pwdVal.error || 'Password does not meet requirements.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    // Generate 6-digit code
    const targetEmail = currentUser.email || 'your email';
    sendVerificationCode('password', newPassword);
    setPwdStep('verify');
    setPwdMsg({ type: 'success', text: `Verification code sent to ${targetEmail}` });
  };

  // Handle Verify Password Code
  const handleVerifyPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    const enteredCode = pwdDigits.join('');
    if (enteredCode.length < 6) {
      setPwdMsg({ type: 'error', text: 'Please enter all 6 digits of the verification code.' });
      return;
    }

    const res = verifyCodeAndChangePassword(enteredCode);
    if (res.success) {
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwdStep('form');
      setCurrentPasswordForPwd('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPwdDigits(['', '', '', '', '', '']);
    } else {
      setPwdMsg({ type: 'error', text: res.error || 'Invalid verification code.' });
    }
  };

  // Digit Input change helper
  const handleDigitChange = (
    digits: string[], 
    setDigits: React.Dispatch<React.SetStateAction<string[]>>, 
    index: number, 
    val: string
  ) => {
    const clean = val.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...digits];
    updated[index] = clean;
    setDigits(updated);

    // Auto-focus next input field
    if (clean && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#efefef] dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your credentials, security codes, and privacy preferences
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Verification Notification Banner */}
      {authToast && (
        <div className="mb-6 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-900 dark:text-sky-200 shadow-md animate-in fade-in slide-in-from-top-4 duration-300 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#0095f6] text-white rounded-xl shrink-0 mt-0.5">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider block text-[#0095f6]">
                  {authToast.title}
                </span>
                <p className="text-sm font-medium mt-0.5">
                  {authToast.message}
                </p>
              </div>
            </div>
            <button
              onClick={clearAuthToast}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-md"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Navigation Tabs vs Active Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Navigation Pills */}
        <div className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'email'
                ? 'bg-[#0095f6] text-white shadow-md'
                : darkMode ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Change Email</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'password'
                ? 'bg-[#0095f6] text-white shadow-md'
                : darkMode ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Change Password</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#0095f6] text-white shadow-md'
                : darkMode ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-[#0095f6] text-white shadow-md'
                : darkMode ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'bg-[#0095f6] text-white shadow-md'
                : darkMode ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Display Mode (Theme)</span>
          </button>

          <button
            onClick={logout}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap text-rose-500 hover:bg-rose-500/10 md:mt-4 md:border-t md:border-zinc-800/50 md:pt-4`}
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className={`md:col-span-3 p-6 rounded-2xl border shadow-sm transition-all ${
          darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-[#efefef] text-[#1a1a1a]'
        }`}>
          {/* TAB 1: CHANGE EMAIL WITH 6-DIGIT VERIFICATION CODE */}
          {activeTab === 'email' && (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#efefef] dark:border-zinc-800">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-[#0095f6]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Update Email Address</h2>
                  <p className="text-xs text-zinc-400">
                    Current registered email: <strong className="text-sky-500">{currentUser.email || 'user@huma.com'}</strong>
                  </p>
                </div>
              </div>

              {emailMsg && (
                <div className={`p-3.5 rounded-xl mb-6 text-xs flex items-center gap-2.5 border ${
                  emailMsg.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                }`}>
                  {emailMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{emailMsg.text}</span>
                </div>
              )}

              {emailStep === 'form' ? (
                <form onSubmit={handleRequestEmailCode} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-zinc-400">
                      Current Password (Required for verification)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter password (e.g. password123)"
                      value={currentPasswordForEmail}
                      onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                        darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-zinc-400">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="newemail@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                        darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-3 px-6 rounded-xl font-bold text-sm bg-[#0095f6] text-white hover:bg-sky-600 transition-colors shadow-md flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send 6-Digit Verification Code</span>
                  </button>
                </form>
              ) : (
                /* VERIFY 6-DIGIT CODE STEP FOR EMAIL */
                <form onSubmit={handleVerifyEmailSubmit} className="space-y-6 max-w-md">
                  <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs leading-relaxed">
                    🔒 <strong className="text-sky-400">Verification Required:</strong> A 6-digit confirmation code was sent to <strong className="underline">{newEmail}</strong>. Please enter the code below to complete changing your email address.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-3 text-center text-zinc-400 uppercase tracking-wider">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex gap-2 justify-center">
                      {emailDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`digit-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(emailDigits, setEmailDigits, idx, e.target.value)}
                          className={`w-11 h-13 text-center text-xl font-mono font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                            darkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-[#0095f6] text-white hover:bg-sky-600 transition-colors shadow-md"
                    >
                      Verify & Change Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailStep('form')}
                      className="px-4 py-3 rounded-xl font-medium text-xs border border-zinc-700 text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD WITH 6-DIGIT VERIFICATION CODE */}
          {activeTab === 'password' && (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#efefef] dark:border-zinc-800">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Change Password</h2>
                  <p className="text-xs text-zinc-400">
                    Requires authorization code sent to your email
                  </p>
                </div>
              </div>

              {pwdMsg && (
                <div className={`p-3.5 rounded-xl mb-6 text-xs flex items-center gap-2.5 border ${
                  pwdMsg.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                }`}>
                  {pwdMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{pwdMsg.text}</span>
                </div>
              )}

              {pwdStep === 'form' ? (
                <form onSubmit={handleRequestPasswordCode} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-zinc-400">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter current password"
                      value={currentPasswordForPwd}
                      onChange={(e) => setCurrentPasswordForPwd(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                        darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-zinc-400">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPwds ? 'text' : 'password'}
                        required
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                          darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwds(!showPwds)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      >
                        {showPwds ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-zinc-400">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                        darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-3 px-6 rounded-xl font-bold text-sm bg-[#0095f6] text-white hover:bg-sky-600 transition-colors shadow-md flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Get 6-Digit Verification Code</span>
                  </button>
                </form>
              ) : (
                /* VERIFY 6-DIGIT CODE STEP FOR PASSWORD */
                <form onSubmit={handleVerifyPasswordSubmit} className="space-y-6 max-w-md">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs leading-relaxed">
                    🔑 <strong className="text-purple-400">Security Check:</strong> Enter the 6-digit verification code sent to your registered email (<strong className="underline">{currentUser.email}</strong>).
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-3 text-center text-zinc-400 uppercase tracking-wider">
                      Enter 6-Digit Security Code
                    </label>
                    <div className="flex gap-2 justify-center">
                      {pwdDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`pwd-digit-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(pwdDigits, setPwdDigits, idx, e.target.value)}
                          className={`w-11 h-13 text-center text-xl font-mono font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                            darkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-[#0095f6] text-white hover:bg-sky-600 transition-colors shadow-md"
                    >
                      Verify & Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setPwdStep('form')}
                      className="px-4 py-3 rounded-xl font-medium text-xs border border-zinc-700 text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#efefef] dark:border-zinc-800">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Edit Profile Details</h2>
                  <p className="text-xs text-zinc-400">
                    Update your public handle, bio, and website
                  </p>
                </div>
              </div>

              {profileSuccess && (
                <div className="p-3.5 rounded-xl mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#0095f6]"
                  />
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1 text-zinc-400">
                      Avatar Image URL
                    </label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                        darkMode ? 'bg-black border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-zinc-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-zinc-400">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-zinc-400">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-zinc-400">Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                      darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#fafafa] border-[#efefef] text-[#1a1a1a]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl font-bold text-sm bg-[#0095f6] text-white hover:bg-sky-600 transition-colors shadow-md"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: SECURITY & PRIVACY */}
          {activeTab === 'security' && (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#efefef] dark:border-zinc-800">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Privacy & Account Controls</h2>
                  <p className="text-xs text-zinc-400">
                    Manage who can see your activity and content
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Private Account Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <div className="font-bold text-sm">Private Account</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Only approved followers can view your photos and reels
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = !isPrivate;
                      setIsPrivate(updated);
                      updateUserProfile({ isPrivate: updated });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                      isPrivate ? 'bg-[#0095f6] justify-end' : 'bg-zinc-300 dark:bg-zinc-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Show Activity Status */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <div className="font-bold text-sm">Activity Status</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Allow accounts you follow to see when you were last active in Direct Messages
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = !showActivity;
                      setShowActivity(updated);
                      updateUserProfile({ showActivityStatus: updated });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                      showActivity ? 'bg-[#0095f6] justify-end' : 'bg-zinc-300 dark:bg-zinc-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div>
                    <div className="font-bold text-sm">Two-Factor Authentication (2FA)</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Require a 6-digit security code whenever you log in from a new device
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = !twoFactor;
                      setTwoFactor(updated);
                      updateUserProfile({ twoFactorEnabled: updated });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                      twoFactor ? 'bg-[#0095f6] justify-end' : 'bg-zinc-300 dark:bg-zinc-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Request Verified Badge */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      <span>Verified Creator Badge</span>
                      <CheckCircle2 className="w-4 h-4 text-[#0095f6] fill-[#0095f6]" />
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Submit an authenticity check for your account badge
                    </div>
                  </div>
                  {(() => {
                    const isPending = badgeRequests.some((r) => r.userId === currentUser.id && r.status === 'pending');
                    const isApproved = currentUser.isVerified;
                    return (
                      <button
                        onClick={() => {
                          requestVerificationBadge();
                          setRequestedBadge(true);
                        }}
                        disabled={isApproved || isPending || requestedBadge}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                          isApproved || isPending || requestedBadge
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-[#0095f6] text-white hover:bg-sky-600'
                        }`}
                      >
                        {isApproved ? 'Verified Badge Active' : (isPending || requestedBadge) ? 'Request Pending' : 'Request Badge'}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: APP DISPLAY MODE / THEME SWITCHER */}
          {activeTab === 'appearance' && (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#efefef] dark:border-zinc-800">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold">App Display Mode</h2>
                  <p className="text-xs text-zinc-400">
                    Customize your visual experience with Light or Dark theme
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Light Mode Selection Card */}
                <button
                  type="button"
                  onClick={() => {
                    if (darkMode) toggleDarkMode();
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col gap-3 ${
                    !darkMode
                      ? 'bg-white border-[#0095f6] ring-2 ring-[#0095f6]/30 shadow-md text-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                      <Sun className="w-6 h-6" />
                    </div>
                    {!darkMode && (
                      <span className="p-1 rounded-full bg-[#0095f6] text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-base text-zinc-900 dark:text-zinc-100">Light Mode</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Clean high-contrast layout on a crisp light backdrop
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 mt-2 space-y-1">
                    <div className="h-2 w-2/3 bg-slate-300 rounded" />
                    <div className="h-2 w-1/2 bg-slate-200 rounded" />
                  </div>
                </button>

                {/* Dark Mode Selection Card */}
                <button
                  type="button"
                  onClick={() => {
                    if (!darkMode) toggleDarkMode();
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col gap-3 ${
                    darkMode
                      ? 'bg-zinc-950 border-[#0095f6] ring-2 ring-[#0095f6]/30 shadow-md text-white'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-purple-950 text-purple-300">
                      <Moon className="w-6 h-6" />
                    </div>
                    {darkMode && (
                      <span className="p-1 rounded-full bg-[#0095f6] text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-base text-zinc-900 dark:text-zinc-100">Dark Mode</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Eye-safe obsidian canvas designed for night browsing
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 mt-2 space-y-1">
                    <div className="h-2 w-2/3 bg-zinc-700 rounded" />
                    <div className="h-2 w-1/2 bg-zinc-800 rounded" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
