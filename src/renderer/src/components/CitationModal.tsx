import React, { useState } from 'react';
import { TabInfo } from '@shared/types';
import { X, Copy, Check, Quote } from 'lucide-react';

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabInfo | null;
}

type CitationStyle = 'apa' | 'mla' | 'chicago' | 'bibtex';

export const CitationModal: React.FC<CitationModalProps> = ({ isOpen, onClose, activeTab }) => {
  const [style, setStyle] = useState<CitationStyle>('apa');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const url = activeTab?.url || 'https://en.wikipedia.org/wiki/Active_recall';
  let hostname = 'Website';
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // ignore
  }

  const title = activeTab?.title || 'Study Article';
  const accessDate = new Date();
  const year = accessDate.getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const formattedDate = `${accessDate.getDate()} ${monthNames[accessDate.getMonth()]} ${year}`;

  const getCitation = (format: CitationStyle): string => {
    switch (format) {
      case 'apa':
        // APA 7: Author / Organization. (Year). Title. Website Name. URL
        return `${hostname}. (${year}). ${title}. ${url}`;
      case 'mla':
        // MLA 9: "Title." Website Name, URL. Accessed Day Month Year.
        return `"${title}." ${hostname}, ${url}. Accessed ${formattedDate}.`;
      case 'chicago':
        // Chicago 17: "Title." Website Name. Accessed Month Day, Year. URL.
        return `"${title}." ${hostname}. Accessed ${monthNames[accessDate.getMonth()]} ${accessDate.getDate()}, ${year}. ${url}.`;
      case 'bibtex':
        // BibTeX @misc
        return `@misc{${hostname.replace(/[^a-zA-Z0-9]/g, '')}_${year},
  title = {${title}},
  howpublished = {\\url{${url}}},
  note = {Accessed: ${formattedDate}},
  year = {${year}}
}`;
      default:
        return '';
    }
  };

  const citationText = getCitation(style);

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          width: '560px',
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
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Quote size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                Cite Current Page
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                Instant student citation for papers, essays, and bibliographies
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

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Style selector pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {(
              [
                { id: 'apa', label: 'APA 7th' },
                { id: 'mla', label: 'MLA 9th' },
                { id: 'chicago', label: 'Chicago' },
                { id: 'bibtex', label: 'BibTeX' }
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid var(--border)',
                  backgroundColor: style === s.id ? 'var(--accent)' : 'var(--bg)',
                  color: style === s.id ? '#ffffff' : 'var(--text)'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Citation Text Preview Box */}
          <div
            style={{
              position: 'relative',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              fontFamily: style === 'bibtex' ? 'monospace' : 'inherit',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text)',
              minHeight: '80px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {citationText}
          </div>

          {/* Copy Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: copied ? '#10b981' : 'var(--accent)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'background-color 0.2s ease'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Citation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
