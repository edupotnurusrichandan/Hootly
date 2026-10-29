const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const path = require('node:path');
const { loadTypeScript } = require('./loadTypeScript');

const root = path.join(__dirname, '..');
const { registerWebPermissionHandlers } = loadTypeScript(path.join(root, 'src', 'main', 'webPermissions.ts'));

class FakeWebContents extends EventEmitter {
  constructor(url = 'https://school.example/lesson') {
    super();
    this.id = 1;
    this.url = url;
    this.destroyed = false;
  }
  getURL() { return this.url; }
  isDestroyed() { return this.destroyed; }
}

function setup({ allow = true, now = () => 1000 } = {}) {
  const contents = new FakeWebContents();
  const session = {
    setPermissionRequestHandler(handler) { this.requestHandler = handler; },
    setPermissionCheckHandler(handler) { this.checkHandler = handler; }
  };
  const prompts = [];
  registerWebPermissionHandlers(session, () => ({ isDestroyed: () => false }), async (_window, permission, origin) => {
    prompts.push({ permission, origin });
    return allow;
  }, now);
  return { contents, session, prompts };
}

function request(session, contents, permission, requestingUrl = contents.getURL()) {
  return new Promise((resolve) => {
    session.requestHandler(contents, permission, resolve, { requestingUrl, isMainFrame: true });
  });
}

describe('remote website permission policy', () => {
  test('denies by default and asks before granting a known site permission', async () => {
    let clock = 1000;
    const state = setup({ now: () => clock });
    assert.equal(state.session.checkHandler(state.contents, 'media', 'https://school.example'), false);
    assert.equal(await request(state.session, state.contents, 'media'), true);
    assert.deepEqual(state.prompts, [{ permission: 'media', origin: 'https://school.example' }]);
    assert.equal(state.session.checkHandler(state.contents, 'media', 'https://school.example'), true);
    assert.equal(await request(state.session, state.contents, 'media'), true);
    assert.equal(state.prompts.length, 1, 'a temporary tab grant avoids repeated prompts');
    clock += 15 * 60 * 1000;
    assert.equal(state.session.checkHandler(state.contents, 'media', 'https://school.example'), false);
  });

  test('denies unknown permissions and keeps grants scoped to the tab origin', async () => {
    const state = setup();
    assert.equal(await request(state.session, state.contents, 'usb'), false);
    assert.equal(state.prompts.length, 0);

    assert.equal(await request(state.session, state.contents, 'geolocation'), true);
    assert.equal(state.session.checkHandler(state.contents, 'geolocation', 'https://other.example'), false);
    state.contents.url = 'https://other.example/lesson';
    assert.equal(state.session.checkHandler(state.contents, 'geolocation', 'https://school.example'), false);
  });

  test('does not prompt for opaque origins or grant when the user blocks access', async () => {
    const opaque = setup();
    assert.equal(await request(opaque.session, opaque.contents, 'notifications', 'data:text/html,hello'), false);
    assert.equal(opaque.prompts.length, 0);

    const blocked = setup({ allow: false });
    assert.equal(await request(blocked.session, blocked.contents, 'notifications'), false);
    assert.equal(blocked.session.checkHandler(blocked.contents, 'notifications', 'https://school.example'), false);
  });
});
