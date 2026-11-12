// The plan: what a blueprint asks for, minus what the server already has. Pure — it takes a plain
// snapshot of the guild and returns steps, so the whole decision is testable without a bot, a
// socket, or a server.
//
// The rule that matters: the plan never deletes and never renames. A wizard that quietly removes a
// category somebody made is worse than no wizard. Anything that exists but differs is reported as a
// question, not a change.

/** @typedef {{ id?: string, name: string, type?: string }} SnapshotChannel */
/** @typedef {{ categories: SnapshotChannel[], channels: SnapshotChannel[], roles: SnapshotChannel[] }} GuildSnapshot */
/** @typedef {{ op: 'create_role' | 'create_category' | 'create_channel', name: string, parent?: string, type?: string, topic?: string, colour?: string }} Step */

const KIND = { category: 'category', text: 'text', voice: 'voice', announcement: 'announcement', forum: 'forum' };

const same = (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

/**
 * @param {GuildSnapshot} snapshot
 * @param {import('./blueprint.js').Blueprint} blueprint
 * @returns {{ steps: Step[], kept: string[], questions: string[], summary: string }}
 */
export function planSetup(snapshot, blueprint) {
  const categories = snapshot?.categories ?? [];
  const channels = snapshot?.channels ?? [];
  const roles = snapshot?.roles ?? [];

  const steps = [];
  const kept = [];
  const questions = [];

  for (const role of blueprint.roles ?? []) {
    if (roles.some((existing) => same(existing.name, role.name))) kept.push(`role ${role.name}`);
    else steps.push({ op: 'create_role', name: role.name, ...(role.colour ? { colour: role.colour } : {}) });
  }

  for (const category of blueprint.categories ?? []) {
    const existingCategory = categories.find((candidate) => same(candidate.name, category.name));
    if (existingCategory) kept.push(`category ${category.name}`);
    else steps.push({ op: 'create_category', name: category.name });

    for (const channel of category.channels ?? []) {
      const wanted = channel.type ?? KIND.text;
      const existing = channels.find((candidate) => same(candidate.name, channel.name));
      if (!existing) {
        steps.push({
          op: 'create_channel',
          name: channel.name,
          parent: category.name,
          type: wanted,
          ...(channel.topic ? { topic: channel.topic } : {}),
        });
        continue;
      }
      kept.push(`channel ${channel.name}`);
      // Exists with another type: say so. Converting text to voice destroys the messages in it, so
      // that is a person's decision, never a step the wizard takes on its own.
      if (existing.type && existing.type !== wanted && existing.type !== KIND.category) {
        questions.push(
          `${channel.name} already exists as a ${existing.type} channel but this layout wants ${wanted}. Leave it as it is?`,
        );
      }
    }
  }

  // A blueprint can also ask for a channel that already lives outside the category it wants. Those
  // are reported, not moved: the parent is cosmetic and moving channels reorders somebody's server.
  const wantedNames = new Set((blueprint.categories ?? []).flatMap((category) => (category.channels ?? []).map((channel) => channel.name.toLowerCase())));
  const strays = channels.filter((channel) => wantedNames.has(String(channel.name ?? '').toLowerCase()) && channel.type !== KIND.category);
  if (strays.length && snapshot?.channelsWithParents) {
    for (const stray of strays) {
      const parent = snapshot.channelsWithParents[stray.id];
      if (parent && !blueprint.categories.some((category) => same(category.name, parent))) {
        questions.push(`${stray.name} is in "${parent}" but this layout lists it elsewhere. Leave it where it is?`);
      }
    }
  }

  const creates = steps.filter((step) => step.op === 'create_channel').length;
  const summary = steps.length
    ? `${steps.length} change${steps.length === 1 ? '' : 's'}: ${steps.filter((s) => s.op === 'create_category').length} categories, ${creates} channels, ${steps.filter((s) => s.op === 'create_role').length} roles. ${kept.length} already in place.`
    : `Nothing to do — all ${kept.length} pieces of this layout already exist.`;

  return { steps, kept, questions, summary };
}

/** The confirmation sentence a person presses. It names counts, never "everything". */
export function confirmLine(plan) {
  if (!plan.steps.length) return 'Nothing to apply.';
  return `Apply ${plan.steps.length} change${plan.steps.length === 1 ? '' : 's'}? Nothing existing is renamed or deleted.`;
}
