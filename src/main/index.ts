import { app, BrowserWindow, dialog, ipcMain, Menu, session, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import fs from 'fs';
import { SettingsStore } from './settingsStore';
import { CredentialsManager } from './CredentialsManager';
import { isBlockedRequestUrl } from './adBlock';
import { registerWebPermissionHandlers } from './webPermissions';
import { TabManager } from './TabManager';
import { ALL_THEMES } from '../themes';
import { UserSettings, StudySession } from '../shared/types';
import { bedtimeReminderKey, isBedtimeReminderDue } from '../shared/reminders';

app.name = 'Hootly';
if (process.platform === 'win32') {
  app.setAppUserModelId('com.hootly.browser');
  app.setToastActivatorCLSID('{8B3C16AC-CA22-4D89-9A3A-E4A2F8633C31}');
}

let mainWindow: BrowserWindow | null = null;
let tabManager: TabManager | null = null;
const settingsStore = new SettingsStore();
const credentialsManager = new CredentialsManager();

const sitePermissionLabels: Record<string, string> = {
  media: 'camera or microphone',
  'display-capture': 'screen sharing',
  geolocation: 'your location',
  notifications: 'notifications',
  'clipboard-read': 'reading your clipboard',
  pointerLock: 'locking the pointer',
  fullscreen: 'fullscreen access',
  midi: 'MIDI devices',
  midiSysex: 'MIDI device access'
};

function confirmWebsitePermission(owner: BrowserWindow, permission: string, origin: string): Promise<boolean> {
  const permissionLabel = sitePermissionLabels[permission];
  if (!permissionLabel) return Promise.resolve(false);
  return dialog.showMessageBox(owner, {
    type: 'question',
    title: 'Website permission request',
    message: `Allow this website to use ${permissionLabel}?`,
    detail: `${origin}\n\nApproval is temporary and limited to this tab for up to 15 minutes.`,
    buttons: ['Block', 'Allow once'],
    defaultId: 0,
    cancelId: 0,
    noLink: true
  }).then((result) => result.response === 1);
}

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.on('error', (error) => {
    console.error('[Updater] Update check failed:', error);
  });
  autoUpdater.on('update-downloaded', async (info) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Hootly update ready',
      message: `Hootly ${info.version} is ready to install.`,
      detail: 'Restart Hootly now to finish updating.',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1
    });
    if (result.response === 0) autoUpdater.quitAndInstall();
  });

  const checkForUpdates = () => {
    autoUpdater.checkForUpdates().catch((error) => {
      console.error('[Updater] Could not check for updates:', error);
    });
  };

  // Give startup and the first page load time to finish before checking.
  setTimeout(checkForUpdates, 20_000).unref();
  setInterval(checkForUpdates, 6 * 60 * 60 * 1000).unref();
}

