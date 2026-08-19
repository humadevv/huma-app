import React from 'react';

interface HumaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  showText?: boolean;
  showSlogan?: boolean;
  textClassName?: string;
}

export const HumaLogo: React.FC<HumaLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  showSlogan = false,
  textClassName = '',
}) => {
  // Determine pixel size
  let px = 28;
  if (typeof size === 'number') {
    px = size;
  } else {
    switch (size) {
      case 'sm':
        px = 20;
        break;
      case 'md':
        px = 28;
        break;
      case 'lg':
        px = 38;
        break;
      case 'xl':
        px = 52;
        break;
      case '2xl':
        px = 68;
        break;
      default:
        px = 28;
    }
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Custom Vector Emblem for HUMA (Human Made) */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105 filter drop-shadow-md"
      >
        <defs>
          {/* Vibrant Human Made Warm & Creative Spectrum Gradient */}
          <linearGradient id="humaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="30%" stopColor="#f43f5e" />
            <stop offset="70%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Glowing Aura filter */}
          <filter id="humaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="humaInnerGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fdf4ff" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Outer Squircle Container */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="26"
          fill="url(#humaGradient)"
        />

        {/* Subtle Highlight Arc */}
        <path
          d="M 12 36 A 32 32 0 0 1 64 12"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />

        {/* Stylized 'H' Emblem for HUMA / Human Made */}
        {/* Left vertical pillar */}
        <path
          d="M 32 25 V 75"
          stroke="url(#humaInnerGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#humaGlow)"
        />

        {/* Right vertical pillar */}
        <path
          d="M 68 25 V 75"
          stroke="url(#humaInnerGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#humaGlow)"
        />

        {/* Dynamic Curved Connection Bar representing the human creative spark */}
        <path
          d="M 32 50 C 45 42, 55 58, 68 50"
          stroke="url(#humaInnerGradient)"
          strokeWidth="9"
          strokeLinecap="round"
          filter="url(#humaGlow)"
        />

        {/* Human Touch Spark Dots */}
        <circle cx="50" cy="30" r="4.5" fill="#ffffff" />
        <circle cx="76" cy="22" r="3" fill="#ffffff" opacity="0.8" />
      </svg>

      {/* Brand Text & Optional Slogan */}
      {(showText || showSlogan) && (
        <div className="flex flex-col">
          {showText && (
            <span
              className={`font-black tracking-tight bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 bg-clip-text text-transparent leading-none ${textClassName}`}
            >
              HUMA
            </span>
          )}
          {showSlogan && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mt-0.5">
              Human Made
            </span>
          )}
        </div>
      )}
    </div>
  );
};
