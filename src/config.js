// Environment in, a config object out. Fail loudly and early: a bot that starts with half a token is
// a bot that answers nothing for an hour while somebody reads logs.
export function readConfig(env = process.env) {
  const token = String(env.FLUXER_BOT_TOKEN ?? '').trim();
  const base = String(env.FLUXER_API_BASE ?? '').trim();
  if (!token) throw new Error('FLUXER_BOT_TOKEN is missing — see .env.example.');
  if (!base) throw new Error('FLUXER_API_BASE is missing — see .env.example.');
  return {
    token,
    base,
    guildId: String(env.FLUXER_GUILD_ID ?? '').trim() || null,
    prefix: String(env.WIZARDRY_PREFIX ?? '!wiz').trim() || '!wiz',
    gatewayUrl: String(env.FLUXER_GATEWAY_URL ?? '').trim() || null,
  };
}
