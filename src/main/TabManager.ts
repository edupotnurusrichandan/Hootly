import { BrowserWindow, WebContentsView, shell, powerMonitor } from 'electron';
import { TabInfo, TabsState, UserSettings } from '../shared/types';

export interface TabItem {
  info: TabInfo;
  view?: WebContentsView;
}

export interface ClosedTabItem {
  url: string;
  title: string;
}

export class TabManager {
  private window: BrowserWindow;
  private tabs: Map<string, TabItem> = new Map();
  private tabOrder: string[] = [];
  private activeTabId: string | null = null;
  private topBarHeight: number = 84; // Exact height of the React toolbar
  private closedTabsStack: ClosedTabItem[] = [];
  private getSearchEngine: () => string;
  private getStudySettings: () => UserSettings;
  private recordSiteUsage: (host: string, subject: string, seconds: number) => void;
  private lastSiteUsageCheck = Date.now();

  constructor(
    window: BrowserWindow,
    getSearchEngine: () => string = () => 'google',
    getStudySettings: () => UserSettings,
    recordSiteUsage: (host: string, subject: string, seconds: number) => void
  ) {
    this.window = window;
    this.getSearchEngine = getSearchEngine;
    this.getStudySettings = getStudySettings;
    this.recordSiteUsage = recordSiteUsage;

    // Reposition active view when main window resizes or changes maximize state
    this.window.on('resize', () => {
      this.updateViewBounds();
    });
    this.window.on('maximize', () => {
      this.updateViewBounds();
    });
    this.window.on('unmaximize', () => {
      this.updateViewBounds();
    });
    this.window.on('restore', () => {
      this.updateViewBounds();
    });
    const siteUsageTimer = setInterval(() => this.trackActiveSiteTime(), 60_000);
    siteUsageTimer.unref();
    this.window.on('closed', () => clearInterval(siteUsageTimer));
  }

  public getTabsState(): TabsState {
    const tabs = this.tabOrder.map((id) => this.tabs.get(id)!.info);
    return {
      tabs,
      activeTabId: this.activeTabId || ''
    };
  }

  public createTab(url?: string): string {
    if (url && /^hootly:\/\//i.test(url) && this.isInternalPage(url)) url = url.toLowerCase();
    if (url && !this.isInternalPage(url) && !this.isWebUrl(url)) {
      console.warn(`Blocked unsupported new-tab protocol: ${url}`);
      url = 'study://newtab';
    }
    const id = 'tab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const isNewTab = !url || this.isInternalPage(url);

    const info: TabInfo = {
      id,
      url: isNewTab ? (url || 'hootly://dashboard') : url!,
      title: isNewTab ? this.internalPageTitle(url || 'hootly://dashboard') : 'Loading...',
      isLoading: !isNewTab,
      canGoBack: false,
      canGoForward: false,
      isNewTab,
      isPinned: false,
      isAudioPlaying: false,
      isMuted: false,
      zoomLevel: 0
    };

    let view: WebContentsView | undefined;

    if (!isNewTab && url) {
      view = this.setupView(id, url);
    }

    this.tabs.set(id, { info, view });
    this.tabOrder.push(id);

    this.switchTab(id);
    return id;
  }

  public duplicateTab(tabId: string): string {
    const sourceTab = this.tabs.get(tabId);
    if (!sourceTab) return this.createTab('study://newtab');

    const newId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const url = sourceTab.info.url;
    const isNewTab = sourceTab.info.isNewTab || url === 'study://newtab';

    const info: TabInfo = {
      id: newId,
      url,
      title: sourceTab.info.title,
      favicon: sourceTab.info.favicon,
      isLoading: !isNewTab,
      canGoBack: false,
      canGoForward: false,
      isNewTab,
      isPinned: false,
      isAudioPlaying: false,
      isMuted: false,
      zoomLevel: 0
    };

    let view: WebContentsView | undefined;
    if (!isNewTab && url) {
      view = this.setupView(newId, url);
    }

    this.tabs.set(newId, { info, view });

    // Insert right after the source tab
    const sourceIndex = this.tabOrder.indexOf(tabId);
    if (sourceIndex > -1) {
      this.tabOrder.splice(sourceIndex + 1, 0, newId);
    } else {
      this.tabOrder.push(newId);
    }

    this.switchTab(newId);
    return newId;
  }

  public pinTab(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    tab.info.isPinned = !tab.info.isPinned;

    // Keep pinned tabs at the start of the tab strip
    this.sortTabsWithPinnedFirst();

    this.emitTabUpdate(tab.info);
    this.emitTabsUpdate();
  }

  private sortTabsWithPinnedFirst(): void {
    const pinned: string[] = [];
    const unpinned: string[] = [];

    for (const id of this.tabOrder) {
      const tab = this.tabs.get(id);
      if (tab?.info.isPinned) {
        pinned.push(id);
      } else {
        unpinned.push(id);
      }
    }

    this.tabOrder = [...pinned, ...unpinned];
  }

  public muteTab(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab?.view) return;

    const web = tab.view.webContents;
    const nextMuted = !web.isAudioMuted();
    web.setAudioMuted(nextMuted);
    tab.info.isMuted = nextMuted;

    this.emitTabUpdate(tab.info);
  }

