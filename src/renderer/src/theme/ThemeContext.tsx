import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeDefinition, ThemeMode, UserSettings } from '@shared/types';
import { ALL_THEMES, THEMES_BY_ID, DEFAULT_THEME_ID } from '@themes/index';

interface ThemeContextType {
  theme: ThemeDefinition;
  themeId: string;
  setThemeId: (id: string) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  effectiveMode: 'light' | 'dark';
  allThemes: ThemeDefinition[];
  settings: UserSettings | null;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [effectiveMode, setEffectiveMode] = useState<'light' | 'dark'>('dark');
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Load initial settings
  useEffect(() => {
    if (window.studyBrowser) {
      window.studyBrowser.getSettings().then((s) => {
        setSettings(s);
        if (s.themeId && THEMES_BY_ID[s.themeId]) {
          setThemeIdState(s.themeId);
        }
        if (s.themeMode) {
          setThemeModeState(s.themeMode);
        }
      });

      const unsubscribe = window.studyBrowser.onSettingsUpdated((newSettings) => {
        setSettings(newSettings);
        if (newSettings.themeId && THEMES_BY_ID[newSettings.themeId]) {
          setThemeIdState(newSettings.themeId);
        }
        if (newSettings.themeMode) {
          setThemeModeState(newSettings.themeMode);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // Track system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateEffective = () => {
      if (themeMode === 'system') {
        setEffectiveMode(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setEffectiveMode(themeMode);
      }
    };

    updateEffective();
    mediaQuery.addEventListener('change', updateEffective);
    return () => mediaQuery.removeEventListener('change', updateEffective);
  }, [themeMode]);

  const activeTheme = THEMES_BY_ID[themeId] || THEMES_BY_ID[DEFAULT_THEME_ID] || ALL_THEMES[0];

  // Apply CSS variable tokens to document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    const palette = effectiveMode === 'dark' ? activeTheme.dark : activeTheme.light;

    root.style.setProperty('--bg', palette.bg);
    root.style.setProperty('--surface', palette.surface);
    root.style.setProperty('--surface-hover', palette.surfaceHover || (effectiveMode === 'dark' ? '#1f2937' : '#f3f4f6'));
    root.style.setProperty('--border', palette.border || (effectiveMode === 'dark' ? '#374151' : '#e5e7eb'));
    root.style.setProperty('--text', palette.text);
    root.style.setProperty('--text-muted', palette.textMuted || (effectiveMode === 'dark' ? '#9ca3af' : '#6b7280'));
    root.style.setProperty('--accent', palette.accent);
    root.style.setProperty('--accent-hover', palette.accentHover || palette.accent);
    root.style.setProperty('--grad-from', activeTheme.gradient.from);
    root.style.setProperty('--grad-to', activeTheme.gradient.to);

    root.setAttribute('data-theme', activeTheme.id);
    root.setAttribute('data-mode', effectiveMode);
  }, [activeTheme, effectiveMode]);

  useEffect(() => {
    document.documentElement.dataset.highContrast = settings?.highContrastMode ? 'true' : 'false';
    document.body.classList.toggle('high-legibility-font', Boolean(settings?.dyslexiaFontEnabled));
  }, [settings?.highContrastMode, settings?.dyslexiaFontEnabled]);

  const setThemeId = (newId: string) => {
    if (THEMES_BY_ID[newId]) {
      setThemeIdState(newId);
      if (window.studyBrowser) {
        window.studyBrowser.saveSettings({ themeId: newId });
      }
    }
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setThemeModeState(newMode);
    if (window.studyBrowser) {
      window.studyBrowser.saveSettings({ themeMode: newMode });
    }
  };

  const updateSettings = async (partial: Partial<UserSettings>) => {
    if (window.studyBrowser) {
      const updated = await window.studyBrowser.saveSettings(partial);
      setSettings(updated);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        themeId,
        setThemeId,
        themeMode,
        setThemeMode,
        effectiveMode,
        allThemes: ALL_THEMES,
        settings,
        updateSettings
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
