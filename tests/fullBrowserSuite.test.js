const { test, describe, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadTypeScript } = require('./loadTypeScript');

const root = path.join(__dirname, '..');
const testDirectories = [];
after(() => {
  for (const directory of testDirectories) fs.rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});
const { StudyDatabase } = loadTypeScript(path.join(root, 'src', 'main', 'StudyDatabase.ts'));
const { isBlockedRequestUrl } = loadTypeScript(path.join(root, 'src', 'main', 'adBlock.ts'));
const habitEngine = loadTypeScript(path.join(root, 'src', 'shared', 'habitEngine.ts'));

function temporaryDirectory(t) {
  const baseDirectory = path.join(root, '.test-tmp');
  fs.mkdirSync(baseDirectory, { recursive: true });
  const directory = fs.mkdtempSync(path.join(baseDirectory, 'hootly-tests-'));
  testDirectories.push(directory);
  return directory;
}

describe('SQLite study history and weekly reports', () => {
  test('stores sessions and site time durably and summarizes subject and site activity', (t) => {
    const directory = temporaryDirectory(t);
    const databasePath = path.join(directory, 'study.sqlite');
    const db = new StudyDatabase(databasePath);
    t.after(() => db.close());
    const now = new Date(2026, 9, 29, 12).getTime();
    const session = { id: 'study-1', subject: 'Biology', durationMinutes: 45, intention: 'Cell revision', reflectionRating: 4, reflectionNotes: 'Good focus', timestamp: now };

    assert.equal(db.insertSession(session), true);
    assert.equal(db.insertSession(session), false, 'duplicate identifiers must not duplicate records');
    db.recordSiteUsage('khanacademy.org', 'Biology', 120, now);
    db.recordSiteUsage('khanacademy.org', 'Biology', 60, now + 1000);
    db.recordSiteUsage('docs.example.org', 'Biology', 120, now);

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    const summary = db.getWeeklyReview(start.getTime(), now + 1, now);
    assert.equal(summary.sessionCount, 1);
    assert.equal(summary.totalMinutes, 45);
    assert.deepEqual(summary.bySubject, [{ subject: 'Biology', minutes: 45, sessions: 1 }]);
    assert.equal(summary.bySite[0].host, 'khanacademy.org');
    assert.equal(summary.bySite[0].minutes, 3);

    db.close();
    const reopened = new StudyDatabase(databasePath);
    t.after(() => reopened.close());
    assert.deepEqual(reopened.listSessions(10), [session]);
  });

  test('rejects invalid site hosts and caps individual usage increments', (t) => {
    const db = new StudyDatabase(path.join(temporaryDirectory(t), 'bounds.sqlite'));
    t.after(() => db.close());
    const timestamp = Date.now();
    db.recordSiteUsage('https://bad.example/path', 'General', 60, timestamp);
    db.recordSiteUsage('example.org', 'General', 9999, timestamp);
    const start = new Date(timestamp);
    start.setHours(0, 0, 0, 0);
    const summary = db.getWeeklyReview(start.getTime(), timestamp, timestamp);
    assert.deepEqual(summary.bySite, [{ host: 'example.org', minutes: 5 }]);
  });

  test('migrates legacy JSON study sessions once and records future sessions in SQLite', (t) => {
    const directory = temporaryDirectory(t);
    const legacy = { id: 'legacy-1', subject: 'Math', durationMinutes: 25, intention: 'Practice', timestamp: Date.now() - 1000 };
    fs.writeFileSync(path.join(directory, 'settings.json'), JSON.stringify({ studySessions: [legacy], streakDays: 3 }));
    const app = { getPath: () => directory };
    const { SettingsStore } = loadTypeScript(path.join(root, 'src', 'main', 'settingsStore.ts'), {
      electron: { app },
      './StudyDatabase': { StudyDatabase },
      '../shared/habitEngine': habitEngine
    });
    const store = new SettingsStore(directory);
    t.after(() => store.close());
    assert.equal(store.get().studySessions[0].id, 'legacy-1');
    assert.equal(store.get().streakDays, 3);
    const recorded = store.recordStudySession({ id: 'new-1', subject: 'Math', durationMinutes: 35, intention: 'Practice', timestamp: Date.now() });
    assert.equal(recorded.studySessions.length, 2);
    assert.equal(store.recordStudySession({ id: 'new-1', subject: 'Math', durationMinutes: 35, intention: 'Practice', timestamp: Date.now() }).xp, recorded.xp);
    store.set({ themeId: 'ocean' });
    const jsonOnDisk = JSON.parse(fs.readFileSync(path.join(directory, 'settings.json'), 'utf8'));
    assert.equal(jsonOnDisk.studySessions, undefined, 'session history should be stored in SQLite');
    assert.equal(store.getWeeklyReview().sessionCount, 2);
  });
});

