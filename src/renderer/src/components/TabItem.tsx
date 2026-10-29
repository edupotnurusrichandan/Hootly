import React from 'react';
import { TabInfo } from '@shared/types';
import { X, Globe, Sparkles, Loader2, Volume2, VolumeX, Pin } from 'lucide-react';

interface TabItemProps {
  tab: TabInfo;
  isActive: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onToggleMute: (e: React.MouseEvent) => void;
}

export const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  onSelect,
  onClose,
  onContextMenu,
  onToggleMute
}) => {
  // Middle click to close tab (standard browser UX)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      onClose(e);
    }
  };

  if (tab.isPinned) {
    return (
      <div
        onClick={onSelect}
        onMouseDown={handleMouseDown}
        onContextMenu={onContextMenu}
        className="no-drag"
        title={`${tab.title || 'Pinned Tab'} (Pinned)`}
        style={{
          width: '34px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          backgroundColor: isActive ? 'var(--surface)' : 'transparent',
          color: isActive ? 'var(--text)' : 'var(--text-muted)',
          cursor: 'pointer',
          position: 'relative',
          boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
          borderTop: isActive ? '2px solid var(--accent)' : '2px solid transparent',
          flexShrink: 0,
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--text)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }
        }}
      >
        {tab.isLoading ? (
          <Loader2 size={13} className="animate-spin" style={{ color: 'var(--accent)' }} />
        ) : tab.favicon ? (
          <img
            src={tab.favicon}
            alt=""
            style={{ width: '15px', height: '15px', borderRadius: '3px' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Pin size={13} style={{ color: 'var(--accent)', transform: 'rotate(45deg)' }} />
        )}

        {/* Audio speaker badge if playing */}
        {tab.isAudioPlaying && (
          <button
            onClick={onToggleMute}
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '14px',
              height: '14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}
          >
            {tab.isMuted ? <VolumeX size={9} /> : <Volume2 size={9} />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      onMouseDown={handleMouseDown}
      onContextMenu={onContextMenu}
      className="no-drag"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 10px',
        height: '32px',
        minWidth: '120px',
        maxWidth: '200px',
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
        backgroundColor: isActive ? 'var(--surface)' : 'transparent',
        color: isActive ? 'var(--text)' : 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '12.5px',
        fontWeight: isActive ? 600 : 400,
        position: 'relative',
        boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
        transition: 'all 0.15s ease',
        borderTop: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        flex: '1 1 auto'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          e.currentTarget.style.color = 'var(--text)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
    >
      {/* Favicon or status icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {tab.isLoading ? (
          <Loader2 size={13} className="animate-spin" style={{ color: 'var(--accent)' }} />
        ) : tab.favicon ? (
          <img
            src={tab.favicon}
            alt=""
            style={{ width: '14px', height: '14px', borderRadius: '3px' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : tab.isNewTab ? (
          <Sparkles size={13} style={{ color: 'var(--accent)' }} />
        ) : (
          <Globe size={13} style={{ color: 'var(--text-muted)' }} />
        )}
      </div>

      {/* Tab Title */}
      <span
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1
        }}
        title={tab.title || (tab.isNewTab ? 'New Tab' : tab.url)}
      >
        {tab.title || (tab.isNewTab ? 'New Tab' : 'Study')}
      </span>

      {/* Audio Indicator */}
      {tab.isAudioPlaying && (
        <button
          onClick={onToggleMute}
          title={tab.isMuted ? 'Unmute Tab' : 'Mute Tab'}
          style={{
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            color: tab.isMuted ? 'var(--text-muted)' : 'var(--accent)',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {tab.isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        title="Close tab (Ctrl+W)"
        style={{
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-full)',
          color: 'var(--text-muted)',
          flexShrink: 0,
          opacity: isActive ? 0.9 : 0.6
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          e.currentTarget.style.backgroundColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.opacity = isActive ? '0.9' : '0.6';
        }}
      >
        <X size={11} />
      </button>
    </div>
  );
};
