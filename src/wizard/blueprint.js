// A blueprint is the layout somebody wants: roles, categories and the channels inside them. It is
// plain data on purpose — a preset, a JSON file, and (later) something the AI proposes can all be
// the same object, and the planner only ever reads it.

/** @typedef {{ name: string, type?: 'text' | 'voice' | 'announcement' | 'forum', topic?: string }} BlueprintChannel */
/** @typedef {{ name: string, colour?: string }} BlueprintRole */
/** @typedef {{ name: string, channels: BlueprintChannel[] }} BlueprintCategory */
/** @typedef {{ name: string, summary?: string, roles: BlueprintRole[], categories: BlueprintCategory[] }} Blueprint */

export const PRESETS = Object.freeze({
  community: {
    name: 'community',
    summary: 'A friendly general server: a lobby, a few topic rooms, staff space and voice.',
    roles: [{ name: 'Member' }, { name: 'Moderator' }, { name: 'Admin' }],
    categories: [
      {
        name: 'Start here',
        channels: [
          { name: 'welcome', type: 'text', topic: 'Rules and how this place works' },
          { name: 'announcements', type: 'announcement', topic: 'Things worth interrupting you for' },
          { name: 'introductions', type: 'text', topic: 'Say hello, one line is enough' },
        ],
      },
      {
        name: 'Community',
        channels: [
          { name: 'general', type: 'text', topic: 'Anything and everything' },
          { name: 'off-topic', type: 'text', topic: 'The rest of it' },
          { name: 'Lounge', type: 'voice' },
        ],
      },
      {
        name: 'Staff',
        channels: [
          { name: 'staff-chat', type: 'text', topic: 'Staff only' },
          { name: 'mod-log', type: 'text', topic: 'Moderation trail' },
        ],
      },
    ],
  },
  gaming: {
    name: 'gaming',
    summary: 'Clans, sessions and voice rooms: LFG, clips, and one voice channel per squad.',
    roles: [{ name: 'Player' }, { name: 'Squad lead' }, { name: 'Moderator' }, { name: 'Admin' }],
    categories: [
      {
        name: 'Start here',
        channels: [
          { name: 'welcome', type: 'text', topic: 'What this clan is about' },
          { name: 'announcements', type: 'announcement', topic: 'Sessions, patches, events' },
        ],
      },
      {
        name: 'Play',
        channels: [
          { name: 'looking-for-group', type: 'text', topic: 'Post the game, the time, the slots' },
          { name: 'clips', type: 'text', topic: 'The good ones' },
          { name: 'Squad one', type: 'voice' },
          { name: 'Squad two', type: 'voice' },
        ],
      },
      {
        name: 'Staff',
        channels: [{ name: 'staff-chat', type: 'text', topic: 'Staff only' }],
      },
    ],
  },
  study: {
    name: 'study',
    summary: 'A quiet study server: subjects, questions, and voice for sessions.',
    roles: [{ name: 'Student' }, { name: 'Tutor' }, { name: 'Admin' }],
    categories: [
      {
        name: 'Start here',
        channels: [
          { name: 'welcome', type: 'text', topic: 'How the study server works' },
          { name: 'announcements', type: 'announcement', topic: 'Sessions and deadlines' },
        ],
      },
      {
        name: 'Study',
        channels: [
          { name: 'questions', type: 'text', topic: 'Ask anything, no question is too small' },
          { name: 'resources', type: 'text', topic: 'Links and notes worth keeping' },
          { name: 'Study room', type: 'voice' },
        ],
      },
    ],
  },
  support: {
    name: 'support',
    summary: 'A support desk: a ticket-shaped intake, an FAQ, and a staff room.',
    roles: [{ name: 'Customer' }, { name: 'Support' }, { name: 'Admin' }],
    categories: [
      {
        name: 'Help',
        channels: [
          { name: 'faq', type: 'text', topic: 'Read this before asking' },
          { name: 'get-help', type: 'text', topic: 'One thread per problem, please' },
          { name: 'status', type: 'announcement', topic: 'Known issues and fixes' },
        ],
      },
      {
        name: 'Staff',
        channels: [
          { name: 'support-queue', type: 'text', topic: 'Staff only' },
          { name: 'internal', type: 'text', topic: 'Staff only' },
        ],
      },
    ],
  },
});

/**
 * Read a blueprint from a preset name, a JSON file's text, or an object, and refuse anything that
 * would create two channels with the same name in one category — Fluxer allows it and it makes a
 * server unreadable, which is the opposite of the job.
 * @returns {Blueprint}
 */
export function readBlueprint(source) {
  let blueprint = source;
  if (typeof source === 'string') {
    const preset = PRESETS[source.trim().toLowerCase()];
    if (preset) blueprint = preset;
    else {
      try {
        blueprint = JSON.parse(source);
      } catch {
        throw new Error(`No preset called "${source}" and it is not JSON. Known presets: ${Object.keys(PRESETS).join(', ')}.`);
      }
    }
  }
  if (!blueprint || typeof blueprint !== 'object') throw new Error('A blueprint is required.');
  if (!Array.isArray(blueprint.categories)) throw new Error('A blueprint needs a categories array.');

  const seen = new Set();
  for (const category of blueprint.categories) {
    if (!category?.name) throw new Error('Every category needs a name.');
    for (const channel of category.channels ?? []) {
      if (!channel?.name) throw new Error(`A channel in "${category.name}" has no name.`);
      const key = `${category.name.toLowerCase()}/${channel.name.toLowerCase()}`;
      if (seen.has(key)) throw new Error(`"${category.name}" lists ${channel.name} twice.`);
      seen.add(key);
    }
  }
  return {
    name: String(blueprint.name ?? 'custom'),
    summary: blueprint.summary ?? '',
    roles: Array.isArray(blueprint.roles) ? blueprint.roles : [],
    categories: blueprint.categories,
  };
}
