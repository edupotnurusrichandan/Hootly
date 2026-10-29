import type { BrowserWindow, Session, WebContents } from 'electron';

const GRANT_LIFETIME_MS = 15 * 60 * 1000;

const PROMPTABLE_PERMISSIONS = new Set([
  'media',
  'display-capture',
  'geolocation',
  'notifications',
  'clipboard-read',
  'pointerLock',
  'fullscreen',
  'midi',
  'midiSysex'
]);

interface TemporaryGrant {
  topOrigin: string;
  expiresAt: number;
}

function webOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : null;
  } catch {
    return null;
  }
}

function grantKey(permission: string, requestingOrigin: string): string {
  return `${permission}\n${requestingOrigin}`;
}

export function registerWebPermissionHandlers(
  browserSession: Session,
  getMainWindow: () => BrowserWindow | null,
  confirmPermission: (window: BrowserWindow, permission: string, origin: string) => Promise<boolean>,
  now: () => number = Date.now
): void {
  const grantsByContents = new Map<number, Map<string, TemporaryGrant>>();
  const watchedContents = new WeakSet<WebContents>();

  const attachGrantLifecycle = (contents: WebContents) => {
    if (watchedContents.has(contents)) return;
    watchedContents.add(contents);
    contents.on('did-navigate', (_event, url) => {
      const currentOrigin = webOrigin(url);
      const grants = grantsByContents.get(contents.id);
      if (!grants) return;
      for (const [key, grant] of grants) {
        if (grant.topOrigin !== currentOrigin) grants.delete(key);
      }
      if (grants.size === 0) grantsByContents.delete(contents.id);
    });
    contents.once('destroyed', () => grantsByContents.delete(contents.id));
  };

  browserSession.setPermissionCheckHandler((contents, permission, requestingOrigin) => {
    if (!contents || contents.isDestroyed() || !PROMPTABLE_PERMISSIONS.has(permission)) return false;
    const topOrigin = webOrigin(contents.getURL());
    const requestedOrigin = webOrigin(requestingOrigin);
    if (!topOrigin || !requestedOrigin) return false;

    const grant = grantsByContents.get(contents.id)?.get(grantKey(permission, requestedOrigin));
    if (!grant || grant.expiresAt <= now() || grant.topOrigin !== topOrigin) return false;
    return true;
  });

  browserSession.setPermissionRequestHandler((contents, permission, callback, details) => {
    const deny = () => callback(false);
    if (!contents || contents.isDestroyed() || !PROMPTABLE_PERMISSIONS.has(permission)) return deny();

    const topOrigin = webOrigin(contents.getURL());
    const requestedOrigin = webOrigin(details.requestingUrl);
    if (!topOrigin || !requestedOrigin) return deny();

    const key = grantKey(permission, requestedOrigin);
    const currentGrant = grantsByContents.get(contents.id)?.get(key);
    if (currentGrant && currentGrant.expiresAt > now() && currentGrant.topOrigin === topOrigin) {
      return callback(true);
    }

    const owner = getMainWindow();
    if (!owner || owner.isDestroyed()) return deny();

    void confirmPermission(owner, permission, requestedOrigin).then((approved) => {
      if (!approved || contents.isDestroyed() || webOrigin(contents.getURL()) !== topOrigin) return deny();
      attachGrantLifecycle(contents);
      let grants = grantsByContents.get(contents.id);
      if (!grants) {
        grants = new Map();
        grantsByContents.set(contents.id, grants);
      }
      grants.set(key, { topOrigin, expiresAt: now() + GRANT_LIFETIME_MS });
      callback(true);
    }).catch(() => deny());
  });
}
