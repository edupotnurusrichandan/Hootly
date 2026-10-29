import { app, safeStorage } from 'electron';
import fs from 'fs';
import path from 'path';

const LEGACY_XOR_SALT = 'H00tly-StudyBr0wser-S3cr3t-S4lt!';

function decryptLegacy(encoded: string): string {
  const text = Buffer.from(encoded, 'base64').toString('binary');
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ LEGACY_XOR_SALT.charCodeAt(i % LEGACY_XOR_SALT.length));
  }
  return result;
}

interface CredentialEntry {
  host: string;
  username: string;
  encryptedPassword: string;
  encryption?: 'safeStorage';
}

export class CredentialsManager {
  private filePath: string;

  constructor() {
    const userData = app.getPath('userData');
    this.filePath = path.join(userData, 'credentials.json');
  }

  private load(): CredentialEntry[] {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((entry): entry is CredentialEntry =>
          !!entry && typeof entry.host === 'string' && typeof entry.username === 'string' && typeof entry.encryptedPassword === 'string'
        ) : [];
      }
    } catch {
      // ignore
    }
    return [];
  }

  private save(entries: CredentialEntry[]): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(entries, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save credentials:', err);
    }
  }

  public saveCredential(host: string, username: string, password: string): void {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Secure credential storage is unavailable on this device.');
    }
    const normalizedHost = this.normalizeHost(host);
    const entries = this.load();
    const existing = entries.findIndex((e) => e.host === normalizedHost);
    const entry: CredentialEntry = {
      host: normalizedHost,
      username,
      encryptedPassword: safeStorage.encryptString(password).toString('base64'),
      encryption: 'safeStorage'
    };
    if (existing >= 0) {
      entries[existing] = entry;
    } else {
      entries.push(entry);
    }
    this.save(entries);
  }

  public getCredential(host: string): { username: string; password: string } | null {
    const entries = this.load();
    const normalizedHost = this.normalizeHost(host);
    const entry = entries.find((e) => this.normalizeHost(e.host) === normalizedHost);
    if (!entry) return null;
    if (entry.encryption === 'safeStorage') {
      if (!safeStorage.isEncryptionAvailable()) return null;
      try {
        return { username: entry.username, password: safeStorage.decryptString(Buffer.from(entry.encryptedPassword, 'base64')) };
      } catch {
        return null;
      }
    }
    // Upgrade legacy XOR-protected entries the next time they are read.
    const password = decryptLegacy(entry.encryptedPassword);
    if (safeStorage.isEncryptionAvailable()) {
      entry.encryptedPassword = safeStorage.encryptString(password).toString('base64');
      entry.encryption = 'safeStorage';
      this.save(entries);
    }
    return {
      username: entry.username,
      password
    };
  }

  public listCredentials(): Array<{ host: string; username: string }> {
    return this.load().map(({ host, username }) => ({ host, username }));
  }

  public deleteCredential(host: string): void {
    const normalizedHost = this.normalizeHost(host);
    const entries = this.load().filter((e) => this.normalizeHost(e.host) !== normalizedHost);
    this.save(entries);
  }

  private normalizeHost(host: string): string {
    try {
      return new URL(host.includes('://') ? host : `https://${host}`).hostname.toLowerCase();
    } catch {
      return host.trim().toLowerCase();
    }
  }
}
