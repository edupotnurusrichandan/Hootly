import React, { useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';

export const FocusRuler: React.FC = () => {
  const { settings } = useTheme();
  const [mouseY, setMouseY] = useState<number | null>(null);

  useEffect(() => {
    if (!settings?.readingRulerEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [settings?.readingRulerEnabled]);

  if (!settings?.readingRulerEnabled || mouseY === null) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: `${mouseY - 18}px`,
        height: '36px',
        backgroundColor: 'rgba(234, 179, 8, 0.12)',
        borderTop: '1px solid rgba(234, 179, 8, 0.3)',
        borderBottom: '1px solid rgba(234, 179, 8, 0.3)',
        pointerEvents: 'none',
        zIndex: 9000,
        transition: 'top 0.05s ease-out'
      }}
    />
  );
};
