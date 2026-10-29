import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { AmbientSoundType } from '@shared/types';
import { playAmbientSound, setAmbientVolume, stopAmbientSound } from '../utils/ambientAudio';
import {
  X,
  BookOpen,
  Volume2,
  VolumeX,
  Eye,
  Type,
  CloudRain,
  Coffee,
  Waves,
  Sliders
} from 'lucide-react';

interface ReadingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadingModeModal: React.FC<ReadingModeModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useTheme();

  if (!isOpen) return null;

  const currentSound = settings?.ambientSound || 'none';
  const currentVolume = settings?.ambientVolume ?? 0.5;

  const handleSoundChange = (type: AmbientSoundType) => {
    if (type === currentSound) {
      // Toggle off
      stopAmbientSound();
      updateSettings({ ambientSound: 'none' });
    } else {
      playAmbientSound(type, currentVolume);
      updateSettings({ ambientSound: type });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmbientVolume(val);
    updateSettings({ ambientVolume: val });
  };

  const handleToggleDyslexiaFont = () => {
    const nextVal = !settings?.dyslexiaFontEnabled;
    updateSettings({ dyslexiaFontEnabled: nextVal });
  };

  const handleToggleFocusRuler = () => {
    const nextVal = !settings?.readingRulerEnabled;
    updateSettings({ readingRulerEnabled: nextVal });
  };

  const handleToggleHighContrast = () => {
    const nextVal = !settings?.highContrastMode;
    updateSettings({ highContrastMode: nextVal });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '540px',
          maxWidth: '92vw',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BookOpen size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                Reading & Accessibility Tools
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                Ambient noise, focus ruler, and high-legibility study controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Ambient Sound Section */}
          <div
            style={{
              backgroundColor: 'var(--bg)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                  Local Ambient Sounds (Offline & Copyright-free)
                </span>
              </div>
              {currentSound !== 'none' && (
                <span
                  style={{
                    fontSize: '11px',
                    color: '#10b981',
                    fontWeight: 600,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  Playing {currentSound}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              <button
                onClick={() => handleSoundChange('rain')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: currentSound === 'rain' ? 'var(--accent)' : 'var(--surface)',
                  color: currentSound === 'rain' ? '#ffffff' : 'var(--text)'
                }}
              >
                <CloudRain size={20} />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Raindrops</span>
              </button>

              <button
                onClick={() => handleSoundChange('cafe')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: currentSound === 'cafe' ? 'var(--accent)' : 'var(--surface)',
                  color: currentSound === 'cafe' ? '#ffffff' : 'var(--text)'
                }}
              >
                <Coffee size={20} />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Cafe Murmur</span>
              </button>

              <button
                onClick={() => handleSoundChange('whitenoise')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: currentSound === 'whitenoise' ? 'var(--accent)' : 'var(--surface)',
                  color: currentSound === 'whitenoise' ? '#ffffff' : 'var(--text)'
                }}
              >
                <Waves size={20} />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>White Noise</span>
              </button>
            </div>

            {/* Volume slider */}
            {currentSound !== 'none' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <VolumeX size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentVolume}
                  onChange={handleVolumeChange}
                  style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <Volume2 size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '32px' }}>
                  {Math.round(currentVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Accessibility & Focus Ruler Section */}
          <div
            style={{
              backgroundColor: 'var(--bg)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
              Accessibility & Reading Aids
            </div>

            {/* Focus Ruler */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Eye size={18} style={{ color: 'var(--accent)' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                    Focus Ruler
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    A mouse-following guide bar that highlights the active line being read
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings?.readingRulerEnabled || false}
                onChange={handleToggleFocusRuler}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            {/* High-legibility text */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Type size={18} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                    High-legibility text
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Uses a simple sans-serif font and more open letter spacing across Hootly
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings?.dyslexiaFontEnabled || false}
                onChange={handleToggleDyslexiaFont}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            {/* High Contrast */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={18} style={{ color: '#eab308' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                    High-Contrast Borders
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Sharper outlines and maximum element separation
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings?.highContrastMode || false}
                onChange={handleToggleHighContrast}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
