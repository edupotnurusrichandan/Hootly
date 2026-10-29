import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';

interface OwlMascotProps {
  size?: number;
  isSleepy?: boolean;
  level?: number;
  streakDays?: number;
  showFlame?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

export const OwlMascot: React.FC<OwlMascotProps> = ({
  size = 64,
  isSleepy = false,
  level = 1,
  streakDays = 5,
  showFlame = true,
  animated = true,
  onClick
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  // Flame sizing logic based on streak
  const flameHeight = streakDays >= 7 ? 40 : streakDays >= 3 ? 30 : 22;
  const flameWidth = streakDays >= 7 ? 54 : streakDays >= 3 ? 42 : 32;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Hootly the Study Owl (Click for gentle hoot!)"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transform: isBouncing
          ? 'scale(1.15) translateY(-6px)'
          : isHovered
            ? 'scale(1.06) translateY(-2px)'
            : 'scale(1) translateY(0)',
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <style>
        {`
          @keyframes owlFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
          @keyframes owlBlink {
            0%, 92%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
          }
          @keyframes flameWave {
            0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
            50% { transform: scaleY(1.08) scaleX(0.96); opacity: 0.98; }
          }
          @keyframes wingFlutterLeft {
            0%, 100% { transform: rotate(12deg); }
            50% { transform: rotate(26deg); }
          }
          @keyframes wingFlutterRight {
            0%, 100% { transform: rotate(-12deg); }
            50% { transform: rotate(-26deg); }
          }
        `}
      </style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          overflow: 'visible',
          animation: animated && !isSleepy ? 'owlFloat 3.4s ease-in-out infinite' : 'none'
        }}
      >
        <defs>
          {/* Flame Gradient */}
          <linearGradient id="owlFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>

          {/* Theme Gradient for Scarf & Accents */}
          <linearGradient id="owlThemeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.gradient.from} />
            <stop offset="100%" stopColor={theme.gradient.to} />
          </linearGradient>

          {/* Eye Glow Filter */}
          <filter id="eyeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. STREAK FLAME PERCH */}
        {showFlame && streakDays > 0 && (
          <g
            transform={`translate(${50 - flameWidth / 2}, ${82 - flameHeight})`}
            style={{
              transformOrigin: `${flameWidth / 2}px ${flameHeight}px`,
              animation: animated ? 'flameWave 2s ease-in-out infinite' : 'none'
            }}
          >
            {/* Outer Flame Glow */}
            <path
              d={`M ${flameWidth / 2} 0 Q ${flameWidth} ${flameHeight * 0.4} ${flameWidth * 0.8} ${flameHeight} Q ${flameWidth / 2} ${flameHeight * 1.1} ${flameWidth * 0.2} ${flameHeight} Q 0 ${flameHeight * 0.4} ${flameWidth / 2} 0 Z`}
              fill="url(#owlFlameGrad)"
              opacity="0.88"
            />
            {/* Inner Core Flame */}
            <path
              d={`M ${flameWidth / 2} ${flameHeight * 0.25} Q ${flameWidth * 0.8} ${flameHeight * 0.6} ${flameWidth * 0.7} ${flameHeight * 0.95} Q ${flameWidth / 2} ${flameHeight} ${flameWidth * 0.3} ${flameHeight * 0.95} Q ${flameWidth * 0.2} ${flameHeight * 0.6} ${flameWidth / 2} ${flameHeight * 0.25} Z`}
              fill="#fef08a"
              opacity="0.95"
            />
          </g>
        )}

        {/* 2. WOODEN BRANCH / PERCH */}
        <rect x="22" y="80" width="56" height="6" rx="3" fill="#78350f" />
        {/* Talons */}
        <ellipse cx="42" cy="81" rx="4" ry="2.5" fill="#f59e0b" />
        <ellipse cx="58" cy="81" rx="4" ry="2.5" fill="#f59e0b" />

        {/* 3. OWL BODY */}
        <ellipse
          cx="50"
          cy="56"
          rx="26"
          ry="25"
          fill="var(--surface)"
          stroke="var(--border)"
          strokeWidth="2"
        />

        {/* Belly Plumes */}
        <ellipse cx="50" cy="62" rx="17" ry="16" fill="var(--bg)" opacity="0.65" />
        <path d="M45 56 Q50 59 55 56" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M43 63 Q50 66 57 63" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M45 70 Q50 73 55 70" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

        {/* Animated Wings */}
        <ellipse
          cx="28"
          cy="58"
          rx="6"
          ry="14"
          fill="var(--surface-hover)"
          stroke="var(--border)"
          strokeWidth="1.5"
          style={{
            transformOrigin: '28px 48px',
            animation: isHovered || isBouncing ? 'wingFlutterLeft 0.35s ease-in-out infinite' : 'none'
          }}
        />
        <ellipse
          cx="72"
          cy="58"
          rx="6"
          ry="14"
          fill="var(--surface-hover)"
          stroke="var(--border)"
          strokeWidth="1.5"
          style={{
            transformOrigin: '72px 48px',
            animation: isHovered || isBouncing ? 'wingFlutterRight 0.35s ease-in-out infinite' : 'none'
          }}
        />

