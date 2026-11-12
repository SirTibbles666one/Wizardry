// Applying a plan. Every step is one REST call, run in order, and the run stops at the first
// failure: a half-built server is easier to finish than one built on a wrong assumption.
//
// Creating a channel needs its category's id, which only exists once the category is created — so
// the run keeps a map from category name to id, filled as it goes.
import { ROUTES } from '../fluxer/routes.js';

const TYPE_IDS = { text: 0, voice: 2, category: 4, announcement: 5, forum: 15 };

/**
 * @param {{ request: Function }} rest
 * @param {string} guildId
 * @param {{ steps: Array<{op: string, name: string, parent?: string, type?: string, topic?: string, colour?: string}> }} plan
 */
export async function applyPlan(rest, guildId, plan) {
  const created = [];
  const categoryIds = new Map();
  const roleIds = new Map();

  for (const step of plan.steps) {
    try {
      if (step.op === 'create_category') {
        const payload = await rest.request('POST', ROUTES.guildChannels(guildId), {
          body: { name: step.name, type: TYPE_IDS.category },
        });
        if (payload?.id) categoryIds.set(step.name.toLowerCase(), payload.id);
        created.push(`category ${step.name}`);
        continue;
      }

      if (step.op === 'create_channel') {
        const body = { name: step.name, type: TYPE_IDS[step.type ?? 'text'] ?? 0 };
        if (step.topic) body.topic = step.topic;
        const parentId = step.parent ? categoryIds.get(step.parent.toLowerCase()) : null;
        if (parentId) body.parent_id = parentId;
        const payload = await rest.request('POST', ROUTES.guildChannels(guildId), { body });
        if (payload?.id) categoryIds.set(`${step.name}`.toLowerCase(), payload.id);
        created.push(`${step.type ?? 'text'} channel #${step.name}`);
        continue;
      }

      if (step.op === 'create_role') {
        const body = { name: step.name };
        if (step.colour) body.color = step.colour;
        const payload = await rest.request('POST', ROUTES.guildRoles(guildId), { body });
        if (payload?.id) roleIds.set(step.name.toLowerCase(), payload.id);
        created.push(`role ${step.name}`);
        continue;
      }

      throw new Error(`Unknown step: ${step.op}`);
    } catch (error) {
      return {
        ok: false,
        created,
        failedStep: step,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return { ok: true, created, failedStep: null, error: null };
}
