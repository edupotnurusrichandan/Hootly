import React from 'react';
import { TabInfo } from '@shared/types';
import { AddressBar } from './AddressBar';
import { OwlMascot } from './OwlMascot';
import { playSoftHoot } from '../utils/audio';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Settings,
  Zap,
  Compass,
  Clock,
  StickyNote,
  Quote,
  Eye,
  Search,
  Bookmark
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

interface ToolbarProps {
  activeTab: TabInfo | null;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  onOpenTimer?: () => void;
  onOpenParkingLot?: () => void;
  onOpenCitation?: () => void;
  onOpenReadingMode?: () => void;
  onOpenCommandPalette?: () => void;
  addressBarRef?: React.RefObject<HTMLInputElement>;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTab,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onGoHome,
  onOpenSettings,
  onOpenOnboarding,
  onOpenTimer,
  onOpenParkingLot,
  onOpenCitation,
  onOpenReadingMode,
  onOpenCommandPalette,
  addressBarRef
}) => {
  const { theme, settings } = useTheme();

  const xp = settings?.xp ?? 0;
  const streak = settings?.streakDays ?? 0;
  const currentHour = new Date().getHours();
  const bedtimeHour = settings?.bedtimeHour ?? 22;
  const isNight = bedtimeHour < 5
    ? currentHour >= bedtimeHour && currentHour < 5
    : currentHour >= bedtimeHour || currentHour < 5;

  return (
    <div
      style={{
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 12px',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'relative'
      }}
    >
      {/* Top subtle gradient hairline */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${theme.gradient.from}, ${theme.gradient.to})`,
          opacity: 0.9
        }}
      />

      {/* Navigation Controls */}
      <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <button
          onClick={onGoBack}
          disabled={!activeTab?.canGoBack}
          title="Go Back (Alt+Left)"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)'
          }}
          onMouseEnter={(e) => {
            if (activeTab?.canGoBack) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={16} />
        </button>

        <button
          onClick={onGoForward}
          disabled={!activeTab?.canGoForward}
          title="Go Forward (Alt+Right)"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)'
          }}
          onMouseEnter={(e) => {
            if (activeTab?.canGoForward) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowRight size={16} />
        </button>

        <button
          onClick={onReload}
          title="Reload Page (Ctrl+R)"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <RotateCw size={15} className={activeTab?.isLoading ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={onGoHome}
          title="Home / New Tab"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            color: activeTab?.isNewTab ? 'var(--accent)' : 'var(--text)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Home size={16} />
        </button>
      </div>

      {/* Address Bar */}
      <AddressBar activeTab={activeTab} onNavigate={onNavigate} inputRef={addressBarRef} />

      {/* Action / Habit Widgets & Tools */}
      <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => {
            if (!activeTab?.url || !/^https?:\/\//i.test(activeTab.url)) return;
            const bookmarks = settings?.bookmarks || [];
            const existing = bookmarks.find((item) => item.url === activeTab.url);
            void window.studyBrowser?.saveSettings({
              bookmarks: existing
                ? bookmarks.filter((item) => item.id !== existing.id)
                : [...bookmarks, { id: `bookmark-${Date.now()}`, title: activeTab.title || activeTab.url, url: activeTab.url, createdAt: Date.now() }]
            });
          }}
          disabled={!activeTab?.url || !/^https?:\/\//i.test(activeTab.url)}
          title={(settings?.bookmarks || []).some((item) => item.url === activeTab?.url) ? 'Remove bookmark' : 'Bookmark this page'}
          style={{ width: 30, height: 30, display: 'grid', placeItems: 'center', borderRadius: 'var(--radius-md)', color: (settings?.bookmarks || []).some((item) => item.url === activeTab?.url) ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <Bookmark size={15} fill={(settings?.bookmarks || []).some((item) => item.url === activeTab?.url) ? 'currentColor' : 'none'} />
        </button>
        {/* Command Palette Trigger Button (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          title="Command Palette (Ctrl+K)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Search size={13} />
          <span style={{ fontFamily: 'monospace' }}>Ctrl+K</span>
        </button>

        {/* Study Timer Button */}
        <button
          onClick={onOpenTimer}
          title="Study Focus Timer & Break Coach"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Clock size={16} />
        </button>

        {/* Parking Lot Quick Note Button */}
        <button
          onClick={onOpenParkingLot}
          title="Distraction Parking Lot (Ctrl+Shift+P)"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = '#eab308';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <StickyNote size={16} />
        </button>

        {/* Citation Copy Button */}
        <button
          onClick={onOpenCitation}
          title="Cite Current Page (APA / MLA / BibTeX)"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Quote size={16} />
        </button>

        {/* Reading Mode & Ambient Sounds Button */}
        <button
          onClick={onOpenReadingMode}
          title="Reading Aids & Ambient Noise"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = '#10b981';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Eye size={16} />
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)', margin: '0 2px' }} />

        {/* Hootly Streak Flame Pill */}
        <div
          onClick={() => {
            if (settings?.soundEffectsEnabled) {
              playSoftHoot();
            }
          }}
          title="Hootly on your streak flame! (Click for gentle hoot)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px 2px 4px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            fontSize: '11px',
            fontWeight: 600,
            color: '#f97316',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <OwlMascot size={24} level={Math.min(5, Math.floor(xp / 100) + 1)} streakDays={streak} isSleepy={isNight} />
          <span>{streak}d streak</span>
        </div>

        {/* XP Badge Pill */}
        <div
          title={`Level ${Math.min(5, Math.floor(xp / 100) + 1)} • ${xp} Total XP`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--accent)',
            cursor: 'default'
          }}
        >
          <Zap size={13} fill="currentColor" />
          <span>{xp} XP</span>
        </div>

        {/* Onboarding Wizard button */}
        <button
          onClick={onOpenOnboarding}
          title="Onboarding & Goals"
          style={{
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
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
          <Compass size={15} />
        </button>

        {/* Settings / Themes Button */}
        <button
          onClick={onOpenSettings}
          title="Themes & Settings (Ctrl+,)"
          style={{
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
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
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
};
