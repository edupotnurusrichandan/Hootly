import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { playSoftHoot } from '../utils/audio';
import {
  Search,
  Plus,
  StickyNote,
  Sliders,
  Sun,
  Moon,
  Sparkles,
  ExternalLink,
  GraduationCap,
  BookOpen,
  Clock,
  Quote,
  Eye
} from 'lucide-react';

interface CommandItem {
  id: string;
  category: string;
  label: string;
  hint?: string;
  icon: React.ElementType;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTab: () => void;
  onOpenParkingLot: () => void;
  onOpenSettings: () => void;
  onOpenTimer?: () => void;
  onOpenCitation?: () => void;
  onOpenReadingMode?: () => void;
  onReplayIntro?: () => void;
  onNavigate: (url: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onCreateTab,
  onOpenParkingLot,
  onOpenSettings,
  onOpenTimer,
  onOpenCitation,
  onOpenReadingMode,
  onReplayIntro,
  onNavigate
}) => {
  const { allThemes, setThemeId, effectiveMode, setThemeMode } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const baseCommands: CommandItem[] = [
    {
      id: 'new-tab',
      category: 'Navigation',
      label: 'Open New Tab',
      hint: 'Ctrl+T',
      icon: Plus,
      action: () => {
        onCreateTab();
        onClose();
      }
    },
    {
      id: 'focus-timer',
      category: 'Focus',
      label: 'Start Study Timer (Pomodoro & Break Coach)',
      hint: 'Timer',
      icon: Clock,
      action: () => {
        onClose();
        if (onOpenTimer) onOpenTimer();
      }
    },
    {
      id: 'parking-lot',
      category: 'Focus',
      label: 'Open Parking Lot (Park a stray thought)',
      hint: 'Ctrl+Shift+P',
      icon: StickyNote,
      action: () => {
        onClose();
        onOpenParkingLot();
      }
    },
    {
      id: 'citation',
      category: 'Study Tools',
      label: 'Cite Current Page (APA, MLA, Chicago, BibTeX)',
      hint: 'Cite',
      icon: Quote,
      action: () => {
        onClose();
        if (onOpenCitation) onOpenCitation();
      }
    },
    {
      id: 'reading-mode',
      category: 'Study Tools',
      label: 'Reading Mode, Focus Ruler & Ambient Sounds',
      hint: 'Ambient',
      icon: Eye,
      action: () => {
        onClose();
        if (onOpenReadingMode) onOpenReadingMode();
      }
    },
    {
      id: 'toggle-mode',
      category: 'Appearance',
      label: effectiveMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: effectiveMode === 'dark' ? Sun : Moon,
      action: () => {
        setThemeMode(effectiveMode === 'dark' ? 'light' : 'dark');
        onClose();
      }
    },
    {
      id: 'settings',
      category: 'Settings',
      label: 'Themes & Settings',
      hint: 'Ctrl+,',
      icon: Sliders,
      action: () => {
        onClose();
        onOpenSettings();
      }
    },
    {
      id: 'hoot',
      category: 'Mascot',
      label: 'Hoot with Hootly the Owl',
      icon: Sparkles,
      action: () => {
        playSoftHoot();
        onClose();
      }
    },
    {
      id: 'intro-animation',
      category: 'Mascot',
      label: 'Replay Opera-Style Hootly Opening Animation',
      icon: Sparkles,
      action: () => {
        onClose();
        if (onReplayIntro) onReplayIntro();
      }
    },
    {
      id: 'scholar',
      category: 'Study Tools',
      label: 'Open Google Scholar',
      icon: GraduationCap,
      action: () => {
        onNavigate('https://scholar.google.com');
        onClose();
      }
    },
    {
      id: 'wiki',
      category: 'Study Tools',
      label: 'Open Wikipedia',
      icon: BookOpen,
      action: () => {
        onNavigate('https://en.wikipedia.org');
        onClose();
      }
    }
  ];

  // Theme quick-switch commands
  const themeCommands: CommandItem[] = allThemes.slice(0, 10).map((t) => ({
    id: `theme-${t.id}`,
    category: 'Themes',
    label: `Switch Theme to ${t.name}`,
    icon: Sparkles,
    action: () => {
      setThemeId(t.id);
      onClose();
    }
  }));

  const allItems: CommandItem[] = [...baseCommands, ...themeCommands];

  const filteredItems = allItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      } else if (query.trim()) {
        // Direct search
        onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

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
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '580px',
          maxWidth: '92vw',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg)'
          }}
        >
          <Search size={18} style={{ color: 'var(--accent)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search study sites, or switch theme... (Ctrl+K)"
            style={{
              flex: 1,
              fontSize: '14px',
              color: 'var(--text)',
              outline: 'none',
              background: 'transparent'
            }}
          />
          <span
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}
          >
            ESC to close
          </span>
        </div>

        {/* Command Results List */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '6px' }}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--surface-hover)' : 'transparent',
                    transition: 'background-color 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {item.category}
                      </div>
                    </div>
                  </div>

                  {item.hint && (
                    <span
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg)',
                        padding: '2px 5px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        fontFamily: 'monospace'
                      }}
                    >
                      {item.hint}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                No built-in command found for &ldquo;{query}&rdquo;
              </div>
              <button
                onClick={() => {
                  onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
                  onClose();
                }}
                style={{
                  marginTop: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              >
                <span>Search Google for &ldquo;{query}&rdquo;</span>
                <ExternalLink size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg)',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}
        >
          <span>Use ↑ ↓ to navigate, Enter to run</span>
          <span>Hootly Fast Commands</span>
        </div>
      </div>
    </div>
  );
};
