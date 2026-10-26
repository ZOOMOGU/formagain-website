import test from 'node:test';
import assert from 'node:assert/strict';

const origin = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw new Error('These tests only run against a local preview.');
const email = `formagain-qa-${Date.now()}@example.com`;
let cookie = '';
const post = (path, data, headers = {}) => fetch(`${origin}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, ...headers }, body: JSON.stringify(data) });

test('subscription lifecycle, validation and record ownership', async t => {
  try {
    await t.test('invalid address and missing consent are rejected', async () => {
      for (const bad of ['invalid', 'a@b', 'a..b@example.com', '.a@example.com']) {
        assert.equal((await post('/api/subscribe', { email: bad, consent: true })).status, 400);
      }
      assert.equal((await post('/api/subscribe', { email, consent: false })).status, 400);
    });
    await t.test('cross-origin requests and malformed payloads are rejected', async () => {
      assert.equal((await post('/api/subscribe', { email, consent: true }, { Origin: 'https://example.net' })).status, 403);
      assert.equal((await post('/api/subscribe', null)).status, 400);
      assert.equal((await post('/api/subscribe', { email, consent: true, website: 'x'.repeat(2100) })).status, 413);
    });
    await t.test('new subscription persists and issues a protected cancellation cookie', async () => {
      const r = await post('/api/subscribe', { email: ` ${email.toUpperCase()} `, consent: true });
      assert.equal(r.status, 200);
      assert.deepEqual(await r.json(), { success: true, canUnsubscribe: true });
      const setCookie = r.headers.get('set-cookie');
      assert.match(setCookie, /HttpOnly/); assert.match(setCookie, /SameSite=Strict/);
      cookie = setCookie.split(';')[0];
      assert.deepEqual(await (await fetch(`${origin}/api/subscribe`, { headers: { Cookie: cookie } })).json(), { subscribed: true });
    });
    await t.test('duplicate normalized address does not provide cancellation access', async () => {
      const r = await post('/api/subscribe', { email, consent: true });
      assert.equal(r.status, 200);
      assert.deepEqual(await r.json(), { success: true, canUnsubscribe: false });
      assert.equal(r.headers.get('set-cookie'), null);
      assert.deepEqual(await (await fetch(`${origin}/api/subscribe`)).json(), { subscribed: false });
    });
    await t.test('same subscriber retains cancellation access', async () => {
      assert.deepEqual(await (await post('/api/subscribe', { email, consent: true }, { Cookie: cookie })).json(), { success: true, canUnsubscribe: true });
    });
    await t.test('cancellation requires the owner cookie and same origin', async () => {
      assert.equal((await post('/api/unsubscribe', {})).status, 401);
      assert.equal((await post('/api/unsubscribe', {}, { Cookie: cookie, Origin: 'https://example.net' })).status, 403);
    });
    await t.test('subscriber can cancel and the record is deleted', async () => {
      const r = await post('/api/unsubscribe', {}, { Cookie: cookie });
      assert.equal(r.status, 200);
      assert.match(r.headers.get('set-cookie'), /Max-Age=0/);
      assert.deepEqual(await (await fetch(`${origin}/api/subscribe`, { headers: { Cookie: cookie } })).json(), { subscribed: false });
      const resub = await post('/api/subscribe', { email, consent: true });
      assert.deepEqual(await resub.json(), { success: true, canUnsubscribe: true });
      cookie = resub.headers.get('set-cookie').split(';')[0];
    });
  } finally {
    if (cookie) await post('/api/unsubscribe', {}, { Cookie: cookie });
  }
});
