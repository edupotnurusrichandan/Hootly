import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { UserSettings, StudySession, WeeklyReviewData } from '../shared/types';
import { calculateSessionXP, updateStreakWithRestTokens } from '../shared/habitEngine';
import { StudyDatabase } from './StudyDatabase';

const DEFAULT_SETTINGS: UserSettings = {
  searchEngine: 'google',
  bookmarks: [],
  adBlockEnabled: true,
  bedtimeReminderEnabled: false,
  themeId: 'aurora',
  themeMode: 'system',
  dailyGoalMinutes: 60,
  enableDelightAnimations: true,
  hasCompletedOnboarding: false,
  soundEffectsEnabled: false,
  bedtimeHour: 22,
  owlAccessory: 'glasses',
  xp: 0,
  streakDays: 0,
  restTokens: 0,
  parkingLot: [],
  exams: [],
  quests: [],
  studySessions: [],
  spaces: [
    { id: 'general', name: 'General Study', color: '#6366f1', icon: 'BookOpen' }
  ],
  activeSpaceId: 'general',
  ambientSound: 'none',
  ambientVolume: 0.5,
  dyslexiaFontEnabled: false,
  readingRulerEnabled: false,
  highContrastMode: false
};

export class SettingsStore {
  private filePath: string;
  private settings: UserSettings;
  private database: StudyDatabase;

  constructor(userData = app.getPath('userData')) {
    this.filePath = path.join(userData, 'settings.json');
    this.database = new StudyDatabase(path.join(userData, 'study-data.sqlite'));
    this.settings = this.load();
    if (this.database.countSessions() === 0 && this.settings.studySessions.length > 0) {
      this.database.importSessions(this.settings.studySessions);
    }
    this.settings.studySessions = this.database.listSessions();
  }

  private load(): UserSettings {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const saved: unknown = JSON.parse(raw);
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return { ...DEFAULT_SETTINGS };
        const data = saved as Partial<UserSettings>;
        return {
          ...DEFAULT_SETTINGS,
          ...data,
          searchEngine: ['google', 'bing', 'duckduckgo', 'yahoo'].includes(String(data.searchEngine)) ? data.searchEngine! : DEFAULT_SETTINGS.searchEngine,
          bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks.filter((bookmark) => bookmark && typeof bookmark.id === 'string' && typeof bookmark.title === 'string' && typeof bookmark.url === 'string' && /^https?:\/\//i.test(bookmark.url)).slice(0, 1000) : DEFAULT_SETTINGS.bookmarks,
          adBlockEnabled: typeof data.adBlockEnabled === 'boolean' ? data.adBlockEnabled : DEFAULT_SETTINGS.adBlockEnabled,
          bedtimeReminderEnabled: typeof data.bedtimeReminderEnabled === 'boolean' ? data.bedtimeReminderEnabled : DEFAULT_SETTINGS.bedtimeReminderEnabled,
          parkingLot: Array.isArray(data.parkingLot) ? data.parkingLot : DEFAULT_SETTINGS.parkingLot,
          exams: Array.isArray(data.exams) ? data.exams : DEFAULT_SETTINGS.exams,
          quests: Array.isArray(data.quests) ? data.quests : DEFAULT_SETTINGS.quests,
          studySessions: Array.isArray(data.studySessions) ? data.studySessions.slice(0, 365) : DEFAULT_SETTINGS.studySessions,
          spaces: Array.isArray(data.spaces) ? data.spaces : DEFAULT_SETTINGS.spaces
        };
      }
    } catch (err) {
      console.error('Failed to load settings from disk:', err);
    }
    return { ...DEFAULT_SETTINGS };
  }

  public get(): UserSettings {
    return { ...this.settings, studySessions: this.database.listSessions() };
  }

  public set(partial: Partial<UserSettings>): UserSettings {
    if (Array.isArray(partial.studySessions)) this.database.importSessions(partial.studySessions);
    this.settings = { ...this.settings, ...partial };
    this.settings.studySessions = this.database.listSessions();
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const savedSettings = { ...this.settings, studySessions: undefined };
      fs.writeFileSync(this.filePath, JSON.stringify(savedSettings, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save settings to disk:', err);
    }
    return this.get();
  }

  public recordStudySession(session: StudySession): UserSettings {
    if (!session || typeof session !== 'object' || typeof session.id !== 'string' || !session.id.trim() || typeof session.subject !== 'string' || !session.subject.trim() || typeof session.intention !== 'string' || !Number.isFinite(session.durationMinutes) || session.durationMinutes <= 0 || session.durationMinutes > 24 * 60 || !Number.isFinite(session.timestamp) || (session.reflectionRating !== undefined && (!Number.isInteger(session.reflectionRating) || session.reflectionRating < 1 || session.reflectionRating > 5)) || (session.reflectionNotes !== undefined && (typeof session.reflectionNotes !== 'string' || session.reflectionNotes.length > 4000))) {
      throw new Error('Study session must have a positive duration and valid timestamp.');
    }
    if (!this.database.insertSession(session)) return this.get();
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const streak = updateStreakWithRestTokens(
      this.settings.lastStudyDate || null,
      now,
      this.settings.streakDays,
      this.settings.restTokens
    );

    const localDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const allSessions = this.database.listSessions(10000);
    const minutesBeforeSession = allSessions
      .filter((item) => item.timestamp >= localDayStart)
      .reduce((total, item) => total + item.durationMinutes, 0);
    const hitDailyGoal = minutesBeforeSession < this.settings.dailyGoalMinutes &&
      minutesBeforeSession + session.durationMinutes >= this.settings.dailyGoalMinutes;
    const xpGain = calculateSessionXP(session.durationMinutes, hitDailyGoal, streak.newStreak);
    const newXp = (this.settings.xp || 0) + xpGain;

    // Update quests: check for quest progress
    const updatedQuests = (this.settings.quests || []).map((q) => {
      if (q.completed || q.claimed) return q;
      // "Deep Work Sprint" — complete if session >= 25 min
      if (q.id === 'quest-2' && session.durationMinutes >= 25) {
        return { ...q, currentProgress: q.targetProgress, completed: true };
      }
      return q;
    });

    const recentSessions = this.database.listSessions();

    return this.set({
      streakDays: streak.newStreak,
      restTokens: streak.tokensRemaining,
      lastStudyDate: today,
      xp: newXp,
      studySessions: recentSessions,
      quests: updatedQuests
    });
  }

  public recordSiteUsage(host: string, subject: string, seconds: number, timestamp?: number): void {
    this.database.recordSiteUsage(host, subject, seconds, timestamp);
  }

  public getWeeklyReview(now = Date.now()): WeeklyReviewData {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    return this.database.getWeeklyReview(start.getTime(), now, now);
  }

  public close(): void {
    this.database.close();
  }
}
