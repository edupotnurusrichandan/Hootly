import React, { useEffect, useRef } from 'react';
import { TabInfo } from '@shared/types';
import {
  RotateCw,
  Copy,
  Pin,
  PinOff,
  Volume2,
  VolumeX,
  Plus,
  X,
  XCircle,
  ArrowRightToLine,
  Undo2
} from 'lucide-react';

export interface TabContextMenuPosition {
  x: number;
  y: number;
  tab: TabInfo;
}

interface TabContextMenuProps {
  position: TabContextMenuPosition | null;
  onClose: () => void;
  onReload: (tabId: string) => void;
  onDuplicate: (tabId: string) => void;
  onPin: (tabId: string) => void;
  onMute: (tabId: string) => void;
  onNewTabRight: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCloseOthers: (tabId: string) => void;
  onCloseRight: (tabId: string) => void;
  onReopenClosed: () => void;
}

export const TabContextMenu: React.FC<TabContextMenuProps> = ({
  position,
  onClose,
  onReload,
  onDuplicate,
  onPin,
  onMute,
  onNewTabRight,
  onCloseTab,
  onCloseOthers,
  onCloseRight,
  onReopenClosed
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (position) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [position, onClose]);

  if (!position) return null;

  const { x, y, tab } = position;

  // Prevent context menu from overflowing the screen
  const adjustedX = Math.max(8, Math.min(x, window.innerWidth - 220));
  const adjustedY = Math.max(8, Math.min(y, window.innerHeight - 340));

  const menuItems = [
    {
      label: 'Reload Tab',
      icon: RotateCw,
      shortcut: 'Ctrl+R',
      action: () => onReload(tab.id)
    },
    {
      label: 'Duplicate Tab',
      icon: Copy,
      action: () => onDuplicate(tab.id)
    },
    {
      label: tab.isPinned ? 'Unpin Tab' : 'Pin Tab',
      icon: tab.isPinned ? PinOff : Pin,
      action: () => onPin(tab.id)
    },
    {
      label: tab.isMuted ? 'Unmute Tab' : 'Mute Tab',
      icon: tab.isMuted ? Volume2 : VolumeX,
      action: () => onMute(tab.id)
    },
    {
      label: 'New Tab to the Right',
      icon: Plus,
      action: () => onNewTabRight(tab.id)
    },
    { separator: true },
    {
      label: 'Close Tab',
      icon: X,
      shortcut: 'Ctrl+W',
      danger: true,
      action: () => onCloseTab(tab.id)
    },
    {
      label: 'Close Other Tabs',
      icon: XCircle,
      action: () => onCloseOthers(tab.id)
    },
    {
      label: 'Close Tabs to the Right',
      icon: ArrowRightToLine,
      action: () => onCloseRight(tab.id)
    },
    {
      label: 'Reopen Closed Tab',
      icon: Undo2,
      shortcut: 'Ctrl+Shift+T',
      action: () => onReopenClosed()
    }
  ];

  return (
    <div
      ref={menuRef}
      className="animate-fade-in no-drag"
      style={{
        position: 'fixed',
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        width: '210px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        padding: '6px',
        zIndex: 9999,
        maxHeight: 'calc(100vh - 16px)',
        overflowY: 'auto',
        backdropFilter: 'blur(10px)',
        userSelect: 'none'
      }}
    >
      {menuItems.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={index}
              style={{
                height: '1px',
                backgroundColor: 'var(--border)',
                margin: '5px 4px'
              }}
            />
          );
        }

        const Icon = item.icon!;
        return (
          <button
            key={item.label}
            onClick={() => {
              item.action!();
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
              color: item.danger ? '#f87171' : 'var(--text)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 0.12s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = item.danger ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon size={14} style={{ color: item.danger ? '#ef4444' : 'var(--accent)' }} />
              <span>{item.label}</span>
            </div>

            {item.shortcut && (
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
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
