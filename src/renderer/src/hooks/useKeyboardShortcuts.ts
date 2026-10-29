import { useEffect } from 'react';
import { TabInfo } from '@shared/types';

interface KeyboardShortcutsOptions {
  tabs: TabInfo[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCreateTab: () => void;
  onReopenClosedTab: () => void;
  onReload: (ignoreCache?: boolean) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onFocusAddressBar: () => void;
  onToggleSettings?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenParkingLot?: () => void;
}

export function useKeyboardShortcuts({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCreateTab,
  onReopenClosedTab,
  onReload,
  onGoBack,
  onGoForward,
  onFocusAddressBar,
  onToggleSettings,
  onOpenCommandPalette,
  onOpenParkingLot
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Don't intercept text input if typing inside an active input element unless it's a browser global shortcut
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;

      // Check if focus is inside a modal/dialog — skip most shortcuts if so
      const isInsideModal =
        activeElement?.closest('[role="dialog"]') !== null ||
        activeElement?.closest('.modal-overlay') !== null ||
        activeElement?.closest('[data-modal]') !== null;

      // Allow Ctrl+K and Ctrl+Shift+P even from input elements
      if (isCtrlOrMeta && !e.shiftKey && key === 'k' && onOpenCommandPalette) {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      if (isCtrlOrMeta && e.shiftKey && key === 'p' && onOpenParkingLot) {
        e.preventDefault();
        onOpenParkingLot();
        return;
      }

      // Skip all further shortcuts when inside a modal
      if (isInsideModal) {
        return;
      }

      if (isInputFocused && !isCtrlOrMeta && !e.altKey && e.key !== 'F5') {
        return;
      }

      // 1. New Tab: Ctrl + T
      if (isCtrlOrMeta && !e.shiftKey && key === 't') {
        e.preventDefault();
        onCreateTab();
        return;
      }

      // 2. Reopen Closed Tab: Ctrl + Shift + T
      if (isCtrlOrMeta && e.shiftKey && key === 't') {
        e.preventDefault();
        onReopenClosedTab();
        return;
      }

      // 3. Close Tab: Ctrl + W
      if (isCtrlOrMeta && !e.shiftKey && key === 'w') {
        e.preventDefault();
        if (activeTabId) {
          onCloseTab(activeTabId);
        }
        return;
      }

      // 4. Reload: Ctrl + R or F5 — reload the active web tab, NOT the shell
      if ((isCtrlOrMeta && key === 'r') || e.key === 'F5') {
        e.preventDefault();
        const ignoreCache = e.shiftKey || (isCtrlOrMeta && e.key === 'F5');
        onReload(ignoreCache);
        return;
      }

      // 5. Focus Address Bar: Ctrl + L or Alt + D
      if ((isCtrlOrMeta && key === 'l') || (e.altKey && key === 'd')) {
        e.preventDefault();
        onFocusAddressBar();
        return;
      }

      // 6. Navigation: Alt + Left (Back) / Alt + Right (Forward)
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        onGoBack();
        return;
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        onGoForward();
        return;
      }

      // 7. Cycle Tabs: Ctrl + Tab / Ctrl + PageDown (Next)
      if ((isCtrlOrMeta && e.key === 'Tab' && !e.shiftKey) || (isCtrlOrMeta && e.key === 'PageDown')) {
        e.preventDefault();
        if (tabs.length > 1) {
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const nextIndex = (currentIndex + 1) % tabs.length;
          onSelectTab(tabs[nextIndex].id);
        }
        return;
      }

      // 8. Cycle Tabs: Ctrl + Shift + Tab / Ctrl + PageUp (Previous)
      if ((isCtrlOrMeta && e.key === 'Tab' && e.shiftKey) || (isCtrlOrMeta && e.key === 'PageUp')) {
        e.preventDefault();
        if (tabs.length > 1) {
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          onSelectTab(tabs[prevIndex].id);
        }
        return;
      }

      // 9. Jump to Tab: Ctrl + 1..8, Ctrl + 9 (Last tab)
      if (isCtrlOrMeta && !e.shiftKey && !e.altKey) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= 8) {
          const targetIndex = num - 1;
          if (targetIndex < tabs.length) {
            e.preventDefault();
            onSelectTab(tabs[targetIndex].id);
            return;
          }
        } else if (e.key === '9') {
          if (tabs.length > 0) {
            e.preventDefault();
            onSelectTab(tabs[tabs.length - 1].id);
            return;
          }
        }
      }

      // 10. Zoom Controls: Ctrl + Plus, Ctrl + Minus, Ctrl + 0
      if (isCtrlOrMeta && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        const activeTab = tabs.find((t) => t.id === activeTabId);
        const currentZoom = activeTab?.zoomLevel || 0;
        window.studyBrowser?.setZoomLevel(activeTabId, currentZoom + 0.5);
        return;
      }
      if (isCtrlOrMeta && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        const activeTab = tabs.find((t) => t.id === activeTabId);
        const currentZoom = activeTab?.zoomLevel || 0;
        window.studyBrowser?.setZoomLevel(activeTabId, currentZoom - 0.5);
        return;
      }
      if (isCtrlOrMeta && e.key === '0') {
        e.preventDefault();
        window.studyBrowser?.setZoomLevel(activeTabId, 0);
        return;
      }

      // 11. Toggle Settings: Ctrl + ,
      if (isCtrlOrMeta && e.key === ',' && onToggleSettings) {
        e.preventDefault();
        onToggleSettings();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    tabs,
    activeTabId,
    onSelectTab,
    onCloseTab,
    onCreateTab,
    onReopenClosedTab,
    onReload,
    onGoBack,
    onGoForward,
    onFocusAddressBar,
    onToggleSettings,
    onOpenCommandPalette,
    onOpenParkingLot
  ]);
}
