import React, { useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { OwlMascot } from './OwlMascot';
import { playOperaIntroSwell } from '../utils/audio';

interface StartupSplashProps {
  onComplete: () => void;
}

export const StartupSplash: React.FC<StartupSplashProps> = ({ onComplete }) => {
  const { theme, settings } = useTheme();
  const [phase, setPhase] = useState<'charging' | 'revealing' | 'burst' | 'done'>('charging');

  useEffect(() => {
    // 1. Play Opera-style intro chord sound if enabled
    if (settings?.soundEffectsEnabled) {
      playOperaIntroSwell();
    }

    // 2. Timeline of the Opera-style opening animation
    const t1 = setTimeout(() => setPhase('revealing'), 350);
    const t2 = setTimeout(() => setPhase('burst'), 1350);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [settings?.soundEffectsEnabled, onComplete]);

  // Click or keypress to skip
  const handleSkip = () => {
    setPhase('done');
    onComplete();
  };

  if (phase === 'done') return null;

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#070b14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        cursor: 'pointer',
        overflow: 'hidden',
        opacity: phase === 'burst' ? 0 : 1,
        transform: phase === 'burst' ? 'scale(1.08)' : 'scale(1)',
        transition: 'opacity 0.45s ease-out, transform 0.45s ease-out'
      }}
    >
      <style>
        {`
          @keyframes operaRingPulse {
            0% { transform: scale(0.4); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @keyframes operaApertureSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes operaSwoopIn {
            0% { transform: scale(0.3) translateY(30px); opacity: 0; filter: blur(10px); }
            60% { transform: scale(1.1) translateY(-4px); opacity: 1; filter: blur(0px); }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          @keyframes operaTextGlow {
            0% { opacity: 0; letter-spacing: 12px; }
            100% { opacity: 1; letter-spacing: 6px; }
          }
          @keyframes lightBeamSweep {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}
      </style>

      {/* Futuristic Concentric Neon Aperture Rings (Opera-GX Style) */}
      <div
        style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          border: `2px solid ${theme.gradient.from}`,
          boxShadow: `0 0 40px ${theme.gradient.from}, inset 0 0 40px ${theme.gradient.to}`,
          animation: 'operaRingPulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          border: `1.5px dashed ${theme.gradient.to}`,
          opacity: 0.35,
          animation: 'operaApertureSpin 8s linear infinite',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.gradient.from}33 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      {/* Mascot Swooping in */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          animation: 'operaSwoopIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        <OwlMascot size={110} level={3} streakDays={7} showFlame={true} animated={true} />
      </div>

      {/* Brand Title with Cinematic Glow */}
      <div
        style={{
          marginTop: '24px',
          textAlign: 'center',
          zIndex: 10,
          opacity: phase === 'charging' ? 0 : 1,
          transition: 'opacity 0.4s ease'
        }}
      >
        <h1
          style={{
            fontSize: '34px',
            fontWeight: 900,
            color: '#ffffff',
            textTransform: 'uppercase',
            margin: '0 0 6px 0',
            background: `linear-gradient(135deg, #ffffff 30%, ${theme.gradient.from} 70%, ${theme.gradient.to} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'operaTextGlow 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            textShadow: '0 0 25px rgba(255, 255, 255, 0.2)'
          }}
        >
          H O O T L Y
        </h1>

        {/* Glowing Hairline with sweeping light beam */}
        <div
          style={{
            position: 'relative',
            width: '200px',
            height: '2px',
            margin: '0 auto 10px auto',
            background: `linear-gradient(90deg, transparent, ${theme.gradient.from}, ${theme.gradient.to}, transparent)`,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '60px',
              background: '#ffffff',
              boxShadow: '0 0 8px #ffffff',
              animation: 'lightBeamSweep 1.2s ease-in-out infinite'
            }}
          />
        </div>

        <p
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.65)',
            letterSpacing: '1px',
            margin: 0
          }}
        >
          Your Calm, Focus-First Study Browser
        </p>
      </div>

      {/* Skip Hint */}
      <span
        style={{
          position: 'absolute',
          bottom: '24px',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.3)',
          letterSpacing: '0.5px'
        }}
      >
        Click anywhere to skip
      </span>
    </div>
  );
};
