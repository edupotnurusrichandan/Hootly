import React, { useEffect, useState } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

export const WindowControls: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.studyBrowser) {
      window.studyBrowser.isWindowMaximized().then(setIsMaximized);
      const unsubscribe = window.studyBrowser.onWindowMaximizeChange((max) => {
        setIsMaximized(max);
      });
      return () => unsubscribe();
    }
  }, []);

  const handleMinimize = () => window.studyBrowser?.minimizeWindow();
  const handleMaximize = () => window.studyBrowser?.maximizeWindow();
  const handleClose = () => window.studyBrowser?.closeWindow();

  return (
    <div className="no-drag" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '2px' }}>
      <button
        onClick={handleMinimize}
        title="Minimize"
        style={{
          width: '36px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
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
        <Minus size={14} />
      </button>

      <button
        onClick={handleMaximize}
        title={isMaximized ? 'Restore' : 'Maximize'}
        style={{
          width: '36px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
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
        {isMaximized ? <Copy size={13} style={{ transform: 'rotate(180deg)' }} /> : <Square size={13} />}
      </button>

      <button
        onClick={handleClose}
        title="Close"
        style={{
          width: '38px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-muted)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ef4444';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};