describe('Ad-block host matching (production source)', () => {
  test('matches exact and subdomains without false-positive suffix matches', () => {
    assert.equal(isBlockedRequestUrl('https://doubleclick.net/ad.js'), true);
    assert.equal(isBlockedRequestUrl('https://stats.doubleclick.net/pixel'), true);
    assert.equal(isBlockedRequestUrl('https://notdoubleclick.net/ad.js'), false);
    assert.equal(isBlockedRequestUrl('not a url'), false);
  });
});

describe('Credential manager integration', () => {
  test('calls Electron safeStorage and keeps plaintext out of the credential file', (t) => {
    const directory = temporaryDirectory(t);
    const safeStorage = {
      isEncryptionAvailable: () => true,
      encryptString: (value) => Buffer.from(`mock-safe-storage:${value}`),
      decryptString: (value) => value.toString().replace(/^mock-safe-storage:/, '')
    };
    const { CredentialsManager } = loadTypeScript(path.join(root, 'src', 'main', 'CredentialsManager.ts'), {
      electron: { app: { getPath: () => directory }, safeStorage }
    });
    const manager = new CredentialsManager();
    manager.saveCredential('https://portal.example/login', 'student', 'private-password');
    const credentialsFile = fs.readFileSync(path.join(directory, 'credentials.json'), 'utf8');
    assert.equal(credentialsFile.includes('private-password'), false);
    assert.deepEqual(manager.getCredential('portal.example'), { username: 'student', password: 'private-password' });
    assert.deepEqual(manager.listCredentials(), [{ host: 'portal.example', username: 'student' }]);
    manager.deleteCredential('portal.example');
    assert.equal(manager.getCredential('portal.example'), null);
  });

  test('does not save credentials when Electron encryption is unavailable', (t) => {
    const directory = temporaryDirectory(t);
    const { CredentialsManager } = loadTypeScript(path.join(root, 'src', 'main', 'CredentialsManager.ts'), {
      electron: { app: { getPath: () => directory }, safeStorage: { isEncryptionAvailable: () => false } }
    });
    assert.throws(() => new CredentialsManager().saveCredential('portal.example', 'student', 'password'), /Secure credential storage is unavailable/);
  });
});

