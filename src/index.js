#!/usr/bin/env node
// Entry point: read the config, build the two clients, wire dispatch to the bot, stay up.
//
// Also the CLI for a one-shot view, which is how you check a plan without inviting a bot anywhere:
//   node src/index.js plan community --guild 1234          (needs FLUXER_GUILD_ID or --guild)
//   node src/index.js snapshot --guild 1234                (what the planner sees)
import { readConfig } from './config.js';
import { createRest } from './fluxer/rest.js';
import { connectGateway } from './fluxer/gateway.js';
import { createBot } from './bot.js';
import { readBlueprint } from './wizard/blueprint.js';
import { planSetup } from './wizard/plan.js';
import { renderPlan } from './wizard/render.js';

const log = (scope, message) => console.log(`[${new Date().toISOString()}] ${scope}: ${message}`);

function flag(args, name) {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? null : args[at + 1] ?? null;
}

function snapshotOf(guild) {
  const channels = Array.isArray(guild?.channels) ? guild.channels : [];
  const roles = Array.isArray(guild?.roles) ? guild.roles : [];
  return {
    categories: channels.filter((channel) => channel.type === 4 || channel.type === 'category').map((channel) => ({ id: channel.id, name: channel.name, type: 'category' })),
    channels: channels.filter((channel) => channel.type !== 4 && channel.type !== 'category').map((channel) => ({ id: channel.id, name: channel.name, type: typeof channel.type === 'string' ? channel.type : 'text' })),
    roles: roles.map((role) => ({ id: role.id, name: role.name })),
  };
}

async function cli(args, config) {
  const rest = createRest({ token: config.token, base: config.base });
  const command = args[0];
  const guildId = flag(args, 'guild') ?? config.guildId;
  if (!guildId) throw new Error('No guild: pass --guild <id> or set FLUXER_GUILD_ID.');

  if (command === 'snapshot') {
    console.log(JSON.stringify(snapshotOf(await rest.guild(guildId)), null, 2));
    return 0;
  }
  if (command === 'plan') {
    const blueprint = readBlueprint(flag(args, 'preset') ?? args[1] ?? 'community');
    const plan = planSetup(snapshotOf(await rest.guild(guildId)), blueprint);
    console.log(renderPlan(plan, blueprint));
    return plan.steps.length ? 0 : 0;
  }
  throw new Error(`Unknown command "${command}". Try: plan <preset>, snapshot.`);
}

async function main() {
  const args = process.argv.slice(2);
  const config = readConfig();

  if (args.length) {
    process.exitCode = await cli(args, config);
    return;
  }

  const rest = createRest({ token: config.token, base: config.base });
  const bot = createBot({ rest, log: (scope, message) => log(scope, message) });
  const gatewayUrl = config.gatewayUrl ?? await rest.gatewayUrl();
  log('boot', `connecting to ${gatewayUrl}`);

  const gateway = connectGateway({
    url: gatewayUrl,
    token: config.token,
    onLog: (level, message) => log(level, message),
    onEvent: (name, data) => {
      if (name === 'MESSAGE_CREATE') void bot.onMessage(data);
    },
  });

  const stop = () => {
    log('boot', 'shutting down');
    gateway.close();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((error) => {
  console.error(`fatal: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