  public reopenClosedTab(): string | null {
    if (this.closedTabsStack.length === 0) return null;
    const lastClosed = this.closedTabsStack.pop()!;
    return this.createTab(lastClosed.url);
  }

  public canReopenClosedTab(): boolean {
    return this.closedTabsStack.length > 0;
  }

  public createTabRight(tabId: string): string {
    const newTabId = this.createTab('study://newtab');
    const newIndex = this.tabOrder.indexOf(newTabId);
    const anchor = this.tabs.get(tabId);
    const anchorIndex = this.tabOrder.indexOf(tabId);

    if (newIndex >= 0 && anchorIndex >= 0) {
      this.tabOrder.splice(newIndex, 1);
      let insertIndex = anchorIndex + 1;
      if (anchor?.info.isPinned) {
        insertIndex = this.tabOrder.reduce((lastPinnedIndex, id, index) =>
          this.tabs.get(id)?.info.isPinned ? index + 1 : lastPinnedIndex, 0);
      }
      this.tabOrder.splice(insertIndex, 0, newTabId);
      this.emitTabsUpdate();
    }

    return newTabId;
  }

  public closeOtherTabs(targetId: string): void {
    const toClose = this.tabOrder.filter((id) => id !== targetId && !this.tabs.get(id)?.info.isPinned);
    for (const id of toClose) {
      this.destroyTabView(id);
    }
    this.tabOrder = this.tabOrder.filter((id) => id === targetId || this.tabs.get(id)?.info.isPinned);
    this.switchTab(targetId);
  }

  public closeTabsToRight(targetId: string): void {
    const targetIndex = this.tabOrder.indexOf(targetId);
    if (targetIndex === -1) return;

    const toClose = this.tabOrder.slice(targetIndex + 1).filter((id) => !this.tabs.get(id)?.info.isPinned);
    for (const id of toClose) {
      this.destroyTabView(id);
    }
    this.tabOrder = this.tabOrder.filter((id) => !toClose.includes(id));
    this.switchTab(targetId);
  }

  public reorderTabs(sourceIndex: number, destIndex: number): void {
    if (
      sourceIndex < 0 ||
      sourceIndex >= this.tabOrder.length ||
      destIndex < 0 ||
      destIndex >= this.tabOrder.length
    ) {
      return;
    }
    const [movedId] = this.tabOrder.splice(sourceIndex, 1);
    this.tabOrder.splice(destIndex, 0, movedId);
    this.emitTabsUpdate();
  }

  public setZoomLevel(tabId: string, zoom: number): void {
    const tab = this.tabs.get(tabId);
    if (!tab?.view) return;

    tab.view.webContents.setZoomLevel(zoom);
    tab.info.zoomLevel = zoom;
    this.emitTabUpdate(tab.info);
  }