        {/* 4. OWL HEAD & EARS */}
        <g style={{ transformOrigin: '50px 42px', transform: isHovered ? 'rotate(4deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
          {/* Ear tufts */}
          <path d="M30 32 L36 42 L24 40 Z" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
          <path d="M70 32 L64 42 L76 40 Z" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />

          {/* Head circle */}
          <circle cx="50" cy="42" r="21" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />

          {/* 5. EYES & FACE */}
          {isSleepy ? (
            // Sleepy / Night Mode Eyes
            <g>
              <path d="M37 43 Q43 49 47 43" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M53 43 Q57 49 63 43" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              {/* Rosy cheeks */}
              <circle cx="36" cy="48" r="3.5" fill="#f43f5e" opacity="0.4" />
              <circle cx="64" cy="48" r="3.5" fill="#f43f5e" opacity="0.4" />
            </g>
          ) : (
            // Awake Study Eyes with Natural Blinking Animation
            <g
              style={{
                transformOrigin: '50px 41px',
                animation: animated ? 'owlBlink 4.2s ease-in-out infinite' : 'none'
              }}
            >
              {/* Eye Sockets */}
              <circle cx="41" cy="41" r="9" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
              <circle cx="59" cy="41" r="9" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />

              {/* Pupils */}
              <circle cx="42" cy="41" r="5" fill="var(--text)" />
              <circle cx="58" cy="41" r="5" fill="var(--text)" />

              {/* Eye highlights */}
              <circle cx="44" cy="39" r="2" fill="#ffffff" />
              <circle cx="60" cy="39" r="2" fill="#ffffff" />
            </g>
          )}

          {/* Beak */}
          <polygon points="50,45 46,51 54,51" fill="#f59e0b" />

          {/* ACCESSORIES UNLOCKED BY LEVEL */}
          {/* Level 1: Reading Glasses */}
          {level >= 1 && !isSleepy && (
            <g>
              <circle cx="41" cy="41" r="10" fill="none" stroke="var(--accent)" strokeWidth="2" />
              <circle cx="59" cy="41" r="10" fill="none" stroke="var(--accent)" strokeWidth="2" />
              <path d="M51 41 L49 41" stroke="var(--accent)" strokeWidth="2" />
              <path d="M31 39 L26 38" stroke="var(--accent)" strokeWidth="1.5" />
              <path d="M69 39 L74 38" stroke="var(--accent)" strokeWidth="1.5" />
            </g>
          )}

          {/* Level 2: Cozy Scarf */}
          {level >= 2 && (
            <g>
              <rect x="36" y="52" width="28" height="6" rx="3" fill="url(#owlThemeGrad)" />
              <rect x="54" y="56" width="6" height="12" rx="2" fill="url(#owlThemeGrad)" />
            </g>
          )}

          {/* Level 3: Mortarboard Graduation Cap */}
          {level >= 3 && !isSleepy && (
            <g>
              <polygon points="50,14 74,21 50,28 26,21" fill="#1e1b4b" stroke="var(--accent)" strokeWidth="1.5" />
              <rect x="42" y="24" width="16" height="6" fill="#1e1b4b" />
              <path d="M50 21 Q62 23 64 32" stroke="#f59e0b" strokeWidth="2" fill="none" />
              <circle cx="64" cy="33" r="2" fill="#f59e0b" />
            </g>
          )}

          {/* Level 4: Golden Feather */}
          {level >= 4 && (
            <g transform="translate(38, 62)">
              <path d="M0 0 Q6 -4 10 -10 Q10 2 0 6 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <line x1="2" y1="2" x2="8" y2="-7" stroke="#b45309" strokeWidth="0.8" />
            </g>
          )}

          {/* Sleepy Nightcap */}
          {isSleepy && (
            <g>
              <path
                d="M32 30 Q50 14 68 28 Q80 20 86 36 Q76 40 68 34 Z"
                fill="#6366f1"
                stroke="#4338ca"
                strokeWidth="1.5"
              />
              <ellipse cx="50" cy="30" rx="20" ry="5" fill="#f8fafc" />
              <circle cx="86" cy="36" r="5" fill="#f8fafc" />
              <text x="76" y="20" fill="var(--accent)" fontSize="12" fontWeight="700" opacity="0.9" className="animate-pulse-slow">
                z
              </text>
              <text x="86" y="12" fill="var(--accent)" fontSize="15" fontWeight="800" opacity="0.9" className="animate-pulse-slow">
                Z
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
