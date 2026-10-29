import React, { useState, useEffect, useRef } from 'react';
import { TabInfo } from '@shared/types';
import {
  Lock,
  Search,
  Sparkles,
  X,
  Copy,
  Check,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ZoomIn
} from 'lucide-react';

interface AddressBarProps {
  activeTab: TabInfo | null;
  onNavigate: (url: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const AddressBar: React.FC<AddressBarProps> = ({ activeTab, onNavigate, inputRef }) => {
  const localInputRef = useRef<HTMLInputElement>(null);
  const actualInputRef = inputRef || localInputRef;

  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSecurityPopover, setShowSecurityPopover] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeTab) {
      if (activeTab.url === 'study://newtab') {
        setInputValue('');
      } else {
        setInputValue(activeTab.url);
      }
    }
  }, [activeTab?.url, activeTab?.isNewTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onNavigate(inputValue.trim());
      actualInputRef.current?.blur();
      setIsFocused(false);
    }
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTab?.url && activeTab.url !== 'study://newtab') {
      navigator.clipboard.writeText(activeTab.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTab) {
      window.studyBrowser?.setZoomLevel(activeTab.id, 0);
    }
  };

  const isSecure = activeTab?.url.startsWith('https://');
  const isNewTab = activeTab?.isNewTab || !activeTab?.url || activeTab.url === 'study://newtab' || activeTab.url.startsWith('hootly://');
  const zoomPercent = activeTab?.zoomLevel ? Math.round((1 + activeTab.zoomLevel * 0.2) * 100) : 100;

  const quickSearchEngines = [
    { name: 'Google', prefix: 'https://www.google.com/search?q=' },
    { name: 'Google Scholar', prefix: 'https://scholar.google.com/scholar?q=' },
    { name: 'Wikipedia', prefix: 'https://en.wikipedia.org/wiki/Special:Search?search=' }
  ];

  return (
    <div
      className="no-drag"
      style={{
        flex: 1,
        maxWidth: '720px',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div
          style={{
            width: '100%',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg)',
            border: isFocused ? '1.5px solid var(--accent)' : '1px solid var(--border)',
            boxShadow: isFocused ? '0 0 0 2px rgba(45, 212, 191, 0.18)' : 'none',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
        >
          {/* Security / Search Icon Button */}
          <button
            type="button"
            onClick={() => {
              if (!isNewTab) setShowSecurityPopover(!showSecurityPopover);
            }}
            title={isSecure ? 'Connection is secure (Click for info)' : 'Search the web'}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: isSecure ? 'var(--accent)' : 'var(--text-muted)',
              cursor: isNewTab ? 'default' : 'pointer'
            }}
          >
            {isNewTab ? (
              <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            ) : isSecure ? (
              <Lock size={13} />
            ) : (
              <Search size={14} />
            )}
          </button>

          {/* URL Input */}
          <input
            ref={actualInputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              // Select all on focus
              setTimeout(() => actualInputRef.current?.select(), 50);
            }}
            onBlur={() => {
              // Delay blur so clicks on suggestions register
              setTimeout(() => setIsFocused(false), 200);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsFocused(false);
                setInputValue(activeTab?.url || '');
                actualInputRef.current?.blur();
              }
            }}
            placeholder="Search the web or enter study URL... (Ctrl+L)"
            style={{
              flex: 1,
              fontSize: '13px',
              color: 'var(--text)',
              outline: 'none',
              background: 'transparent'
            }}
          />

          {/* Zoom badge indicator (if zoomed) */}
          {zoomPercent !== 100 && (
            <button
              type="button"
              onClick={handleResetZoom}
              title={`Zoom level: ${zoomPercent}%. Click to reset.`}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent)',
                backgroundColor: 'var(--surface)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <ZoomIn size={11} />
              <span>{zoomPercent}%</span>
            </button>
          )}

          {/* Copy URL button */}
          {!isNewTab && (
            <button
              type="button"
              onClick={handleCopyUrl}
              title={copied ? 'Copied!' : 'Copy URL'}
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-full)',
                color: copied ? 'var(--accent)' : 'var(--text-muted)',
                opacity: 0.7
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          )}

          {/* Clear input button if typed */}
          {inputValue && isFocused && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                actualInputRef.current?.focus();
              }}
              style={{
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-muted)'
              }}
            >
              <X size={12} />
            </button>
          )}

          {/* Loading Progress Bar */}
          {activeTab?.isLoading && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2px',
                width: '100%',
                background: `linear-gradient(90deg, var(--grad-from), var(--grad-to))`,
                animation: 'pulseSlow 1.5s ease-in-out infinite'
              }}
            />
          )}
        </div>
      </form>

      {/* Dropdown Suggestions when Address Bar is Focused */}
      {isFocused && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: '40px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '8px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {inputValue ? (
            quickSearchEngines.map((engine) => (
              <button
                key={engine.name}
                type="button"
                onMouseDown={() => {
                  onNavigate(engine.prefix + encodeURIComponent(inputValue));
                  setIsFocused(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Search size={14} style={{ color: 'var(--accent)' }} />
                <span>
                  Search <strong>{engine.name}</strong> for &ldquo;{inputValue}&rdquo;
                </span>
              </button>
            ))
          ) : (
            <div style={{ padding: '6px 10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Quick Search Destinations
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
                {[
                  { name: 'Google Scholar', url: 'https://scholar.google.com', icon: GraduationCap },
                  { name: 'Wikipedia', url: 'https://en.wikipedia.org', icon: BookOpen },
                  { name: 'arXiv Preprints', url: 'https://arxiv.org', icon: Search }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onMouseDown={() => {
                        onNavigate(item.url);
                        setIsFocused(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      <Icon size={13} style={{ color: 'var(--accent)' }} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Certificate / Info Popover */}
      {showSecurityPopover && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: '40px',
            left: 0,
            width: '280px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '16px',
            zIndex: 1000
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
              Encrypted connection
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px' }}>
            HTTPS encrypts traffic between this browser and the site. Check the site name before entering personal information.
          </p>

          <div
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--bg)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}
          >
            🛡️ <strong>StudyBrowser Privacy:</strong> Local-first storage active. No external browsing telemetry is tracked.
          </div>

          <button
            type="button"
            onClick={() => setShowSecurityPopover(false)}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-hover)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text)'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