  private setupView(tabId: string, initialUrl: string): WebContentsView {
    const view = new WebContentsView({
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    });

    const web = view.webContents;

    web.on('will-navigate', (event, url) => {
      if (this.isGoogleAuthUrl(url)) {
        event.preventDefault();
        void shell.openExternal(url).catch((error) => console.error('Could not open Google sign-in:', error));
      } else if (!this.isWebUrl(url)) event.preventDefault();
    });

    web.on('will-redirect', (event, url) => {
      if (!this.isGoogleAuthUrl(url)) return;
      event.preventDefault();
      void shell.openExternal(url).catch((error) => console.error('Could not open Google sign-in:', error));
    });

    web.on('did-start-loading', () => {
      const tab = this.tabs.get(tabId);
      if (tab) {
        tab.info.isLoading = true;
        this.emitTabUpdate(tab.info);
      }
    });

    web.on('did-stop-loading', () => {
      const tab = this.tabs.get(tabId);
      if (tab) {
        tab.info.isLoading = false;
        tab.info.canGoBack = web.canGoBack();
        tab.info.canGoForward = web.canGoForward();
        this.emitTabUpdate(tab.info);
      }
    });

    web.on('page-title-updated', (_event, title) => {
      const tab = this.tabs.get(tabId);
      if (tab) {
        tab.info.title = title || 'Untitled';
        this.emitTabUpdate(tab.info);
      }
    });

    web.on('page-favicon-updated', (_event, favicons) => {
      const tab = this.tabs.get(tabId);
      if (tab && favicons && favicons.length > 0) {
        tab.info.favicon = favicons[0];
        this.emitTabUpdate(tab.info);
      }
    });

    web.on('did-navigate', (_event, url) => {
      // Internal data-URL error pages must not replace the real URL in the address bar.
      if (!this.isWebUrl(url)) return;
      const tab = this.tabs.get(tabId);
      if (tab) {
        tab.info.url = url;
        tab.info.isNewTab = false;
        tab.info.canGoBack = web.canGoBack();
        tab.info.canGoForward = web.canGoForward();
        this.emitTabUpdate(tab.info);
      }
    });

    web.on('did-navigate-in-page', (_event, url) => {
      const tab = this.tabs.get(tabId);
      if (tab) {
        tab.info.url = url;
        tab.info.canGoBack = web.canGoBack();
        tab.info.canGoForward = web.canGoForward();
        this.emitTabUpdate(tab.info);
      }
    });

    // Audio indicators
    web.on('media-started-playing', () => {
      const tab = this.tabs.get(tabId);
      if (tab) {
        tab.info.isAudioPlaying = true;
        this.emitTabUpdate(tab.info);
      }
    });

    web.on('media-paused', () => {
      const tab = this.tabs.get(tabId);
      if (tab) {
        tab.info.isAudioPlaying = false;
        this.emitTabUpdate(tab.info);
      }
    });

    // Friendly offline/error screen on load failure
    web.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame || errorCode === -3) return; // -3 is aborted (e.g. redirected)
      const tab = this.tabs.get(tabId);
      if (tab) {
        tab.info.isLoading = false;
        tab.info.title = 'Unable to Load Page';
        const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]!);
        const safeUrl = escapeHtml(validatedURL);
        const safeDescription = escapeHtml(errorDescription);
        const errorHtml = `
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: #0b1320;
                  color: #f1f5f9;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  padding: 24px;
                  text-align: center;
                }
                .card {
                  background: #132238;
                  border: 1px solid #1e3a5f;
                  border-radius: 16px;
                  padding: 36px 40px;
                  max-width: 480px;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                }
                h1 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #f1f5f9; }
                p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
                .code { font-family: monospace; font-size: 11px; color: #64748b; margin-bottom: 20px; }
                button {
                  background: #2dd4bf;
                  color: #0b1320;
                  border: none;
                  padding: 10px 24px;
                  border-radius: 9999px;
                  font-weight: 700;
                  font-size: 13px;
                  cursor: pointer;
                  transition: transform 0.15s ease;
                }
                button:hover { transform: scale(1.04); }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Cannot reach this study site</h1>
                <p>StudyBrowser couldn't connect to <strong>${safeUrl}</strong>. Please check your internet connection or URL spelling.</p>
                <div class="code">${safeDescription} (${errorCode})</div>
                <button onclick="window.location.reload()">Try Again</button>
              </div>
            </body>
          </html>
        `;
        web.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
        this.emitTabUpdate(tab.info);
      }
    });

    // Intercept window.open popups to open as tabs
    web.setWindowOpenHandler(({ url }) => {
      if (this.isGoogleAuthUrl(url)) {
        void shell.openExternal(url).catch((error) => console.error('Could not open Google sign-in:', error));
        return { action: 'deny' };
      }
      if (this.isWebUrl(url)) this.createTab(url);
      return { action: 'deny' };
    });

    web.loadURL(initialUrl).catch((err) => {
      console.error(`Failed to load ${initialUrl}:`, err);
    });

    return view;
  }

  public switchTab(tabId: string): void {
    if (!this.tabs.has(tabId)) return;

    // Detach currently active view if any
    if (this.activeTabId && this.tabs.has(this.activeTabId)) {
      const current = this.tabs.get(this.activeTabId);
      if (current?.view && !current.info.isNewTab) {
        try {
          this.window.contentView.removeChildView(current.view);
        } catch (error) {
          console.warn('Could not detach inactive tab view:', error);
        }
      }
    }

    this.activeTabId = tabId;
    const target = this.tabs.get(tabId);

    // If target has a view and is not newtab, attach it
    if (target?.view && !target.info.isNewTab) {
      this.window.contentView.addChildView(target.view);
      this.updateViewBounds();
    }

    this.emitTabsUpdate();
  }

  private destroyTabView(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    if (!tab.info.isNewTab && tab.info.url && tab.info.url !== 'study://newtab') {
      this.closedTabsStack.push({ url: tab.info.url, title: tab.info.title });
    }

    if (tab.view) {
      try {
        this.window.contentView.removeChildView(tab.view);
      } catch {
        // A hidden tab's view is already detached; still destroy its web contents below.
      }
      try {
        if (!tab.view.webContents.isDestroyed()) tab.view.webContents.close();
      } catch (error) {
        console.error('Failed to destroy tab web contents:', error);
      }
    }
    this.tabs.delete(tabId);
  }

  public closeTab(tabId: string): void {
    if (!this.tabs.has(tabId)) return;

    this.destroyTabView(tabId);

    const index = this.tabOrder.indexOf(tabId);
    if (index > -1) {
      this.tabOrder.splice(index, 1);
    }

    // If active tab was closed, switch to another tab or create a new tab if none left
    if (this.activeTabId === tabId) {
      if (this.tabOrder.length > 0) {
        const nextId = this.tabOrder[Math.max(0, index - 1)];
        this.switchTab(nextId);
      } else {
        this.createTab('study://newtab');
      }
    } else {
      this.emitTabsUpdate();
    }
  }

  public navigateTab(tabId: string, input: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    let targetUrl = input.trim();
    if (!targetUrl) return;

    if (this.isInternalPage(targetUrl)) {
      targetUrl = targetUrl.toLowerCase();
      if (tab.view && !tab.info.isNewTab) {
        try {
          this.window.contentView.removeChildView(tab.view);
        } catch (error) {
          console.warn('Could not detach tab view for internal page:', error);
        }
      }
      tab.info.url = targetUrl;
      tab.info.title = this.internalPageTitle(targetUrl);
      tab.info.isNewTab = true;
      tab.info.isLoading = false;
      this.emitTabUpdate(tab.info);
      this.emitTabsUpdate();
      return;
    }

    // Check if it's a URL or search query
    const hasScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(targetUrl);
    const isDomain = /^(localhost|(?:\d{1,3}\.){3}\d{1,3}|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/.*)?$/.test(targetUrl);

    if (!hasScheme && isDomain) {
      targetUrl = 'https://' + targetUrl;
    } else if (!hasScheme) {
      const searchUrls: Record<string, string> = {
        google: 'https://www.google.com/search?q=',
        bing: 'https://www.bing.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q=',
        yahoo: 'https://search.yahoo.com/search?p='
      };
      targetUrl = (searchUrls[this.getSearchEngine()] || searchUrls.google) + encodeURIComponent(targetUrl);
    }

    if (!this.isWebUrl(targetUrl)) {
      console.warn(`Blocked unsupported navigation protocol: ${targetUrl}`);
      return;
    }

    tab.info.url = targetUrl;
    tab.info.isNewTab = false;
    tab.info.title = 'Loading...';
    tab.info.isLoading = true;

    const wasInternalPage = tab.info.isNewTab;
    if (!tab.view) {
      tab.view = this.setupView(tabId, targetUrl);
      if (this.activeTabId === tabId) {
        this.window.contentView.addChildView(tab.view);
        this.updateViewBounds();
      }
    } else {
      tab.view.webContents.loadURL(targetUrl);
      if (wasInternalPage && this.activeTabId === tabId) {
        this.window.contentView.addChildView(tab.view);
        this.updateViewBounds();
      }
    }

    this.emitTabUpdate(tab.info);
    this.emitTabsUpdate();
  }

  private isWebUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private isInternalPage(value: string): boolean {
    return value === 'study://newtab' || /^hootly:\/\/(dashboard|streak|exams|settings|bookmarks|adblock|review)$/i.test(value);
  }

  private internalPageTitle(value: string): string {
    const page = value.replace(/^(study|hootly):\/\//i, '').toLowerCase();
    return page === 'newtab' || page === 'dashboard' ? 'Dashboard' : page.charAt(0).toUpperCase() + page.slice(1);
  }

  private isGoogleAuthUrl(value: string): boolean {
    try {
      return new URL(value).hostname.toLowerCase() === 'accounts.google.com';
    } catch {
      return false;
    }
  }

  private trackActiveSiteTime(): void {
    if (this.window.isDestroyed()) return;
    const now = Date.now();
    const elapsedSeconds = Math.min(60, Math.max(0, Math.floor((now - this.lastSiteUsageCheck) / 1000)));
    this.lastSiteUsageCheck = now;
    if (!this.window.isFocused() || powerMonitor.getSystemIdleTime() > 120 || !this.activeTabId) return;
    const tab = this.tabs.get(this.activeTabId);
    if (!tab?.view || tab.info.isNewTab || tab.view.webContents.isDestroyed()) return;
    try {
      const url = new URL(tab.view.webContents.getURL());
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      const settings = this.getStudySettings();
      const activeSpace = settings.spaces.find((space) => space.id === settings.activeSpaceId);
      this.recordSiteUsage(url.hostname.toLowerCase(), activeSpace?.name || 'General Study', elapsedSeconds);
    } catch {
      // Ignore blank, internal, or transitional pages.
    }
  }

  public goBack(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (tab?.view && tab.view.webContents.canGoBack()) {
      tab.view.webContents.goBack();
    }
  }

  public goForward(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (tab?.view && tab.view.webContents.canGoForward()) {
      tab.view.webContents.goForward();
    }
  }

  public reload(tabId: string, ignoreCache = false): void {
    const tab = this.tabs.get(tabId);
    if (tab?.view) {
      if (tab.view.webContents.getURL().startsWith('data:text/html') && this.isWebUrl(tab.info.url)) {
        void tab.view.webContents.loadURL(tab.info.url);
        return;
      }
      if (ignoreCache) {
        tab.view.webContents.reloadIgnoringCache();
      } else {
        tab.view.webContents.reload();
      }
    }
  }

  public updateViewBounds(): void {
    if (!this.activeTabId) return;
    const active = this.tabs.get(this.activeTabId);
    if (!active?.view || active.info.isNewTab) return;

    const [width, height] = this.window.getContentSize();
    active.view.setBounds({
      x: 0,
      y: this.topBarHeight,
      width: Math.max(0, width),
      height: Math.max(0, height - this.topBarHeight)
    });
  }

  private emitTabUpdate(tab: TabInfo): void {
    if (!this.window.isDestroyed()) {
      this.window.webContents.send('tab:updated', tab);
    }
  }

  private emitTabsUpdate(): void {
    if (!this.window.isDestroyed()) {
      this.window.webContents.send('tabs:updated', this.getTabsState());
    }
  }
}
