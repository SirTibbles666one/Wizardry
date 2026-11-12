// The REST half: one fetch wrapper that knows about the token, the versioned base, the error shape
// and Fluxer's rate-limit headers. No dependencies — Node 22 has fetch.
import { ROUTES } from './routes.js';

export class FluxerError extends Error {
  constructor(status, payload, path) {
    const code = payload?.code ?? payload?.error?.code ?? null;
    const message = payload?.message ?? payload?.error?.message ?? `HTTP ${status}`;
    super(`${path} -> ${status}${code ? ` ${code}` : ''}: ${message}`);
    this.name = 'FluxerError';
    this.status = status;
    this.code = code;
    this.payload = payload;
    this.path = path;
  }
}

/**
 * @param {{ token: string, base: string, fetchImpl?: typeof fetch, sleep?: (ms: number) => Promise<void> }} options
 */
export function createRest({ token, base, fetchImpl = globalThis.fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  if (!token) throw new Error('A bot token is required.');
  if (!base) throw new Error('An API base is required (for example https://api.fluxer.app/api).');
  const root = base.replace(/\/+$/, '');

  async function request(method, path, { body, retries = 1 } = {}) {
    const response = await fetchImpl(`${root}${path}`, {
      method,
      headers: {
        authorization: `Bot ${token}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    if (response.status === 429 && retries > 0) {
      const payload = await response.json().catch(() => ({}));
      const wait = Number(payload?.retry_after ?? response.headers.get('retry-after') ?? 1);
      await sleep(Math.min(Math.max(wait, 0), 30) * 1000);
      return request(method, path, { body, retries: retries - 1 });
    }

    if (response.status === 204) return null;
    const text = await response.text();
    const payload = text ? safeJson(text) : null;
    if (!response.ok) throw new FluxerError(response.status, payload, path);
    return payload;
  }

  return {
    request,
    async guild(guildId) {
      return request('GET', ROUTES.guild(guildId));
    },
    async sendMessage(channelId, content) {
      return request('POST', ROUTES.channelMessages(channelId), { body: { content } });
    },
    /** The gateway URL, trying the documented path and then the Discord-shaped one. */
    async gatewayUrl() {
      let lastError = null;
      for (const path of ROUTES.gateway) {
        try {
          const payload = await request('GET', path);
          const url = payload?.url ?? payload?.gateway?.url;
          if (url) return url;
          lastError = new Error(`${path} answered without a url`);
        } catch (error) {
          if (error instanceof FluxerError && error.status === 401) throw error;
          lastError = error;
        }
      }
      throw lastError ?? new Error('No gateway URL');
    },
  };
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 200) };
  }
}
