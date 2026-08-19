import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Sliders, 
  MapPin, 
  Music, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  Check,
  ShieldAlert,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PHOTO_FILTERS, getCustomFilterStyle } from '../../utils/filters';
import { AspectRatio, ContentCategory } from '../../types';
import { checkContentSafety, CONTENT_SAFETY_POLICY_MESSAGE } from '../../utils/contentFilter';

export const CreateModal: React.FC = () => {
  const { 
    isCreateModalOpen, 
    setIsCreateModalOpen, 
    createNewPost, 
    createNewStory,
    createNewShort,
    currentUser,
    darkMode 
  } = useApp();

  const [step, setStep] = useState<'upload' | 'filter' | 'details'>('upload');
  
  // Post state - cleanly initialized blank
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>('');
  const [targetType, setTargetType] = useState<'post' | 'story' | 'reel'>('post');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [selectedFilterId, setSelectedFilterId] = useState<string>('normal');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ContentCategory>('Architecture');
  const [musicTitle, setMusicTitle] = useState('');
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);

  // Reset all state so fields are completely blank and ready for use
  const resetForm = () => {
    setStep('upload');
    setSelectedMediaUrl('');
    setCaption('');
    setLocation('');
    setCategory('Architecture');
    setMusicTitle('');
    setSelectedFilterId('normal');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSafetyWarning(null);
  };

  // Whenever modal opens, ensure fresh blank state
  useEffect(() => {
    if (isCreateModalOpen) {
      resetForm();
    }
  }, [isCreateModalOpen]);

  const handleSwitchType = (type: 'post' | 'story' | 'reel') => {
    setTargetType(type);
    setCaption('');
    setLocation('');
    setMusicTitle('');
    setSafetyWarning(null);
  };

  if (!isCreateModalOpen) return null;

  // Sample stock photography options for quick testing
  const samplePhotos = [
    { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', cat: 'Architecture' as const },
    { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', cat: 'Travel' as const },
    { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80', cat: 'Streetwear' as const },
    { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', cat: 'Food' as const },
    { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', cat: 'Minimal' as const },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedMediaUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentFilterStyle = getCustomFilterStyle(
    selectedFilterId, 
    brightness, 
    contrast, 
    saturation
  );

  const handlePublish = () => {
    setSafetyWarning(null);

    // Multi-language child-friendly content safety check on caption
    if (caption.trim()) {
      const safety = checkContentSafety(caption);
      if (!safety.isSafe) {
        setSafetyWarning(CONTENT_SAFETY_POLICY_MESSAGE);
        return;
      }
    }

    const mediaToUse = selectedMediaUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80';

    if (targetType === 'story') {
      createNewStory(mediaToUse, caption.trim());
      resetForm();
      setIsCreateModalOpen(false);
      return;
    }

    if (targetType === 'reel') {
      createNewShort({
        caption: caption.trim() || '',
        thumbnailUrl: mediaToUse,
        videoUrl: mediaToUse.endsWith('.mp4') ? mediaToUse : undefined,
        audioTitle: musicTitle.trim() || undefined,
        audioArtist: currentUser.username,
        category,
      });
      resetForm();
      setIsCreateModalOpen(false);
      return;
    }

    createNewPost({
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatarUrl,
      isVerified: currentUser.isVerified || false,
      location: location.trim() || '',
      mediaUrls: [mediaToUse],
      mediaType: 'image',
      filterName: selectedFilterId !== 'normal' ? selectedFilterId : '',
      caption: caption.trim() || '',
      category,
      audioTrack: musicTitle.trim() ? { title: musicTitle.trim(), artist: currentUser.username } : undefined,
      aspectRatio,
    });

    resetForm();
    setIsCreateModalOpen(false);
  };

  const getTargetTitle = () => {
    if (targetType === 'post') return 'Post';
    if (targetType === 'story') return 'Moment';
    return 'Short';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      <button
        onClick={() => {
          resetForm();
          setIsCreateModalOpen(false);
        }}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-zinc-800/80 rounded-full"
      >
        <X className="w-6 h-6" />
      </button>

      <div className={`w-full max-w-2xl rounded-2xl overflow-hidden border shadow-2xl flex flex-col max-h-[90vh] transition-colors ${
        darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-bold">
          {step !== 'upload' ? (
            <button
              onClick={() => setStep(step === 'details' ? 'filter' : 'upload')}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : <div className="w-5" />}

          <span>Create New {getTargetTitle()}</span>

          {step === 'upload' && (
            <button
              onClick={() => {
                if (!selectedMediaUrl) {
                  setSelectedMediaUrl('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80');
                }
                setStep('filter');
              }}
              className="text-sm font-bold text-rose-500 hover:text-rose-400"
            >
              Next
            </button>
          )}

          {step === 'filter' && (
            <button
              onClick={() => setStep('details')}
              className="text-sm font-bold text-rose-500 hover:text-rose-400"
            >
              Next
            </button>
          )}

          {step === 'details' && (
            <button
              onClick={handlePublish}
              className="text-sm font-bold px-4 py-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-500 shadow-md shadow-rose-600/30"
            >
              Share
            </button>
          )}
        </div>

        {/* Child Safety Alert Banner if triggered */}
        {safetyWarning && (
          <div className="mx-4 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-200">
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {/* Step 1: Upload / Choose Media */}
          {step === 'upload' && (
            <div className="flex flex-col items-center gap-6">
              {/* Type Switcher */}
              <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-bold">
                <button
                  onClick={() => handleSwitchType('post')}
                  className={`px-4 py-2 rounded-lg transition-colors ${targetType === 'post' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                >
                  Post
                </button>
                <button
                  onClick={() => handleSwitchType('story')}
                  className={`px-4 py-2 rounded-lg transition-colors ${targetType === 'story' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                >
                  Moment
                </button>
                <button
                  onClick={() => handleSwitchType('reel')}
                  className={`px-4 py-2 rounded-lg transition-colors ${targetType === 'reel' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                >
                  Short
                </button>
              </div>

              {/* Preview Image / Upload Container */}
              {selectedMediaUrl ? (
                <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-xl group">
                  <img
                    src={selectedMediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedMediaUrl('')}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                    title="Remove selected photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer w-full max-w-sm aspect-square rounded-2xl border-2 border-dashed border-zinc-800 hover:border-rose-500/60 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-inner">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">Upload photo or media</span>
                    <span className="text-xs text-zinc-400 mt-1 block">Drag and drop or browse files</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Device Upload Button */}
              <label className="cursor-pointer px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-sm flex items-center gap-2 hover:opacity-95 transition-opacity shadow-lg shadow-rose-600/20">
                <Upload className="w-5 h-5" />
                <span>Select from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Sample Real Photography Selector */}
              <div className="w-full">
                <span className="text-xs font-bold text-zinc-400 block mb-2">Or select from high-res photography:</span>
                <div className="grid grid-cols-5 gap-2">
                  {samplePhotos.map((p, idx) => (
                    <img
                      key={idx}
                      src={p.url}
                      alt="Sample"
                      onClick={() => {
                        setSelectedMediaUrl(p.url);
                        setCategory(p.cat);
                      }}
                      className={`w-full aspect-square object-cover rounded-xl cursor-pointer border-2 transition-all ${
                        selectedMediaUrl === p.url ? 'border-rose-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Photo Filters & Adjustments */}
          {step === 'filter' && (
            <div className="flex flex-col gap-6">
              {/* Filtered Live Preview */}
              <div className="relative w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-black border border-zinc-800">
                <img
                  src={selectedMediaUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'}
                  alt="Filtered preview"
                  className="w-full h-full object-cover transition-all"
                  style={{ filter: currentFilterStyle }}
                />
              </div>

              {/* Filter Presets Grid */}
              <div>
                <span className="text-xs font-bold text-zinc-400 block mb-3 uppercase tracking-wider">
                  HUMA Creative Filters
                </span>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {PHOTO_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilterId(f.id)}
                      className="flex flex-col items-center gap-1 shrink-0 group"
                    >
                      <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedFilterId === f.id ? 'border-rose-500 scale-105 shadow-sm' : 'border-zinc-800'
                      }`}>
                        <img
                          src={selectedMediaUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'}
                          alt={f.name}
                          className="w-full h-full object-cover"
                          style={{ filter: f.filterCss }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-300 group-hover:text-white">
                        {f.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Adjustments Sliders */}
              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span>Brightness</span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />

                <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span>Contrast</span>
                  <span>{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />

                <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span>Saturation</span>
                  <span>{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Caption, Location, Category, Music - Blank and ready for new input */}
          {step === 'details' && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <img
                  src={selectedMediaUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'}
                  alt="Thumb"
                  className="w-20 h-20 rounded-xl object-cover border border-zinc-800 shrink-0"
                  style={{ filter: currentFilterStyle }}
                />
                <textarea
                  placeholder={`Write a caption for your new ${getTargetTitle().toLowerCase()}...`}
                  value={caption}
                  onChange={(e) => {
                    setCaption(e.target.value);
                    if (safetyWarning) setSafetyWarning(null);
                  }}
                  rows={3}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Location Tag */}
              {targetType === 'post' && (
                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Add location (e.g. Kyoto, Japan)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Audio Track Tag */}
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
                <Music className="w-5 h-5 text-rose-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Add music / audio track (optional)"
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">
                  Category Tag (for recommendation algorithm)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContentCategory)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Architecture">Architecture</option>
                  <option value="Travel">Travel</option>
                  <option value="Streetwear">Streetwear</option>
                  <option value="Food">Food</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Nature">Nature</option>
                  <option value="Pets">Pets</option>
                  <option value="Tech">Tech</option>
                  <option value="Fitness">Fitness</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

