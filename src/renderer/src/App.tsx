import React, { useState, useEffect, useRef } from 'react';
import { TabInfo, TabsState } from '@shared/types';
import { TabStrip } from './components/TabStrip';
import { Toolbar } from './components/Toolbar';
import { DashboardPage } from './components/DashboardPage';
import { BrowserInternalPage } from './components/BrowserInternalPage';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { CommandPalette } from './components/CommandPalette';
import { ParkingLotModal } from './components/ParkingLotModal';
import { CitationModal } from './components/CitationModal';
import { ReadingModeModal } from './components/ReadingModeModal';
import { StudyTimerModal } from './components/StudyTimerModal';
import { FocusRuler } from './components/FocusRuler';
import { StartupSplash } from './components/StartupSplash';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './theme/ThemeContext';

export const App: React.FC = () => {
  const { settings } = useTheme();
  const addressBarRef = useRef<HTMLInputElement>(null);

  const [tabs, setTabs] = useState<TabInfo[]>([
    {
      id: 'tab_initial',
      url: 'hootly://dashboard',
      title: 'Dashboard',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      isNewTab: true,
      isPinned: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab_initial');

  // Modals state
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isParkingLotOpen, setIsParkingLotOpen] = useState<boolean>(false);
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [isCitationOpen, setIsCitationOpen] = useState<boolean>(false);
  const [isReadingModeOpen, setIsReadingModeOpen] = useState<boolean>(false);


  // Sync tab state with Main process
  useEffect(() => {
    if (window.studyBrowser) {
      // Query initial state immediately to avoid any startup race conditions
      window.studyBrowser.getTabsState().then((state) => {
        if (state && state.tabs.length > 0) {
          setTabs(state.tabs);
          setActiveTabId(state.activeTabId);
        }
      }).catch(() => {
        // Fallback to initial state
      });

      const unsubscribeTabs = window.studyBrowser.onTabsUpdated((state: TabsState) => {
        setTabs(state.tabs);
        setActiveTabId(state.activeTabId);
      });

      const unsubscribeTab = window.studyBrowser.onTabUpdated((updatedTab: TabInfo) => {
        setTabs((prev) =>
          prev.map((t) => (t.id === updatedTab.id ? { ...t, ...updatedTab } : t))
        );
      });

      return () => {
        unsubscribeTabs();
        unsubscribeTab();
      };
    }
  }, []);

  // Show onboarding on first launch if not completed
  useEffect(() => {
    if (settings && settings.hasCompletedOnboarding === false) {
      setIsOnboardingOpen(true);
    }
  }, [settings?.hasCompletedOnboarding]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || null;

  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
    window.studyBrowser?.switchTab(id);
  };

  const handleCloseTab = (id: string) => {
    window.studyBrowser?.closeTab(id);
  };

  const handleCreateTab = () => {
    window.studyBrowser?.createTab('hootly://dashboard');
  };

  const handleNavigate = (url: string) => {
    if (activeTabId) {
      window.studyBrowser?.navigateTab(activeTabId, url);
    }
  };

  const handleGoBack = () => {
    if (activeTabId) window.studyBrowser?.goBackTab(activeTabId);
  };

  const handleGoForward = () => {
    if (activeTabId) window.studyBrowser?.goForwardTab(activeTabId);
  };

  const handleReload = () => {
    if (activeTabId) window.studyBrowser?.reloadTab(activeTabId);
  };

  const handleGoHome = () => {
    if (activeTabId) window.studyBrowser?.navigateTab(activeTabId, 'hootly://dashboard');
  };

  const handleReopenClosedTab = () => {
    window.studyBrowser?.reopenClosedTab();
  };

  const handleMuteTab = (tabId: string) => {
    window.studyBrowser?.muteTab(tabId);
  };

  const handleContextMenu = (e: React.MouseEvent, tab: TabInfo) => {
    e.preventDefault();
    void window.studyBrowser?.showTabContextMenu(tab.id, e.clientX, e.clientY);
  };

  // Keyboard shortcuts engine
  useKeyboardShortcuts({
    tabs,
    activeTabId,
    onSelectTab: handleSelectTab,
    onCloseTab: handleCloseTab,
    onCreateTab: handleCreateTab,
    onReopenClosedTab: handleReopenClosedTab,
    onReload: handleReload,
    onGoBack: handleGoBack,
    onGoForward: handleGoForward,
    onFocusAddressBar: () => addressBarRef.current?.focus(),
    onToggleSettings: () => handleNavigate('hootly://settings'),
    onOpenCommandPalette: () => setIsCommandPaletteOpen((prev) => !prev),
    onOpenParkingLot: () => setIsParkingLotOpen((prev) => !prev)
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg)'
      }}
    >
      {/* Top Shell (Tab Strip + Toolbar) */}
      <div style={{ flexShrink: 0, zIndex: 10 }}>
        <TabStrip
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onCreateTab={handleCreateTab}
          onContextMenu={handleContextMenu}
          onToggleMute={handleMuteTab}
        />

        <Toolbar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
          onReload={handleReload}
          onGoHome={handleGoHome}
          onOpenSettings={() => handleNavigate('hootly://settings')}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenTimer={() => setIsTimerOpen(true)}
          onOpenParkingLot={() => setIsParkingLotOpen(true)}
          onOpenCitation={() => setIsCitationOpen(true)}
          onOpenReadingMode={() => setIsReadingModeOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          addressBarRef={addressBarRef}
        />
      </div>

      {/* Main Area: If active tab is New Tab, render Home Dashboard */}
      {activeTab?.isNewTab && (activeTab.url === 'hootly://dashboard' || activeTab.url === 'study://newtab' ? (
        <DashboardPage onNavigate={handleNavigate} />
      ) : (
        <BrowserInternalPage activeTab={activeTab} onNavigate={handleNavigate} onOpenAppearance={() => setIsSettingsOpen(true)} />
      ))}

      {/* Focus Ruler (Accessibility overlay tracking mouse) */}
      <FocusRuler />

      {/* Modals & Tools */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCreateTab={handleCreateTab}
        onOpenParkingLot={() => setIsParkingLotOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenCitation={() => setIsCitationOpen(true)}
        onOpenReadingMode={() => setIsReadingModeOpen(true)}
        onReplayIntro={() => setShowSplash(true)}
        onNavigate={handleNavigate}
      />

      <ParkingLotModal
        isOpen={isParkingLotOpen}
        onClose={() => setIsParkingLotOpen(false)}
      />

      <StudyTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />

      <CitationModal
        isOpen={isCitationOpen}
        onClose={() => setIsCitationOpen(false)}
        activeTab={activeTab}
      />

      <ReadingModeModal
        isOpen={isReadingModeOpen}
        onClose={() => setIsReadingModeOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Opera-Style Startup Opening Animation */}
      {showSplash && (
        <StartupSplash onComplete={() => setShowSplash(false)} />
      )}
    </div>
  );
};