function setupBedtimeReminders() {
  let notifiedDate = '';
  const checkReminder = () => {
    const settings = settingsStore.get();
    if (!settings.bedtimeReminderEnabled || !Notification.isSupported()) return;
    const now = new Date();
    const dateKey = bedtimeReminderKey(now);
    if (dateKey === notifiedDate || !isBedtimeReminderDue(now, settings.bedtimeHour)) return;
    notifiedDate = dateKey;
    const notification = new Notification({
      title: 'Hootly bedtime reminder',
      body: 'You have put in good work today. Consider wrapping up and getting some rest.'
    });
    notification.on('click', () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      mainWindow.show();
      mainWindow.focus();
    });
    notification.show();
  };
  const reminderTimer = setInterval(checkReminder, 30_000);
  reminderTimer.unref();
  checkReminder();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Hootly',
    width: 1240,
    height: 820,
    minWidth: 860,
    minHeight: 540,
    frame: false, // Frameless window with custom controls
    backgroundColor: '#0b1320',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  tabManager = new TabManager(
    mainWindow,
    () => settingsStore.get().searchEngine,
    () => settingsStore.get(),
    (host, subject, seconds) => settingsStore.recordSiteUsage(host, subject, seconds)
  );

  // Notify renderer when maximize state changes
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximize-change', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximize-change', false);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    // Create initial tab
    tabManager?.createTab('hootly://dashboard');
  });

  mainWindow.webContents.once('did-finish-load', async () => {
    if (process.argv.includes('--capture-screenshots')) {
      const screenshotsDir = path.resolve(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(1500);

      // 1. Aurora Dark Mode
      console.log('[Capture] Capturing aurora-dark.png...');
      settingsStore.set({ themeId: 'aurora', themeMode: 'dark', hasCompletedOnboarding: true });
      mainWindow?.webContents.send('settings:updated', settingsStore.get());
      await sleep(1800); // Wait for startup splash to finish
      let img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'aurora-dark.png'), img.toPNG());

      // 2. Aurora Light Mode
      console.log('[Capture] Capturing aurora-light.png...');
      settingsStore.set({ themeId: 'aurora', themeMode: 'light' });
      mainWindow?.webContents.send('settings:updated', settingsStore.get());
      await sleep(800);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'aurora-light.png'), img.toPNG());

      // 3. Ocean Theme
      console.log('[Capture] Capturing ocean-dark.png...');
      settingsStore.set({ themeId: 'ocean', themeMode: 'dark' });
      mainWindow?.webContents.send('settings:updated', settingsStore.get());
      await sleep(800);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'ocean-dark.png'), img.toPNG());

      // 4. Medical Profession Theme
      console.log('[Capture] Capturing medical-profession.png...');
      settingsStore.set({ themeId: 'medical', themeMode: 'dark' });
      mainWindow?.webContents.send('settings:updated', settingsStore.get());
      await sleep(800);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'medical-profession.png'), img.toPNG());

      // 5. Settings Modal with Theme Picker
      console.log('[Capture] Capturing settings-picker.png...');
      await mainWindow?.webContents.executeJavaScript(`
        const btn = document.querySelector('button[title="Themes & Settings"]');
        if (btn) btn.click();
      `);
      await sleep(800);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'settings-picker.png'), img.toPNG());

      // 6. Onboarding Modal
      console.log('[Capture] Capturing onboarding-screen.png...');
      await mainWindow?.webContents.executeJavaScript(`
        const doneBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Done'));
        if (doneBtn) doneBtn.click();
        const onboardingBtn = document.querySelector('button[title="Onboarding & Goals"]');
        if (onboardingBtn) onboardingBtn.click();
      `);
      await sleep(800);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'onboarding-screen.png'), img.toPNG());

      // 7. Owl Day Mode (Perched on flame with glasses)
      console.log('[Capture] Capturing owl-day-mode.png...');
      await mainWindow?.webContents.executeJavaScript(`
        const closeOnboarding = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Start Studying') || b.textContent && b.textContent.includes('Done'));
        if (closeOnboarding) closeOnboarding.click();
      `);
      settingsStore.set({ bedtimeHour: 23 });
      mainWindow?.webContents.send('settings:updated', settingsStore.get());
      await sleep(600);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'owl-day-mode.png'), img.toPNG());

      // 8. Owl Sleepy Night Mode (Wind-down banner, nightcap, floating zZZ)
      console.log('[Capture] Capturing owl-sleepy-night.png...');
      // Set bedtimeHour to 1 hour ago so isSleepy triggers
      const currentHour = new Date().getHours();
      settingsStore.set({ bedtimeHour: Math.max(0, currentHour - 1) });
      mainWindow?.webContents.send('settings:updated', settingsStore.get());
      await sleep(600);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'owl-sleepy-night.png'), img.toPNG());

      // 9. Tab Right-Click Context Menu
      console.log('[Capture] Capturing tab-context-menu.png...');
      await mainWindow?.webContents.executeJavaScript(`
        const firstTab = document.querySelector('.no-drag[style*="cursor: pointer"]');
        if (firstTab) {
          const rect = firstTab.getBoundingClientRect();
          firstTab.dispatchEvent(new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: rect.left + 50,
            clientY: rect.top + 20
          }));
        }
      `);
      await sleep(600);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'tab-context-menu.png'), img.toPNG());

      // 10. Address Bar Suggestions Dropdown
      console.log('[Capture] Capturing address-bar-suggestions.png...');
      await mainWindow?.webContents.executeJavaScript(`
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        const input = document.querySelector('input[placeholder*="Search"]');
        if (input) {
          input.focus();
        }
      `);
      await sleep(600);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'address-bar-suggestions.png'), img.toPNG());

      // 11. Habit Boosters & Dashboard (Heatmap, Quests, Exams, Tips)
      console.log('[Capture] Capturing habit-boosters-dashboard.png...');
      await mainWindow?.webContents.executeJavaScript(`
        document.activeElement && document.activeElement.blur();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      `);
      settingsStore.set({ themeId: 'aurora', themeMode: 'dark', bedtimeHour: 23 });
      mainWindow?.webContents.send('settings:updated', settingsStore.get());
      await sleep(700);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'habit-boosters-dashboard.png'), img.toPNG());

      // 12. Command Palette (Ctrl+K)
      console.log('[Capture] Capturing command-palette.png...');
      await mainWindow?.webContents.executeJavaScript(`
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      `);
      await sleep(600);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'command-palette.png'), img.toPNG());

      // 13. Study Timer & Break Coach
      console.log('[Capture] Capturing study-timer.png...');
      await mainWindow?.webContents.executeJavaScript(`
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        const timerBtn = document.querySelector('button[title="Study Focus Timer & Break Coach"]');
        if (timerBtn) timerBtn.click();
      `);
      await sleep(600);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'study-timer.png'), img.toPNG());

      // 14. Distraction Parking Lot (Ctrl+Shift+P)
      console.log('[Capture] Capturing parking-lot.png...');
      await mainWindow?.webContents.executeJavaScript(`
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        const parkBtn = document.querySelector('button[title*="Parking Lot"]');
        if (parkBtn) parkBtn.click();
      `);
      await sleep(600);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'parking-lot.png'), img.toPNG());

      // 15. Citation Generator Modal
      console.log('[Capture] Capturing citation-generator.png...');
      await mainWindow?.webContents.executeJavaScript(`
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        const citeBtn = document.querySelector('button[title*="Cite Current Page"]');
        if (citeBtn) citeBtn.click();
      `);
      await sleep(600);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'citation-generator.png'), img.toPNG());

      // 16. Reading Mode & Ambient Sound Controls
      console.log('[Capture] Capturing reading-mode-ambient.png...');
      await mainWindow?.webContents.executeJavaScript(`
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        const readingBtn = document.querySelector('button[title*="Reading Aids"]');
        if (readingBtn) readingBtn.click();
      `);
      await sleep(600);
      img = await mainWindow!.capturePage();
      fs.writeFileSync(path.join(screenshotsDir, 'reading-mode-ambient.png'), img.toPNG());

      console.log('[Capture] All screenshots captured successfully in:', screenshotsDir);
      app.quit();
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

