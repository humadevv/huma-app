import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Heart, 
  Mic, 
  Phone, 
  Video, 
  Info, 
  CheckCheck,
  Search,
  Sparkles,
  ChevronLeft,
  Pin,
  Trash2,
  MoreVertical,
  Plus,
  X,
  ShieldAlert,
  MessageSquareQuote,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Conversation, Message, User } from '../../types';
import { checkContentSafety, CONTENT_SAFETY_POLICY_MESSAGE } from '../../utils/contentFilter';

export const DirectMessages: React.FC = () => {
  const { 
    conversations, 
    currentUser, 
    sendMessage, 
    createConversation,
    togglePinConversation,
    deleteConversation,
    usersMap,
    darkMode, 
    navigateToProfile 
  } = useApp();

  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isNewYapModalOpen, setIsNewYapModalOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [activeMenuConvId, setActiveMenuConvId] = useState<string | null>(null);
  const [deletingConvId, setDeletingConvId] = useState<string | null>(null);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const [selectedImageMedia, setSelectedImageMedia] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, selectedConvId]);

  // Sort conversations: Pinned ones at the very top, then by most recent
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const filteredConversations = sortedConversations.filter((c) =>
    c.participant.username.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.participant.fullName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSafetyWarning(null);
    if (!inputText.trim() && !selectedImageMedia) return;
    if (!activeConversation) return;

    if (inputText.trim()) {
      const safety = checkContentSafety(inputText);
      if (!safety.isSafe) {
        setSafetyWarning(CONTENT_SAFETY_POLICY_MESSAGE);
        return;
      }
    }

    sendMessage(
      activeConversation.id, 
      inputText.trim() || undefined, 
      selectedImageMedia || undefined
    );

    setInputText('');
    setSelectedImageMedia(null);
  };

  const handleStartNewYap = (user: User) => {
    const newConvId = createConversation(user);
    setSelectedConvId(newConvId);
    setIsNewYapModalOpen(false);
    setUserSearchTerm('');
  };

  const handleDeleteConfirmed = () => {
    if (deletingConvId) {
      deleteConversation(deletingConvId);
      if (selectedConvId === deletingConvId) {
        const remaining = conversations.filter((c) => c.id !== deletingConvId);
        setSelectedConvId(remaining[0]?.id || '');
      }
      setDeletingConvId(null);
      setActiveMenuConvId(null);
    }
  };

  const handleTogglePin = (convId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    togglePinConversation(convId);
    setActiveMenuConvId(null);
  };

  const availableUsersToYap = (Object.values(usersMap) as User[]).filter(
    (u) => u.id !== currentUser.id && u.username !== 'c' && !u.isAdmin &&
    (u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
     u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );

  const currentMessagesList: Message[] = activeConversation 
    ? (activeConversation.messages && activeConversation.messages.length > 0 
        ? activeConversation.messages 
        : [activeConversation.lastMessage])
    : [];

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-64px)] md:h-[calc(100vh-32px)] py-4 px-2 md:px-4 flex gap-0 rounded-2xl overflow-hidden relative">
      {/* Left Chat / Yaps List Panel */}
      <div 
        className={`w-full md:w-80 shrink-0 border-r flex flex-col transition-colors duration-200
          ${selectedConvId && 'hidden md:flex'}
          ${darkMode ? 'bg-black border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
      >
        {/* Yaps Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 bg-clip-text text-transparent">
              Yaps
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Direct
            </span>
          </div>

          <button
            onClick={() => setIsNewYapModalOpen(true)}
            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all flex items-center gap-1 text-xs font-bold"
            title="Start New Yap"
          >
            <Plus className="w-4 h-4" />
            <span>New Yap</span>
          </button>
        </div>

        {/* Search Yaps Bar */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search yaps..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none ${
                darkMode ? 'bg-zinc-900 text-white placeholder-zinc-500' : 'bg-zinc-100 text-zinc-900'
              }`}
            />
          </div>
        </div>

        {/* Yaps List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 flex flex-col items-center gap-3 mt-8">
              <MessageSquareQuote className="w-10 h-10 text-zinc-600" />
              <div>
                <p className="font-bold text-sm text-zinc-300">No Yaps Found</p>
                <p className="text-xs text-zinc-500 mt-1">Start a fresh yap with anyone on HUMA.</p>
              </div>
              <button
                onClick={() => setIsNewYapModalOpen(true)}
                className="mt-2 px-4 py-1.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-md"
              >
                Start a Yap
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`relative group flex items-center gap-3 p-3.5 cursor-pointer transition-all ${
                    isSelected 
                      ? darkMode ? 'bg-zinc-900/90 font-semibold' : 'bg-zinc-100 font-semibold'
                      : darkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-50'
                  }`}
                >
                  {/* Pinned Marker Indicator */}
                  {conv.isPinned && (
                    <div className="absolute left-1 top-1.5 text-amber-400" title="Pinned Yap">
                      <Pin className="w-3 h-3 fill-amber-400" />
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="relative shrink-0 ml-1">
                    <img
                      src={conv.participant.avatarUrl}
                      alt={conv.participant.username}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-zinc-800"
                    />
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-black" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm truncate">{conv.participant.username}</span>
                      {(conv.participant.isVerified || conv.participant.username === 'd') && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500 shrink-0" />
                      )}
                      {conv.participant.username === 'd' && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase">
                          DEV
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">
                      {conv.lastMessage.text || (conv.lastMessage.mediaUrl ? '📷 Photo' : 'Shared media')}
                    </div>
                  </div>

                  {/* Options & Pin Actions */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-zinc-500">
                      {conv.lastMessage.createdAt}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Pin button */}
                      <button
                        onClick={(e) => handleTogglePin(conv.id, e)}
                        className={`p-1 rounded-lg transition-colors ${
                          conv.isPinned 
                            ? 'text-amber-400 hover:bg-amber-500/20' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                        title={conv.isPinned ? 'Unpin Yap' : 'Pin Yap to Top'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${conv.isPinned ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingConvId(conv.id);
                        }}
                        className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Yap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Thread Panel */}
      {activeConversation ? (
        <div 
          className={`flex-1 flex flex-col transition-colors duration-200
            ${!selectedConvId && 'hidden md:flex'}
            ${darkMode ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}
        >
          {/* Yap Thread Header */}
          <div className="p-3 md:p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedConvId('')}
                className="p-1.5 -ml-1 text-zinc-400 hover:text-white md:hidden rounded-lg"
                title="Back to Yaps"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div 
                onClick={() => navigateToProfile(activeConversation.participant.id)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={activeConversation.participant.avatarUrl}
                  alt={activeConversation.participant.username}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm group-hover:underline">
                    <span>{activeConversation.participant.username}</span>
                    {(activeConversation.participant.isVerified || activeConversation.participant.username === 'd') && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                    )}
                    {activeConversation.participant.username === 'd' && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase">
                        DEV
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                    {activeConversation.isPinned && (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5 fill-amber-400" /> Pinned
                      </span>
                    )}
                    <span>{activeConversation.isOnline ? 'Active now' : 'HUMA User'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Yap Controls: Pin & Delete */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleTogglePin(activeConversation.id)}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-xs font-bold ${
                  activeConversation.isPinned
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={activeConversation.isPinned ? 'Unpin this Yap' : 'Pin this Yap to top'}
              >
                <Pin className={`w-3.5 h-3.5 ${activeConversation.isPinned ? 'fill-amber-400' : ''}`} />
                <span className="hidden sm:inline">{activeConversation.isPinned ? 'Pinned' : 'Pin Yap'}</span>
              </button>

              <button 
                onClick={() => setDeletingConvId(activeConversation.id)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors flex items-center gap-1 text-xs font-bold"
                title="Delete this Yap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Child Safety Alert Warning if triggered */}
          {safetyWarning && (
            <div className="mx-4 mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-200 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block text-amber-300">Safety Notice</span>
                {safetyWarning}
              </div>
              <button onClick={() => setSafetyWarning(null)} className="text-amber-400 hover:text-amber-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages Thread Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* User Profile Callout */}
            <div className="flex flex-col items-center justify-center my-6 text-center">
              <div className="relative p-1 rounded-full bg-red-600 ring-1 ring-red-500 mb-2">
                <img
                  src={activeConversation.participant.avatarUrl}
                  alt={activeConversation.participant.username}
                  className="w-20 h-20 rounded-full object-cover border-2 border-black"
                />
              </div>
              <div className="font-bold text-base flex items-center gap-1">
                <span>{activeConversation.participant.fullName}</span>
                {(activeConversation.participant.isVerified || activeConversation.participant.username === 'd') && (
                  <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-500" />
                )}
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">
                @{activeConversation.participant.username}
              </div>
              <button 
                onClick={() => navigateToProfile(activeConversation.participant.id)}
                className="mt-3 px-4 py-1.5 rounded-xl bg-zinc-800 text-xs font-bold text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                View Profile
              </button>
            </div>

            {/* Conversation Messages Stream */}
            {currentMessagesList.map((msg, index) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div 
                  key={msg.id || index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-br-none shadow-md shadow-rose-600/20'
                        : 'bg-zinc-800 text-white rounded-bl-none border border-zinc-700/50'
                    }`}
                  >
                    {/* Media image preview if present */}
                    {msg.mediaUrl && (
                      <img
                        src={msg.mediaUrl}
                        alt="Shared"
                        className="w-full max-h-60 object-cover rounded-xl mb-2"
                      />
                    )}

                    {/* Shared post preview */}
                    {msg.postPreview && (
                      <div className="mb-2 p-2 rounded-xl bg-black/40 border border-white/10">
                        <img
                          src={msg.postPreview.mediaUrl}
                          alt="Shared Post"
                          className="w-full aspect-square object-cover rounded-lg mb-1"
                        />
                        <div className="text-xs font-bold">
                          @{msg.postPreview.username}
                        </div>
                      </div>
                    )}

                    {msg.text && <div>{msg.text}</div>}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1">
                    {msg.createdAt}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Upload Attachment Preview */}
          {selectedImageMedia && (
            <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={selectedImageMedia}
                  alt="Attachment"
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-700"
                />
                <span className="text-xs text-zinc-300">Photo attached</span>
              </div>
              <button
                onClick={() => setSelectedImageMedia(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2.5 focus-within:border-rose-500/80 transition-colors">
              <input
                type="text"
                placeholder="Send a yap..."
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (safetyWarning) setSafetyWarning(null);
                }}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />

              {/* Photo attachment input */}
              <label className="cursor-pointer text-zinc-400 hover:text-rose-400 transition-colors">
                <ImageIcon className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setSelectedImageMedia(ev.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() && !selectedImageMedia}
              className="p-3 rounded-full bg-rose-600 text-white font-bold transition-all disabled:opacity-40 disabled:bg-zinc-800 hover:bg-rose-500 shadow-md shadow-rose-600/30"
              title="Send Yap"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
          <div className="w-16 h-16 rounded-3xl bg-rose-600/10 text-rose-500 flex items-center justify-center mb-4">
            <MessageSquareQuote className="w-8 h-8" />
          </div>
          <p className="text-xl font-black text-white">Your Yaps</p>
          <p className="text-sm text-zinc-400 max-w-sm mt-1">
            Send real-time messages, pin your favorite human connections, or start a new yap anytime.
          </p>
          <button
            onClick={() => setIsNewYapModalOpen(true)}
            className="mt-5 px-6 py-2.5 rounded-2xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Start a Yap</span>
          </button>
        </div>
      )}

      {/* Start New Yap Modal */}
      {isNewYapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${
            darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-bold">
              <span className="text-base">New Yap</span>
              <button 
                onClick={() => setIsNewYapModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by username or name..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none border border-zinc-800 focus:border-rose-500"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40 p-2">
              {availableUsersToYap.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No users found matching "{userSearchTerm}".
                </div>
              ) : (
                availableUsersToYap.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleStartNewYap(user)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-sm">
                          <span>{user.username}</span>
                          {(user.isVerified || user.username === 'd') && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                          )}
                          {user.username === 'd' && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase">
                              DEV
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-400 block">{user.fullName}</span>
                      </div>
                    </div>

                    <button className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-500">
                      Yap
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Yap Confirmation Modal */}
      {deletingConvId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl flex flex-col gap-4 ${
            darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-lg text-white">Delete Yap?</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                This will permanently delete the yap history and remove it from your inbox. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingConvId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-500 shadow-md shadow-red-600/30 transition-colors"
              >
                Delete Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
