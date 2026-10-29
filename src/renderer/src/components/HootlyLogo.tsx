import React from 'react';

interface HootlyLogoProps {
  size?: number;
  accentColor?: string;
}

/**
 * Hootly owl mascot — cute minimalist SVG owl
 * Works at 16px, 24px, and 48px via `size` prop.
 */
export const HootlyLogo: React.FC<HootlyLogoProps> = ({ size = 24, accentColor = 'var(--accent)' }) => {
  // We use a viewBox-based SVG so it scales cleanly at any size
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hootly owl mascot"
    >
      {/* Body */}
      <ellipse cx="32" cy="40" rx="18" ry="18" fill={accentColor} opacity="0.18" />
      <ellipse cx="32" cy="40" rx="16" ry="16" fill={accentColor} />

      {/* Wings slightly open */}
      <path
        d="M16 42 Q8 36 10 50 Q16 52 18 46"
        fill={accentColor}
        opacity="0.8"
        stroke="none"
      />
      <path
        d="M48 42 Q56 36 54 50 Q48 52 46 46"
        fill={accentColor}
        opacity="0.8"
        stroke="none"
      />

      {/* Head */}
      <ellipse cx="32" cy="22" rx="13" ry="13" fill={accentColor} />

      {/* Ear tufts */}
      <polygon points="22,12 19,4 25,10" fill={accentColor} />
      <polygon points="42,12 45,4 39,10" fill={accentColor} />

      {/* Face plate */}
      <ellipse cx="32" cy="23" rx="9" ry="8" fill="white" opacity="0.18" />

      {/* Eye whites */}
      <circle cx="27" cy="22" r="5" fill="white" />
      <circle cx="37" cy="22" r="5" fill="white" />

      {/* Pupils */}
      <circle cx="27.5" cy="22.5" r="2.8" fill="#1a1a2e" />
      <circle cx="37.5" cy="22.5" r="2.8" fill="#1a1a2e" />

      {/* Eye shine highlights */}
      <circle cx="28.5" cy="21" r="1" fill="white" />
      <circle cx="38.5" cy="21" r="1" fill="white" />

      {/* Beak */}
      <polygon points="32,26 29.5,29.5 34.5,29.5" fill="#f97316" />

      {/* Belly / chest feather detail */}
      <ellipse cx="32" cy="43" rx="8" ry="9" fill="white" opacity="0.14" />

      {/* Feet */}
      <line x1="27" y1="56" x2="24" y2="60" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="27" y1="56" x2="27" y2="61" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="27" y1="56" x2="30" y2="60" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="37" y1="56" x2="34" y2="60" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="37" y1="56" x2="37" y2="61" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="37" y1="56" x2="40" y2="60" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
