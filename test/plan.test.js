import assert from 'node:assert/strict';
import test from 'node:test';
import { PRESETS, readBlueprint } from '../src/wizard/blueprint.js';
import { planSetup, confirmLine } from '../src/wizard/plan.js';

const empty = { categories: [], channels: [], roles: [] };

const blueprint = readBlueprint('community');

test('an empty server gets every piece of the layout, roles first', () => {
  const plan = planSetup(empty, blueprint);
  const ops = plan.steps.map((step) => step.op);
  assert.equal(ops.filter((op) => op === 'create_role').length, blueprint.roles.length);
  assert.equal(ops[0], 'create_role', 'roles exist before anything that needs them');
  assert.equal(ops.filter((op) => op === 'create_category').length, blueprint.categories.length);
  assert.equal(
    ops.filter((op) => op === 'create_channel').length,
    blueprint.categories.reduce((total, category) => total + category.channels.length, 0),
  );
  assert.equal(plan.kept.length, 0);
  // A channel step names its parent so the applier can resolve the id it created moments ago.
  const general = plan.steps.find((step) => step.name === 'general');
  assert.equal(general.parent, 'Community');
});

test('a second run against the finished server has nothing left to do', () => {
  const first = planSetup(empty, blueprint);
  const built = {
    categories: blueprint.categories.map((category) => ({ name: category.name, type: 'category' })),
    channels: blueprint.categories.flatMap((category) => category.channels.map((channel) => ({ name: channel.name, type: channel.type ?? 'text' }))),
    roles: blueprint.roles.map((role) => ({ name: role.name })),
  };
  const second = planSetup(built, blueprint);
  assert.deepEqual(second.steps, []);
  assert.match(second.summary, /Nothing to do/);
  assert.equal(confirmLine(second), 'Nothing to apply.');
});

test('existing pieces are kept, never re-created, and matching is case-insensitive', () => {
  const snapshot = {
    categories: [{ name: 'start here', type: 'category' }],
    channels: [{ name: 'WELCOME', type: 'text' }],
    roles: [{ name: 'moderator' }],
  };
  const plan = planSetup(snapshot, blueprint);
  assert.ok(!plan.steps.some((step) => step.op === 'create_category' && step.name === 'Start here'));
  assert.ok(!plan.steps.some((step) => step.op === 'create_channel' && step.name === 'welcome'));
  assert.ok(!plan.steps.some((step) => step.op === 'create_role' && step.name === 'Moderator'));
  assert.ok(plan.kept.includes('category Start here'));
  assert.ok(plan.kept.includes('channel welcome'));
});

test('a channel that exists with another type is a question, not a conversion', () => {
  const snapshot = {
    categories: [{ name: 'Community', type: 'category' }],
    channels: [{ name: 'general', type: 'voice' }],
    roles: [],
  };
  const plan = planSetup(snapshot, blueprint);
  const question = plan.questions.find((entry) => entry.includes('general'));
  assert.ok(question, 'the type clash is surfaced');
  assert.match(question, /Leave it as it is\?/);
  // And it is NOT a step: converting destroys the messages.
  assert.ok(!plan.steps.some((step) => step.op === 'create_channel' && step.name === 'general'));
});

test('the confirmation names a count, never "everything"', () => {
  const plan = planSetup(empty, blueprint);
  assert.match(confirmLine(plan), /^Apply \d+ changes\?/);
  assert.doesNotMatch(confirmLine(plan), /all|everything/i);
});

test('the plan never deletes or renames', () => {
  const plan = planSetup({ categories: [{ name: 'Mine', type: 'category' }], channels: [], roles: [] }, blueprint);
  const ops = new Set(plan.steps.map((step) => step.op));
  for (const op of ops) assert.ok(['create_role', 'create_category', 'create_channel'].includes(op), `${op} is not a create`);
  assert.ok(plan.kept.includes('category Mine') === false, 'Mine is not part of the layout');
});
