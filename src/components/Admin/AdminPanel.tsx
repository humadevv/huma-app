import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  LogOut, 
  UserCheck, 
  UserX, 
  Search, 
  Users, 
  BadgeCheck, 
  Clock, 
  AlertCircle,
  Sparkles,
  Info,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Ban
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, VerificationBadgeRequest } from '../../types';

export const AdminPanel: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    darkMode, 
    badgeRequests, 
    approveVerificationBadge, 
    rejectVerificationBadge, 
    toggleUserVerification,
    toggleBlockUser,
    registeredAccounts,
    usersMap
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3000);
  };

  const allUsersList = registeredAccounts.filter((u) => u.username !== 'c');
  const filteredUsers = allUsersList.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phoneNumber && u.phoneNumber.includes(searchQuery))
  );

  const pendingRequests = badgeRequests.filter((r) => r.status === 'pending');
  const processedRequests = badgeRequests.filter((r) => r.status !== 'pending');
  const verifiedUsersCount = allUsersList.filter((u) => u.isVerified).length;

  return (
    <div className={`min-h-screen w-full transition-colors ${
      darkMode ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-zinc-900'
    }`}>
      {/* Top Admin Header */}
      <header className={`sticky top-0 z-30 border-b px-6 py-4 flex items-center justify-between shadow-sm backdrop-blur-md ${
        darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">HUMA Dev Control Panel</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Dev Control @c
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verification Badge Management & User Authority System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-xs">
            <img
              src={currentUser.avatarUrl}
              alt="Admin"
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="font-semibold text-zinc-300">@{currentUser.username}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Admin</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Anti-AI Clarification Notice Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center gap-3 shadow-sm">
          <Info className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-xs leading-relaxed">
            <strong className="font-bold">System Transparency Statement:</strong> This application does not use AI for anything. All feeds, posts, search filters, and verification workflows run strictly on standard deterministic code.
          </div>
        </div>

        {/* Action Confirmation Toast */}
        {adminToast && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{adminToast}</span>
          </div>
        )}

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className={`p-5 rounded-2xl border shadow-xs ${
            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Requests</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-500">{pendingRequests.length}</div>
            <p className="text-[11px] text-zinc-400 mt-1">Awaiting admin decision</p>
          </div>

          <div className={`p-5 rounded-2xl border shadow-xs ${
            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Badges</span>
              <BadgeCheck className="w-4 h-4 text-[#0095f6]" />
            </div>
            <div className="text-3xl font-extrabold text-[#0095f6]">{verifiedUsersCount}</div>
            <p className="text-[11px] text-zinc-400 mt-1">Active verified creators</p>
          </div>

          <div className={`p-5 rounded-2xl border shadow-xs ${
            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Registered Users</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-3xl font-extrabold">{allUsersList.length}</div>
            <p className="text-[11px] text-zinc-400 mt-1">User directory records</p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 font-bold text-sm transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'requests'
                ? 'border-[#0095f6] text-[#0095f6]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BadgeCheck className="w-4 h-4" />
            <span>Verification Requests Queue</span>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-black font-extrabold">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 font-bold text-sm transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'users'
                ? 'border-[#0095f6] text-[#0095f6]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Verification Directory</span>
          </button>
        </div>

        {/* TAB 1: VERIFICATION REQUESTS QUEUE */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>Pending Badge Verification Requests</span>
              <span className="text-xs text-zinc-400 font-normal">({pendingRequests.length} pending)</span>
            </h2>

            {pendingRequests.length === 0 ? (
              <div className={`p-8 rounded-2xl border text-center ${
                darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200'
              }`}>
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-bold text-sm">No Pending Verification Requests</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  All submitted requests have been reviewed and processed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={req.avatarUrl}
                        alt={req.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#0095f6]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm">
                          <span>{req.fullName}</span>
                          <span className="text-xs text-zinc-400 font-normal">(@{req.username})</span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Requested on {new Date(req.requestedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          approveVerificationBadge(req.id, req.userId);
                          showToast(`Approved verification badge tick for @${req.username}!`);
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0095f6] text-white text-xs font-bold hover:bg-sky-600 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Badge</span>
                      </button>

                      <button
                        onClick={() => {
                          rejectVerificationBadge(req.id);
                          showToast(`Rejected verification request for @${req.username}.`);
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 text-rose-400 text-xs font-bold hover:bg-rose-500/10 transition-colors border border-zinc-700"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Processed Requests History */}
            {processedRequests.length > 0 && (
              <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                  Past Verification Decisions ({processedRequests.length})
                </h3>
                <div className="space-y-3">
                  {processedRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                        darkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={req.avatarUrl}
                          alt={req.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-bold">@{req.username}</span>
                          <span className="text-zinc-400 ml-2">({req.fullName})</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USER DIRECTORY & DIRECT TOGGLE */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search user by name, username, email, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0095f6] ${
                  darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-zinc-900'
                }`}
              />
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                    user.isBlocked
                      ? 'bg-rose-500/5 border-rose-500/30'
                      : darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative">
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      {user.isVerified && (
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#0095f6] text-white ring-2 ring-black">
                          <CheckCircle2 className="w-4 h-4 fill-white text-[#0095f6]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <span>{user.fullName}</span>
                        <span className="text-xs text-zinc-400 font-medium">@{user.username}</span>
                        {user.isBlocked && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-500/20 text-rose-500 border border-rose-500/30">
                            BLOCKED
                          </span>
                        )}
                      </div>

                      {/* Credentials Section for Admin */}
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                          <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="text-zinc-400">Email:</span>
                          <span className="font-mono text-zinc-200">{user.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-zinc-400">Phone:</span>
                          <span className="font-mono text-zinc-200">{user.phoneNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-zinc-400">Password:</span>
                          <span className="font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {visiblePasswords[user.id] ? (user.password || 'password123') : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                            title="Toggle Password Visibility"
                          >
                            {visiblePasswords[user.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                    {/* Block / Unblock Button */}
                    <button
                      onClick={() => {
                        toggleBlockUser(user.id);
                        showToast(user.isBlocked ? `Unblocked user @${user.username}` : `Blocked user @${user.username}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        user.isBlocked
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{user.isBlocked ? 'Unblock Account' : 'Block Account'}</span>
                    </button>

                    {/* Verification Toggle Button */}
                    {user.isVerified ? (
                      <button
                        onClick={() => {
                          toggleUserVerification(user.id);
                          showToast(`Revoked verification badge tick from @${user.username}`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-bold hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Revoke Badge</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          toggleUserVerification(user.id);
                          showToast(`Granted verification badge tick to @${user.username}!`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#0095f6] text-white text-xs font-bold hover:bg-sky-600 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Grant Badge</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
