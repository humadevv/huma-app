import React, { useEffect, useState } from 'react';
import { HumaLogo } from './HumaLogo';

interface SplashScreenProps {
  onComplete: () => void;
  darkMode?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, darkMode = true }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const mountTimer = setTimeout(() => {
      setIsMounted(true);
    }, 50);

    // Fill progress bar over 1.6 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 70);

    // Start fadeout at 1.8 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // Complete splash at 2.2 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 select-none transition-all duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      } ${darkMode ? 'bg-black text-white' : 'bg-zinc-950 text-white'}`}
    >
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-gradient-to-tr from-amber-500/20 via-rose-500/30 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Top spacer */}
      <div className="w-full" />

      {/* Center Hero Animated Logo & Title */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Pulsing Backlight Ring & Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 blur-md animate-ping opacity-20 pointer-events-none" />

          <div
            className={`relative p-2 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-2xl shadow-rose-500/30 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${
              isMounted ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-12 opacity-0'
            }`}
          >
            <HumaLogo size={76} />
          </div>
        </div>

        {/* Title Text Entrance */}
        <div
          className={`flex flex-col items-center transition-all duration-700 delay-150 ease-out ${
            isMounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
            HUMA
          </h1>
          <div className="mt-2.5 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-bold tracking-widest uppercase">
            Human Made
          </div>
          <p className="mt-2 text-xs md:text-sm font-medium tracking-wide text-zinc-400">
            Real Moments • Authentic Connections
          </p>
        </div>

        {/* Smooth Progress Bar */}
        <div className="w-48 h-1 bg-zinc-800/80 rounded-full overflow-hidden mt-8 border border-zinc-700/50">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Tagline / Powered Footer */}
      <div
        className={`relative z-10 flex flex-col items-center text-xs text-zinc-500 font-medium transition-opacity duration-700 delay-300 ${
          isMounted ? 'opacity-75' : 'opacity-0'
        }`}
      >
        <span>HUMA • 100% Human Made Experience</span>
      </div>
    </div>
  );
};
