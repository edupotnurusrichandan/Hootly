import { contextBridge, ipcRenderer } from 'electron';
import { StudyBrowserAPI, TabInfo, TabsState, UserSettings } from '../shared/types';

const api: StudyBrowserAPI = {
  minimizeWindow: () => {
    ipcRenderer.send('window:minimize');
  },
  maximizeWindow: () => {
    ipcRenderer.send('window:maximize');
  },
  closeWindow: () => {
    ipcRenderer.send('window:close');
  },
  isWindowMaximized: () => {
    return ipcRenderer.invoke('window:is-maximized');
  },

  getTabsState: () => {
    return ipcRenderer.invoke('tabs:get-state');
  },
  createTab: (url?: string) => {
    return ipcRenderer.invoke('tab:create', url);
  },
  closeTab: (tabId: string) => {
    return ipcRenderer.invoke('tab:close', tabId);
  },
  switchTab: (tabId: string) => {
    return ipcRenderer.invoke('tab:switch', tabId);
  },
  navigateTab: (tabId: string, url: string) => {
    return ipcRenderer.invoke('tab:navigate', tabId, url);
  },
  goBackTab: (tabId: string) => {
    return ipcRenderer.invoke('tab:go-back', tabId);
  },
  goForwardTab: (tabId: string) => {
    return ipcRenderer.invoke('tab:go-forward', tabId);
  },
  reloadTab: (tabId: string) => {
    return ipcRenderer.invoke('tab:reload', tabId);
  },
  duplicateTab: (tabId: string) => {
    return ipcRenderer.invoke('tab:duplicate', tabId);
  },
  pinTab: (tabId: string) => {
    return ipcRenderer.invoke('tab:pin', tabId);
  },
  muteTab: (tabId: string) => {
    return ipcRenderer.invoke('tab:mute', tabId);
  },
  reopenClosedTab: () => {
    return ipcRenderer.invoke('tab:reopen-closed');
  },
  closeOtherTabs: (tabId: string) => {
    return ipcRenderer.invoke('tab:close-others', tabId);
  },
  closeTabsToRight: (tabId: string) => {
    return ipcRenderer.invoke('tab:close-right', tabId);
  },
  reorderTabs: (sourceIndex: number, destIndex: number) => {
    return ipcRenderer.invoke('tab:reorder', sourceIndex, destIndex);
  },
  setZoomLevel: (tabId: string, zoom: number) => {
    return ipcRenderer.invoke('tab:set-zoom', tabId, zoom);
  },
  showTabContextMenu: (tabId: string, x: number, y: number) => {
    return ipcRenderer.invoke('tab:show-context-menu', tabId, x, y);
  },

  getSettings: () => {
    return ipcRenderer.invoke('settings:get');
  },
  saveSettings: (settings: Partial<UserSettings>) => {
    return ipcRenderer.invoke('settings:save', settings);
  },

  getThemes: () => {
    return ipcRenderer.invoke('themes:get');
  },

  recordStudySession: (session) => {
    return ipcRenderer.invoke('study:record-session', session);
  },

  getWeeklyReview: () => {
    return ipcRenderer.invoke('study:get-weekly-review');
  },

  saveCredential: (host, username, password) => {
    return ipcRenderer.invoke('credentials:save', host, username, password);
  },

  getCredential: (host) => {
    return ipcRenderer.invoke('credentials:get', host);
  },

  listCredentials: () => {
    return ipcRenderer.invoke('credentials:list');
  },

  deleteCredential: (host) => {
    return ipcRenderer.invoke('credentials:delete', host);
  },

  onTabsUpdated: (callback: (data: TabsState) => void) => {
    const handler = (_event: any, data: TabsState) => callback(data);
    ipcRenderer.on('tabs:updated', handler);
    return () => {
      ipcRenderer.removeListener('tabs:updated', handler);
    };
  },
  onTabUpdated: (callback: (tab: TabInfo) => void) => {
    const handler = (_event: any, tab: TabInfo) => callback(tab);
    ipcRenderer.on('tab:updated', handler);
    return () => {
      ipcRenderer.removeListener('tab:updated', handler);
    };
  },
  onSettingsUpdated: (callback: (settings: UserSettings) => void) => {
    const handler = (_event: any, settings: UserSettings) => callback(settings);
    ipcRenderer.on('settings:updated', handler);
    return () => {
      ipcRenderer.removeListener('settings:updated', handler);
    };
  },
  onWindowMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_event: any, isMaximized: boolean) => callback(isMaximized);
    ipcRenderer.on('window:maximize-change', handler);
    return () => {
      ipcRenderer.removeListener('window:maximize-change', handler);
    };
  },

  captureScreenshot: (name: string) => {
    return ipcRenderer.invoke('app:capture-screenshot', name);
  }
};

contextBridge.exposeInMainWorld('studyBrowser', api);
