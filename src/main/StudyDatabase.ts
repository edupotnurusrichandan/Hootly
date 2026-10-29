import Database from 'better-sqlite3';
import { StudySession, WeeklyReviewData } from '../shared/types';

export class StudyDatabase {
  private database: Database;
  private insertSessionStatement: ReturnType<Database['prepare']>;
  private insertSiteUsageStatement: ReturnType<Database['prepare']>;

  constructor(filePath: string) {
    this.database = new Database(filePath, { timeout: 5000 });
    this.database.pragma('journal_mode = WAL');
    this.database.pragma('foreign_keys = ON');
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        duration_minutes REAL NOT NULL CHECK(duration_minutes > 0),
        intention TEXT NOT NULL,
        reflection_rating INTEGER,
        reflection_notes TEXT,
        timestamp INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_study_sessions_timestamp ON study_sessions(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_study_sessions_subject_timestamp ON study_sessions(subject, timestamp DESC);
      CREATE TABLE IF NOT EXISTS site_usage (
        host TEXT NOT NULL,
        subject TEXT NOT NULL,
        usage_date TEXT NOT NULL,
        seconds INTEGER NOT NULL CHECK(seconds >= 0),
        PRIMARY KEY(host, subject, usage_date)
      );
      CREATE INDEX IF NOT EXISTS idx_site_usage_date ON site_usage(usage_date);
      PRAGMA user_version = 1;
    `);
    this.insertSessionStatement = this.database.prepare(`
      INSERT OR IGNORE INTO study_sessions
        (id, subject, duration_minutes, intention, reflection_rating, reflection_notes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    this.insertSiteUsageStatement = this.database.prepare(`
      INSERT INTO site_usage (host, subject, usage_date, seconds)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(host, subject, usage_date) DO UPDATE SET seconds = seconds + excluded.seconds
    `);
  }

  public countSessions(): number {
    return (this.database.prepare('SELECT COUNT(*) AS count FROM study_sessions').get<{ count: number }>()?.count || 0);
  }

  public importSessions(sessions: StudySession[]): void {
    const insertMany = this.database.transaction(() => {
      for (const session of sessions) this.insertSession(session);
    });
    insertMany();
  }

  public insertSession(session: StudySession): boolean {
    const result = this.insertSessionStatement.run(
      session.id,
      session.subject,
      session.durationMinutes,
      session.intention,
      session.reflectionRating ?? null,
      session.reflectionNotes ?? null,
      session.timestamp
    );
    return result.changes > 0;
  }

  public listSessions(limit = 365): StudySession[] {
    const safeLimit = Math.max(1, Math.min(10000, Math.floor(limit)));
    return this.database.prepare(`
      SELECT id, subject, duration_minutes AS durationMinutes, intention,
        reflection_rating AS reflectionRating, reflection_notes AS reflectionNotes, timestamp
      FROM study_sessions ORDER BY timestamp DESC LIMIT ?
    `).all<StudySession & { reflectionRating: number | null; reflectionNotes: string | null }>(safeLimit)
      .map((row) => ({
        id: row.id,
        subject: row.subject,
        durationMinutes: row.durationMinutes,
        intention: row.intention,
        ...(row.reflectionRating == null ? {} : { reflectionRating: row.reflectionRating }),
        ...(row.reflectionNotes == null ? {} : { reflectionNotes: row.reflectionNotes }),
        timestamp: row.timestamp
      }));
  }

  public recordSiteUsage(host: string, subject: string, seconds: number, timestamp = Date.now()): void {
    const candidateHost = host.trim().toLowerCase();
    let safeHost = '';
    try {
      const parsedHost = new URL(`https://${candidateHost}`);
      if (parsedHost.hostname === candidateHost && !parsedHost.username && !parsedHost.password && !parsedHost.port) {
        safeHost = candidateHost.slice(0, 253);
      }
    } catch {
      safeHost = '';
    }
    const safeSubject = subject.trim().slice(0, 120) || 'General';
    const safeSeconds = Math.max(0, Math.min(300, Math.floor(seconds)));
    if (!safeHost || safeSeconds === 0 || !Number.isFinite(timestamp)) return;
    const date = new Date(timestamp);
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    this.insertSiteUsageStatement.run(safeHost, safeSubject, localDate, safeSeconds);
  }

  public getWeeklyReview(startTimestamp: number, endTimestamp: number, now = Date.now()): WeeklyReviewData {
    const sessions = this.database.prepare(`
      SELECT subject, COUNT(*) AS sessions, COALESCE(SUM(duration_minutes), 0) AS minutes
      FROM study_sessions WHERE timestamp >= ? AND timestamp < ? GROUP BY subject ORDER BY minutes DESC
    `).all<{ subject: string; sessions: number; minutes: number }>(startTimestamp, endTimestamp);
    const sites = this.database.prepare(`
      SELECT host, COALESCE(SUM(seconds), 0) AS seconds FROM site_usage
      WHERE usage_date >= ? AND usage_date <= ? GROUP BY host ORDER BY seconds DESC LIMIT 10
    `).all<{ host: string; seconds: number }>(this.localDate(startTimestamp), this.localDate(endTimestamp));
    const totalMinutes = sessions.reduce((sum, row) => sum + row.minutes, 0);
    const daysObserved = Math.max(1, Math.min(7, Math.ceil((now - startTimestamp) / 86400000)));
    return {
      sessionCount: sessions.reduce((sum, row) => sum + row.sessions, 0),
      totalMinutes: Math.round(totalMinutes),
      averageMinutesPerDay: Math.round(totalMinutes / daysObserved),
      bySubject: sessions.map((row) => ({ subject: row.subject, minutes: Math.round(row.minutes), sessions: row.sessions })),
      bySite: sites.map((row) => ({ host: row.host, minutes: Math.round(row.seconds / 60) }))
    };
  }

  public close(): void {
    this.database.close();
  }

  private localDate(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