describe('Electron security configuration', () => {
  const mainSource = fs.readFileSync(path.join(root, 'src', 'main', 'index.ts'), 'utf8');
  const tabsSource = fs.readFileSync(path.join(root, 'src', 'main', 'TabManager.ts'), 'utf8');
  const preloadSource = fs.readFileSync(path.join(root, 'src', 'preload', 'index.ts'), 'utf8');
  const credentialsSource = fs.readFileSync(path.join(root, 'src', 'main', 'CredentialsManager.ts'), 'utf8');
  const packageConfig = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const permissionsSource = fs.readFileSync(path.join(root, 'src', 'main', 'webPermissions.ts'), 'utf8');
  const localHtml = fs.readFileSync(path.join(root, 'src', 'renderer', 'index.html'), 'utf8');

  test('isolates local UI and web content from Node and renderer IPC internals', () => {
    assert.match(mainSource, /contextIsolation:\s*true/);
    assert.match(mainSource, /nodeIntegration:\s*false/);
    assert.match(mainSource, /sandbox:\s*true/);
    assert.match(tabsSource, /contextIsolation:\s*true/);
    assert.match(tabsSource, /nodeIntegration:\s*false/);
    assert.match(tabsSource, /sandbox:\s*true/);
    assert.match(preloadSource, /contextBridge\.exposeInMainWorld\('studyBrowser', api\)/);
    assert.doesNotMatch(preloadSource, /exposeInMainWorld\(['"]ipcRenderer/);
  });

  test('does not spoof Chrome and sends Google account auth to the system browser', () => {
    assert.doesNotMatch(mainSource + tabsSource, /setUserAgent\(|userAgentFallback\s*=/);
    assert.match(tabsSource, /isGoogleAuthUrl/);
    assert.match(tabsSource, /shell\.openExternal\(url\)/);
  });

  test('uses Electron safeStorage for credential encryption', () => {
    assert.match(credentialsSource, /safeStorage\.encryptString/);
    assert.match(credentialsSource, /safeStorage\.decryptString/);
    assert.match(credentialsSource, /isEncryptionAvailable/);
    assert.match(credentialsSource, /LEGACY_XOR_SALT\.charCodeAt/);
  });

  test('limits web views to HTTP(S) and an explicit in-app route allowlist', () => {
    assert.match(tabsSource, /url\.protocol === 'http:' \|\| url\.protocol === 'https:'/);
    assert.match(tabsSource, /dashboard\|streak\|exams\|settings\|bookmarks\|adblock\|review/);
  });

  test('prompts for supported website permissions and denies unknown permissions by default', () => {
    assert.match(mainSource, /registerWebPermissionHandlers\(session\.defaultSession/);
    assert.match(permissionsSource, /setPermissionRequestHandler/);
    assert.match(permissionsSource, /setPermissionCheckHandler/);
    assert.match(permissionsSource, /PROMPTABLE_PERMISSIONS\.has\(permission\)/);
    assert.match(permissionsSource, /GRANT_LIFETIME_MS = 15 \* 60 \* 1000/);
    assert.match(localHtml, /Content-Security-Policy/);
    assert.match(localHtml, /script-src 'self'/);
    assert.match(localHtml, /object-src 'none'/);
  });

  test('connects saved accessibility toggles to real UI styles', () => {
    const themeSource = fs.readFileSync(path.join(root, 'src', 'renderer', 'src', 'theme', 'ThemeContext.tsx'), 'utf8');
    const cssSource = fs.readFileSync(path.join(root, 'src', 'renderer', 'src', 'index.css'), 'utf8');
    assert.match(themeSource, /dataset\.highContrast = settings\?\.highContrastMode/);
    assert.match(themeSource, /high-legibility-font/);
    assert.match(cssSource, /:root\[data-high-contrast='true'\]/);
    assert.match(cssSource, /body\.high-legibility-font/);
    assert.match(cssSource, /prefers-reduced-motion: reduce/);
  });

  test('never disables Chromium sandbox in the screenshot launch helper', () => {
    assert.doesNotMatch(packageConfig.scripts.screenshots, /--no-sandbox/);
  });
});

describe('Release resources', () => {
  test('contains valid Windows installer assets', () => {
    const png = fs.readFileSync(path.join(root, 'assets', 'icon.png'));
    const ico = fs.readFileSync(path.join(root, 'assets', 'icon.ico'));
    assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.equal(ico.readUInt16LE(0), 0);
    assert.equal(ico.readUInt16LE(2), 1);
    const config = JSON.parse(fs.readFileSync(path.join(root, 'electron-builder.json'), 'utf8'));
    assert.equal(config.appId, 'com.hootly.browser');
    assert.equal(config.publish[0].repo, 'hootly');
  });
});
