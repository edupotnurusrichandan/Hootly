import React, { useRef } from 'react';
import { TabInfo } from '@shared/types';
import { TabItem } from './TabItem';
import { WindowControls } from './WindowControls';
import { HootlyLogo } from './HootlyLogo';
import { Plus } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

interface TabStripProps {
  tabs: TabInfo[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCreateTab: () => void;
  onContextMenu: (e: React.MouseEvent, tab: TabInfo) => void;
  onToggleMute: (tabId: string) => void;
}

export const TabStrip: React.FC<TabStripProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCreateTab,
  onContextMenu,
  onToggleMute
}) => {
  const { theme } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Horizontal scroll on mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // Double-click empty titlebar space to maximize/restore window
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      window.studyBrowser?.maximizeWindow();
    }
  };

  const pinnedTabs = tabs.filter((t) => t.isPinned);
  const regularTabs = tabs.filter((t) => !t.isPinned);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="drag-region"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        height: '38px',
        padding: '0 8px',
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {/* Brand Icon / Logo */}
      <div
        className="no-drag"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '0 10px 6px 4px',
          color: 'var(--text)',
          fontWeight: 700,
          fontSize: '13px',
          letterSpacing: '-0.3px',
          flexShrink: 0
        }}
      >
        <HootlyLogo size={24} accentColor={theme.gradient.from} />
        <span
          style={{
            fontWeight: 800,
            letterSpacing: '-0.4px',
            background: `linear-gradient(135deg, var(--text), var(--accent))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Hootly
        </span>
      </div>

      {/* Tabs list container */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="no-drag"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '3px',
          overflowX: 'auto',
          flex: 1,
          paddingLeft: '4px',
          scrollbarWidth: 'none',
          maskImage: 'linear-gradient(to right, black calc(100% - 24px), transparent 100%)'
        }}
      >
        {/* Pinned Tabs */}
        {pinnedTabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={() => onSelectTab(tab.id)}
            onClose={(e) => {
              e.stopPropagation();
              onCloseTab(tab.id);
            }}
            onContextMenu={(e) => onContextMenu(e, tab)}
            onToggleMute={(e) => {
              e.stopPropagation();
              onToggleMute(tab.id);
            }}
          />
        ))}

        {pinnedTabs.length > 0 && regularTabs.length > 0 && (
          <div
            style={{
              width: '1px',
              height: '18px',
              backgroundColor: 'var(--border)',
              margin: '0 4px 6px 4px',
              flexShrink: 0
            }}
          />
        )}

        {/* Regular Tabs */}
        {regularTabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={() => onSelectTab(tab.id)}
            onClose={(e) => {
              e.stopPropagation();
              onCloseTab(tab.id);
            }}
            onContextMenu={(e) => onContextMenu(e, tab)}
            onToggleMute={(e) => {
              e.stopPropagation();
              onToggleMute(tab.id);
            }}
          />
        ))}

        {/* New Tab Button */}
        <button
          onClick={onCreateTab}
          title="New Tab (Ctrl+T)"
          style={{
            width: '28px',
            height: '28px',
            marginBottom: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-muted)',
            flexShrink: 0,
            transition: 'all 0.12s ease'
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
          <Plus size={15} />
        </button>
      </div>

      {/* Custom Window Controls */}
      <WindowControls />
    </div>
  );
};