// Register IPC handlers
function registerIpcHandlers() {
  // Window controls
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.handle('window:is-maximized', () => {
    return mainWindow?.isMaximized() || false;
  });

  // Tab controls
  ipcMain.handle('tabs:get-state', () => {
    return tabManager?.getTabsState() || { tabs: [], activeTabId: '' };
  });

  ipcMain.handle('tab:create', (_event, url?: string) => {
    return tabManager?.createTab(url);
  });

  ipcMain.handle('tab:close', (_event, tabId: string) => {
    tabManager?.closeTab(tabId);
  });

  ipcMain.handle('tab:switch', (_event, tabId: string) => {
    tabManager?.switchTab(tabId);
  });

  ipcMain.handle('tab:navigate', (_event, tabId: string, url: string) => {
    tabManager?.navigateTab(tabId, url);
  });

  ipcMain.handle('tab:go-back', (_event, tabId: string) => {
    tabManager?.goBack(tabId);
  });

  ipcMain.handle('tab:go-forward', (_event, tabId: string) => {
    tabManager?.goForward(tabId);
  });

  ipcMain.handle('tab:reload', (_event, tabId: string) => {
    tabManager?.reload(tabId);
  });

  ipcMain.handle('tab:duplicate', (_event, tabId: string) => {
    return tabManager?.duplicateTab(tabId);
  });

  ipcMain.handle('tab:pin', (_event, tabId: string) => {
    tabManager?.pinTab(tabId);
  });

  ipcMain.handle('tab:mute', (_event, tabId: string) => {
    tabManager?.muteTab(tabId);
  });

  ipcMain.handle('tab:reopen-closed', () => {
    return tabManager?.reopenClosedTab();
  });

  ipcMain.handle('tab:close-others', (_event, tabId: string) => {
    tabManager?.closeOtherTabs(tabId);
  });

  ipcMain.handle('tab:close-right', (_event, tabId: string) => {
    tabManager?.closeTabsToRight(tabId);
  });

  ipcMain.handle('tab:reorder', (_event, sourceIndex: number, destIndex: number) => {
    tabManager?.reorderTabs(sourceIndex, destIndex);
  });

  ipcMain.handle('tab:set-zoom', (_event, tabId: string, zoom: number) => {
    tabManager?.setZoomLevel(tabId, zoom);
  });

  ipcMain.handle('tab:show-context-menu', (event, tabId: string, x: number, y: number) => {
    if (!mainWindow || event.sender !== mainWindow.webContents || !tabManager) return;
    const tab = tabManager.getTabsState().tabs.find((item) => item.id === tabId);
    if (!tab) return;

    const menu = Menu.buildFromTemplate([
      { label: 'Reload Tab', accelerator: 'CmdOrCtrl+R', click: () => tabManager?.reload(tabId) },
      { label: 'Duplicate Tab', click: () => tabManager?.duplicateTab(tabId) },
      { type: 'separator' },
      { label: tab.isPinned ? 'Unpin Tab' : 'Pin Tab', click: () => tabManager?.pinTab(tabId) },
      { label: tab.isMuted ? 'Unmute Tab' : 'Mute Tab', enabled: !tab.isNewTab, click: () => tabManager?.muteTab(tabId) },
      { label: 'New Tab to the Right', click: () => tabManager?.createTabRight(tabId) },
      { type: 'separator' },
      { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => tabManager?.closeTab(tabId) },
      { label: 'Close Other Tabs', click: () => tabManager?.closeOtherTabs(tabId) },
      { label: 'Close Tabs to the Right', click: () => tabManager?.closeTabsToRight(tabId) },
      { type: 'separator' },
      { label: 'Reopen Closed Tab', enabled: tabManager.canReopenClosedTab(), click: () => tabManager?.reopenClosedTab() }
    ]);
    menu.popup({ window: mainWindow, x: Math.round(x), y: Math.round(y) });
  });

  // Settings
  ipcMain.handle('settings:get', () => {
    return settingsStore.get();
  });

  ipcMain.handle('settings:save', (_event, partial: Partial<UserSettings>) => {
    const updated = settingsStore.set(partial);
    mainWindow?.webContents.send('settings:updated', updated);
    return updated;
  });

  // Themes
  ipcMain.handle('themes:get', () => {
    return ALL_THEMES;
  });

  // Study session recording (streak logic in settingsStore)
  ipcMain.handle('study:record-session', (_event, session: StudySession) => {
    const updated = settingsStore.recordStudySession(session);
    mainWindow?.webContents.send('settings:updated', updated);
    return updated;
  });

  ipcMain.handle('study:get-weekly-review', (event) => {
    if (!mainWindow || event.sender !== mainWindow.webContents) return null;
    return settingsStore.getWeeklyReview();
  });

  // Credentials
  ipcMain.handle('credentials:save', (_event, host: string, username: string, password: string) => {
    credentialsManager.saveCredential(host, username, password);
  });

  ipcMain.handle('credentials:get', (_event, host: string) => {
    return credentialsManager.getCredential(host);
  });

  ipcMain.handle('credentials:list', () => {
    return credentialsManager.listCredentials();
  });

  ipcMain.handle('credentials:delete', (_event, host: string) => {
    credentialsManager.deleteCredential(host);
  });

  // Screenshot capture utility
  ipcMain.handle('app:capture-screenshot', async (_event, name: string) => {
    if (!mainWindow) return '';
    try {
      const image = await mainWindow.capturePage();
      const screenshotsDir = path.resolve(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_') + '.png';
      const filePath = path.join(screenshotsDir, safeName);
      fs.writeFileSync(filePath, image.toPNG());
      return filePath;
    } catch (err) {
      console.error('Screenshot capture failed:', err);
      return '';
    }
  });
}

app.whenReady().then(() => {
  registerWebPermissionHandlers(session.defaultSession, () => mainWindow, confirmWebsitePermission);

  session.defaultSession.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (details, callback) => {
    callback({ cancel: settingsStore.get().adBlockEnabled && isBlockedRequestUrl(details.url) });
  });

  registerIpcHandlers();
  createWindow();
  setupAutoUpdater();
  setupBedtimeReminders();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
