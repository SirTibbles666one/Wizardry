// Where the bot talks to a Fluxer instance.
//
// Every path is declared once, with the documentation page it came from, so a wrong guess is a one
// line fix rather than a hunt. Paths marked "documented" were read from docs.fluxer.com on
// 2026-11-12; the gateway path is the only one whose exact suffix the docs page does not spell out
// (it says "bots call this endpoint"), so the client tries `/v1/gateway` and then `/v1/gateway/bot`
// and remembers which answered.

export const ROUTES = Object.freeze({
  // docs.fluxer.com/http-api/gateway — "Bots call this endpoint to get the URL for the Gateway
  // WebSocket. User clients get the same URL from endpoints.gateway in instance discovery."
  gateway: ['/v1/gateway', '/v1/gateway/bot'],

  // docs.fluxer.com/http-api/guilds and /http-api/channels
  guild: (guildId) => `/v1/guilds/${guildId}`,
  channel: (channelId) => `/v1/channels/${channelId}`,
  channelMessages: (channelId) => `/v1/channels/${channelId}/messages`,
  channelMessage: (channelId, messageId) => `/v1/channels/${channelId}/messages/${messageId}`,

  // Guild layout. The docs list "Modify channel" and "Delete or leave channel" on the channels
  // page and the create routes under the guild; these two are the shapes the wizard needs and are
  // the first thing to re-check against a live instance (see README: "What is verified").
  guildChannels: (guildId) => `/v1/guilds/${guildId}/channels`,
  guildRoles: (guildId) => `/v1/guilds/${guildId}/roles`,
});

/** Gateway opcodes the client sends, from docs.fluxer.com/gateway/commands. */
export const OP = Object.freeze({
  DISPATCH: 0,
  HEARTBEAT: 1,
  IDENTIFY: 2,
  RESUME: 6,
  RECONNECT: 7,
  INVALID_SESSION: 9,
  HELLO: 10,
  HEARTBEAT_ACK: 11,
});
