import assert from 'node:assert/strict';
import test from 'node:test';
import { createRest, FluxerError } from '../src/fluxer/rest.js';

const ok = (payload, status = 200) => ({
  ok: status < 400,
  status,
  headers: new Map(),
  text: async () => (payload === null ? '' : JSON.stringify(payload)),
  json: async () => payload,
});

test('the token rides every request as a Bot authorization', async () => {
  const seen = [];
  const rest = createRest({
    token: 'secret-token',
    base: 'https://api.example/api/',
    fetchImpl: async (url, options) => {
      seen.push({ url, options });
      return ok({ id: '1' });
    },
  });
  await rest.guild('42');
  assert.equal(seen[0].url, 'https://api.example/api/v1/guilds/42', 'base trailing slash is normalised');
  assert.equal(seen[0].options.headers.authorization, 'Bot secret-token');
});

test('a message is a POST whose body carries the content', async () => {
  let seen = null;
  const rest = createRest({
    token: 't',
    base: 'https://api.example/api',
    fetchImpl: async (url, options) => {
      seen = { url, options };
      return ok({ id: 'm1' }, 200);
    },
  });
  await rest.sendMessage('9', 'hello');
  assert.equal(seen.url, 'https://api.example/api/v1/channels/9/messages');
  assert.equal(seen.options.method, 'POST');
  assert.deepEqual(JSON.parse(seen.options.body), { content: 'hello' });
});

test('an error keeps the status and the API code, which is what a caller branches on', async () => {
  const rest = createRest({
    token: 't',
    base: 'https://api.example/api',
    fetchImpl: async () => ok({ code: 'MISSING_ACCESS', message: 'Missing Access' }, 403),
  });
  await assert.rejects(() => rest.guild('1'), (error) => {
    assert.ok(error instanceof FluxerError);
    assert.equal(error.status, 403);
    assert.equal(error.code, 'MISSING_ACCESS');
    return true;
  });
});

test('a rate limit is waited out once and then retried', async () => {
  let calls = 0;
  let waited = 0;
  const rest = createRest({
    token: 't',
    base: 'https://api.example/api',
    sleep: async (ms) => {
      waited = ms;
    },
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? ok({ retry_after: 0.5 }, 429)
        : ok({ id: '1' });
    },
  });
  const guild = await rest.guild('1');
  assert.equal(calls, 2);
  assert.equal(waited, 500);
  assert.equal(guild.id, '1');
});

test('204 is a success with no body', async () => {
  const rest = createRest({
    token: 't',
    base: 'https://api.example/api',
    fetchImpl: async () => ok(null, 204),
  });
  assert.equal(await rest.request('DELETE', '/v1/channels/1/messages/2'), null);
});

test('the gateway URL falls back to the Discord-shaped path when the first is not routed', async () => {
  const tried = [];
  const rest = createRest({
    token: 't',
    base: 'https://api.example/api',
    fetchImpl: async (url) => {
      tried.push(url);
      if (url.endsWith('/v1/gateway')) return ok({ code: 'UNKNOWN_ROUTE' }, 404);
      return ok({ url: 'wss://gateway.example' });
    },
  });
  assert.equal(await rest.gatewayUrl(), 'wss://gateway.example');
  assert.deepEqual(tried.map((url) => new URL(url).pathname), ['/api/v1/gateway', '/api/v1/gateway/bot']);
});

test('no token is a construction error, not a 401 later', () => {
  assert.throws(() => createRest({ token: '', base: 'https://api.example/api' }), /bot token/i);
});
