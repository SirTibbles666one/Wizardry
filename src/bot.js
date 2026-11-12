// The bot: text commands in, plan and apply out. It holds no state beyond the pending plans it has
// offered, keyed by channel, so a restart forgets an unconfirmed plan rather than applying one
// nobody is waiting for.
import { readBlueprint, PRESETS } from './wizard/blueprint.js';
import { planSetup } from './wizard/plan.js';
import { renderPlan, renderSteps } from './wizard/render.js';
import { applyPlan } from './wizard/apply.js';

const HELP = [
  '**Wizardry** — guided setup for this server.',
  '',
  `\`!wiz plan <preset>\` — show what a layout would create. Presets: ${Object.keys(PRESETS).join(', ')}.`,
  '`!wiz show` — show the plan already offered here.',
  '`!wiz apply` — create it (only after a plan is on screen).',
  '`!wiz cancel` — forget the plan offered here.',
  '`!wiz preview <json>\` — plan from a blueprint you paste.',
].join('\n');

export function createBot({ rest, log = () => {} }) {
  /** @type {Map<string, { plan: ReturnType<typeof planSetup>, blueprint: object, guildId: string }>} */
  const pending = new Map();

  function snapshotOf(guild) {
    const channels = Array.isArray(guild?.channels) ? guild.channels : [];
    const roles = Array.isArray(guild?.roles) ? guild.roles : [];
    const typeName = (type) => {
      if (typeof type === 'string') return type;
      const found = Object.entries({ 0: 'text', 2: 'voice', 4: 'category', 5: 'announcement', 15: 'forum' }).find(([, id]) => id === type);
      return found ? found[0] : 'text';
    };
    return {
      categories: channels.filter((channel) => typeName(channel.type) === 'category').map((channel) => ({ id: channel.id, name: channel.name, type: 'category' })),
      channels: channels.filter((channel) => typeName(channel.type) !== 'category').map((channel) => ({ id: channel.id, name: channel.name, type: typeName(channel.type) })),
      roles: roles.map((role) => ({ id: role.id, name: role.name })),
    };
  }

  /**
   * @param {{ content: string, channel_id: string, guild_id: string, author?: { bot?: boolean } }} message
   */
  async function onMessage(message) {
    const content = String(message?.content ?? '').trim();
    if (!content || !content.toLowerCase().startsWith('!wiz')) return;
    if (message.author?.bot) return;

    const [, , command = 'help', ...rest] = content.split(/\s+/);
    const channelId = message.channel_id;
    const guildId = message.guild_id;
    const say = (text) => rest_send(channelId, text);

    try {
      if (!guildId) return say('Run this in a server, not a direct message.');

      if (command === 'help') return say(HELP);

      if (command === 'plan' || command === 'preview') {
        const blueprint = readBlueprint(command === 'preview' ? rest.join(' ') : rest[0] ?? 'community');
        const guild = await rest.guild(guildId);
        const plan = planSetup(snapshotOf(guild), blueprint);
        pending.set(channelId, { plan, blueprint, guildId });
        log('plan', `${blueprint.name}: ${plan.steps.length} steps in ${guildId}`);
        return say(renderPlan(plan, blueprint));
      }

      if (command === 'show') {
        const held = pending.get(channelId);
        if (!held) return say('No plan is waiting here. Try `!wiz plan community`.');
        return say(renderPlan(held.plan, held.blueprint));
      }

      if (command === 'cancel') {
        const held = pending.delete(channelId);
        return say(held ? 'Plan forgotten. Nothing was created.' : 'There was no plan to forget.');
      }

      if (command === 'apply') {
        const held = pending.get(channelId);
        if (!held) return say('No plan is waiting here. Try `!wiz plan community` first.');
        if (!held.plan.steps.length) {
          pending.delete(channelId);
          return say('Nothing to apply — that layout is already in place.');
        }
        const result = await applyPlan(rest, held.guildId, held.plan);
        pending.delete(channelId);
        if (!result.ok) {
          return say(`Stopped at **${result.failedStep?.name}**: ${result.error}\nCreated so far:\n${result.created.join('\n') || '(nothing)'}`);
        }
        log('apply', `created ${result.created.length} things in ${guildId}`);
        return say(`Done — ${result.created.length} things created:\n${result.created.join('\n')}\n\n_Run \`!wiz plan ${held.blueprint.name}\` again to see what is left._`);
      }

      return say(`Unknown command \`${command}\`.\n\n${HELP}`);
    } catch (error) {
      log('error', `${command}: ${error instanceof Error ? error.message : String(error)}`);
      return say(`That did not work: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function rest_send(channelId, content) {
    // One message per answer: the plan is long, and splitting it is the transport's job.
    return rest.sendMessage(channelId, content.slice(0, 2000));
  }

  return { onMessage, help: HELP, renderSteps, pending };
}

/** The event names a gateway dispatch can carry, mapped to the one handler the bot has. */
export const EVENTS = Object.freeze({
  MESSAGE_CREATE: 'MESSAGE_CREATE',
  MESSAGE_UPDATE: 'MESSAGE_UPDATE',
});
