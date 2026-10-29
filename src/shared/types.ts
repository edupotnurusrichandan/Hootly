export type ThemeType = 'gradient' | 'profession';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceHover?: string;
  border?: string;
  text: string;
  textMuted?: string;
  accent: string;
  accentHover?: string;
}

export interface ThemeGradient {
  from: string;
  to: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  type: ThemeType;
  description?: string;
  light: ThemeColors;
  dark: ThemeColors;
  gradient: ThemeGradient;
  ranks: string[];
  greeting: string;
  nudgeStyle: string;
  badgeIcon?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ParkingLotItem {
  id: string;
  text: string;
  createdAt: number;
  isDone: boolean;
}

export interface ExamCountdown {
  id: string;
  title: string;
  subject: string;
  examDate: string; // YYYY-MM-DD
  targetHours: number;
  completedHours: number;
}

export interface StudyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  currentProgress: number;
  targetProgress: number;
  completed: boolean;
  claimed: boolean;
  type: 'daily' | 'weekly';
}

export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  intention: string;
  reflectionRating?: number; // 1 to 5
  reflectionNotes?: string;
  timestamp: number;
}

export interface WeeklyReviewData {
  sessionCount: number;
  totalMinutes: number;
  averageMinutesPerDay: number;
  bySubject: Array<{ subject: string; minutes: number; sessions: number }>;
  bySite: Array<{ host: string; minutes: number }>;
}

export interface StudySpace {
  id: string;
  name: string;
  color: string;
  icon?: string;
  notes?: string;
  tabUrls?: string[];
}

export interface BookmarkEntry {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

export type AmbientSoundType = 'none' | 'rain' | 'cafe' | 'whitenoise';

export interface UserSettings {
  searchEngine: 'google' | 'bing' | 'duckduckgo' | 'yahoo';
  bookmarks: BookmarkEntry[];
  adBlockEnabled: boolean;
  bedtimeReminderEnabled: boolean;
  themeId: string;
  themeMode: ThemeMode;
  professionId?: string;
  dailyGoalMinutes: number;
  enableDelightAnimations: boolean;
  hasCompletedOnboarding: boolean;
  soundEffectsEnabled: boolean;
  bedtimeHour: number;
  owlAccessory?: string;
  // Habit engine & student tools
  xp: number;
  streakDays: number;
  restTokens: number;
  lastStudyDate?: string;
  parkingLot: ParkingLotItem[];
  exams: ExamCountdown[];
  quests: StudyQuest[];
  studySessions: StudySession[];
  spaces: StudySpace[];
  activeSpaceId: string;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  dyslexiaFontEnabled?: boolean;
  readingRulerEnabled?: boolean;
  highContrastMode?: boolean;
}

export interface TabInfo {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isNewTab?: boolean;
  isPinned?: boolean;
  isAudioPlaying?: boolean;
  isMuted?: boolean;
  zoomLevel?: number;
}

export interface TabsState {
  tabs: TabInfo[];
  activeTabId: string;
}

export interface StudyBrowserAPI {
  // Window controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isWindowMaximized: () => Promise<boolean>;

  // Tab controls
  getTabsState: () => Promise<TabsState>;
  createTab: (url?: string) => Promise<string>;
  closeTab: (tabId: string) => Promise<void>;
  switchTab: (tabId: string) => Promise<void>;
  navigateTab: (tabId: string, url: string) => Promise<void>;
  goBackTab: (tabId: string) => Promise<void>;
  goForwardTab: (tabId: string) => Promise<void>;
  reloadTab: (tabId: string) => Promise<void>;
  duplicateTab: (tabId: string) => Promise<string>;
  pinTab: (tabId: string) => Promise<void>;
  muteTab: (tabId: string) => Promise<void>;
  reopenClosedTab: () => Promise<string | null>;
  closeOtherTabs: (tabId: string) => Promise<void>;
  closeTabsToRight: (tabId: string) => Promise<void>;
  reorderTabs: (sourceIndex: number, destIndex: number) => Promise<void>;
  setZoomLevel: (tabId: string, zoom: number) => Promise<void>;
  showTabContextMenu: (tabId: string, x: number, y: number) => Promise<void>;

  // Settings
  getSettings: () => Promise<UserSettings>;
  saveSettings: (settings: Partial<UserSettings>) => Promise<UserSettings>;

  // Study session recording (handles streak logic on main process)
  recordStudySession: (session: StudySession) => Promise<UserSettings>;
  getWeeklyReview: () => Promise<WeeklyReviewData>;

  // Credentials
  saveCredential: (host: string, username: string, password: string) => Promise<void>;
  getCredential: (host: string) => Promise<{ username: string; password: string } | null>;
  listCredentials: () => Promise<Array<{ host: string; username: string }>>;
  deleteCredential: (host: string) => Promise<void>;

  // Themes
  getThemes: () => Promise<ThemeDefinition[]>;

  // Event subscriptions (returns unsubscribe function)
  onTabsUpdated: (callback: (data: TabsState) => void) => () => void;
  onTabUpdated: (callback: (tab: TabInfo) => void) => () => void;
  onSettingsUpdated: (callback: (settings: UserSettings) => void) => () => void;
  onWindowMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;

  // Screenshot capture for verification
  captureScreenshot: (name: string) => Promise<string>;
}

declare global {
  interface Window {
    studyBrowser: StudyBrowserAPI;
  }
}
