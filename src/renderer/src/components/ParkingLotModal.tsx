import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { ParkingLotItem } from '@shared/types';
import { X, Plus, CheckCircle2, Circle, Trash2, StickyNote, ShieldAlert } from 'lucide-react';
import { playSoftHoot } from '../utils/audio';

interface ParkingLotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParkingLotModal: React.FC<ParkingLotModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useTheme();
  const [newThought, setNewThought] = useState('');

  if (!isOpen) return null;

  const items = settings?.parkingLot || [];

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newThought.trim()) return;

    const newItem: ParkingLotItem = {
      id: `thought-${Date.now()}`,
      text: newThought.trim(),
      createdAt: Date.now(),
      isDone: false
    };

    updateSettings({
      parkingLot: [newItem, ...items]
    });
    setNewThought('');
    if (settings?.soundEffectsEnabled) {
      playSoftHoot();
    }
  };

  const handleToggle = (id: string) => {
    const updated = items.map((it) => (it.id === id ? { ...it, isDone: !it.isDone } : it));
    updateSettings({ parkingLot: updated });
  };

  const handleDelete = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    updateSettings({ parkingLot: updated });
  };

  const handleClearCompleted = () => {
    const updated = items.filter((it) => !it.isDone);
    updateSettings({ parkingLot: updated });
  };

  const activeCount = items.filter((it) => !it.isDone).length;

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
          width: '520px',
          maxWidth: '92vw',
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
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                color: '#eab308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <StickyNote size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                Distraction Parking Lot
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                Park thoughts here so you can stay in deep study flow (Ctrl+Shift+P)
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

        {/* Tip Box */}
        <div
          style={{
            margin: '14px 18px 4px 18px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <ShieldAlert size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Got an urge to check a score, buy an item, or text a friend? Park it here. You can check these safely during your scheduled break!
          </span>
        </div>

        {/* New Item Input */}
        <form
          onSubmit={handleAdd}
          style={{
            padding: '14px 18px',
            display: 'flex',
            gap: '8px'
          }}
        >
          <input
            type="text"
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            placeholder="Type a stray thought and press Enter..."
            autoFocus
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!newThought.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
              opacity: newThought.trim() ? 1 : 0.6,
              cursor: newThought.trim() ? 'pointer' : 'default'
            }}
          >
            <Plus size={16} />
            <span>Park</span>
          </button>
        </form>

        {/* List of parked items */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 18px 14px 18px',
            maxHeight: '340px'
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 12px',
                color: 'var(--text-muted)',
                fontSize: '13px'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌱</div>
              <div>Your parking lot is empty. Clean mind, clear focus!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    transition: 'opacity 0.2s ease',
                    opacity: item.isDone ? 0.5 : 1
                  }}
                >
                  <button
                    onClick={() => handleToggle(item.id)}
                    style={{
                      background: 'transparent',
                      color: item.isDone ? 'var(--accent)' : 'var(--text-muted)',
                      padding: 0,
                      display: 'flex'
                    }}
                  >
                    {item.isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--text)',
                        textDecoration: item.isDone ? 'line-through' : 'none',
                        wordBreak: 'break-word'
                      }}
                    >
                      {item.text}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Remove thought"
                    style={{
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg)',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}
        >
          <span>
            {activeCount} active {activeCount === 1 ? 'thought' : 'thoughts'} parked
          </span>

          {items.some((it) => it.isDone) && (
            <button
              onClick={handleClearCompleted}
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: 'transparent',
                textDecoration: 'underline'
              }}
            >
              Clear completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
