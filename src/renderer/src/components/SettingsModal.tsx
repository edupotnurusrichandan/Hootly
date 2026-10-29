import React, { useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { ThemeDefinition } from '@shared/types';
import { playSoftHoot } from '../utils/audio';
import { X, Sun, Moon, Laptop, Check, Sparkles, Sliders, Volume2, Key, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    themeId,
    setThemeId,
    themeMode,
    setThemeMode,
    effectiveMode,
    allThemes,
    settings,
    updateSettings
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'all' | 'gradient' | 'profession'>('all');
  const [savedPasswords, setSavedPasswords] = useState<Array<{ host: string; username: string }>>([]);
  const [passwordsLoaded, setPasswordsLoaded] = useState(false);

  // Load saved credentials when settings modal opens
  useEffect(() => {
    if (isOpen && !passwordsLoaded) {
      window.studyBrowser?.listCredentials?.().then((list) => {
        setSavedPasswords(list || []);
        setPasswordsLoaded(true);
      }).catch(() => {
        setPasswordsLoaded(true);
      });
    }
    if (!isOpen) {
      setPasswordsLoaded(false);
    }
  }, [isOpen, passwordsLoaded]);

  if (!isOpen) return null;

  const filteredThemes = allThemes.filter((t) => {
    if (activeTab === 'all') return true;
    return t.type === activeTab;
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '840px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Sliders size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
                Appearance & Themes
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Personalize your study aesthetic. Instant preview, automatically saved.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-muted)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Mode Switcher (Light / Dark / System) */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
              Color Mode
            </label>
            <div
              style={{
                display: 'inline-flex',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                gap: '4px'
              }}
            >
              {(
                [
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Laptop }
                ] as const
              ).map(({ id, label, icon: Icon }) => {
                const isSelected = themeMode === id;
                return (
                  <button
                    key={id}
                    onClick={() => setThemeMode(id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 16px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: 500,
                      backgroundColor: isSelected ? 'var(--surface)' : 'transparent',
                      color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      border: isSelected ? '1px solid var(--border)' : '1px solid transparent'
                    }}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Category Tabs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                Active Theme ({filteredThemes.length})
              </label>

              <div style={{ display: 'flex', gap: '4px' }}>
                {(['all', 'gradient', 'profession'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '12px',
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      backgroundColor: activeTab === cat ? 'var(--accent)' : 'transparent',
                      color: activeTab === cat ? '#ffffff' : 'var(--text-muted)',
                      border: activeTab === cat ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    {cat === 'all' ? 'All Themes' : cat === 'gradient' ? 'Gradients' : 'Professions'}
                  </button>
                ))}
              </div>
            </div>

            {/* Themes Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '14px'
              }}
            >
              {filteredThemes.map((t: ThemeDefinition) => {
                const isSelected = t.id === themeId;
                const palette = effectiveMode === 'dark' ? t.dark : t.light;

                return (
                  <div
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                      backgroundColor: 'var(--bg)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      boxShadow: isSelected ? '0 0 0 1px var(--accent)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--text-muted)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {/* Theme Gradient Banner */}
                    <div
                      style={{
                        height: '42px',
                        background: `linear-gradient(135deg, ${t.gradient.from}, ${t.gradient.to})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '0 10px'
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                          }}
                        >
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                          {t.name}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--surface)',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase'
                          }}
                        >
                          {t.type}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          lineHeight: '1.4',
                          height: '32px',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          marginBottom: '10px'
                        }}
                      >
                        {t.description || t.greeting}
                      </p>

                      {/* Color dots preview */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          title="Surface"
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: palette.surface,
                            border: '1px solid var(--border)'
                          }}
                        />
                        <div
                          title="Accent"
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: palette.accent
                          }}
                        />
                        <div
                          title="Gradient start"
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: t.gradient.from
                          }}
                        />
                        <div
                          title="Gradient end"
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: t.gradient.to
                          }}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {palette.accent}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delight & Habit Settings */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Celebration Animations
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Play gentle confetti and streak glow when hitting study goals.
              </p>
            </div>

            <button
              onClick={() => {
                const current = settings?.enableDelightAnimations ?? true;
                updateSettings({ enableDelightAnimations: !current });
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: settings?.enableDelightAnimations ?? true ? 'var(--accent)' : 'var(--surface)',
                color: settings?.enableDelightAnimations ?? true ? '#ffffff' : 'var(--text-muted)',
                border: '1px solid var(--border)'
              }}
            >
              {settings?.enableDelightAnimations ?? true ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Owl Sound Effect */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <Volume2 size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Soft Owl &ldquo;Hoot&rdquo; Sound
                </span>
                <button
                  type="button"
                  onClick={() => playSoftHoot()}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    fontSize: '11px',
                    color: 'var(--accent)',
                    fontWeight: 600
                  }}
                >
                  Test Hoot ♫
                </button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Play a gentle, calming double-hoot when completing focus sessions. (Off by default)
              </p>
            </div>

            <button
              onClick={() => {
                const current = settings?.soundEffectsEnabled ?? false;
                updateSettings({ soundEffectsEnabled: !current });
                if (!current) playSoftHoot();
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: settings?.soundEffectsEnabled ? 'var(--accent)' : 'var(--surface)',
                color: settings?.soundEffectsEnabled ? '#ffffff' : 'var(--text-muted)',
                border: '1px solid var(--border)'
              }}
            >
              {settings?.soundEffectsEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Bedtime / Sleepy Owl Wind-down */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <Moon size={16} style={{ color: '#818cf8' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Sleepy Owl Bedtime Wind-Down
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Barnaby puts on his nightcap and gently reminds you to rest after your chosen bedtime.
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={settings?.bedtimeReminderEnabled ?? false} onChange={(event) => void updateSettings({ bedtimeReminderEnabled: event.target.checked })} />
                Send a Windows reminder at bedtime
              </label>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {[21, 22, 23, 24].map((hour) => {
                const isSelected = (settings?.bedtimeHour ?? 22) === hour;
                const label = hour === 24 ? '12 AM' : `${hour - 12} PM`;
                return (
                  <button
                    key={hour}
                    onClick={() => updateSettings({ bedtimeHour: hour })}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Saved Passwords Section */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            margin: '0 24px 24px 24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Key size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              Saved Passwords
            </span>
          </div>
          {savedPasswords.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              No saved credentials yet. Passwords are saved automatically when sites request login.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {savedPasswords.map((cred) => (
                <div
                  key={cred.host}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{cred.host}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cred.username}</div>
                  </div>
                  <button
                    onClick={() => {
                      window.studyBrowser?.deleteCredential?.(cred.host).then(() => {
                        setSavedPasswords((prev) => prev.filter((p) => p.host !== cred.host));
                      });
                    }}
                    title="Delete saved password"
                    style={{
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      color: '#f87171'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
