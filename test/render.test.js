import assert from 'node:assert/strict';
import test from 'node:test';
import { readBlueprint } from '../src/wizard/blueprint.js';
import { planSetup } from '../src/wizard/plan.js';
import { renderPlan } from '../src/wizard/render.js';

const blueprint = readBlueprint('community');
const plan = planSetup({ categories: [], channels: [], roles: [] }, blueprint);

test('the message says nothing changed yet and how to go ahead', () => {
  const text = renderPlan(plan, blueprint);
  assert.match(text, /Nothing has changed yet\./);
  assert.match(text, /Reply \*\*apply\*\* to do it, or \*\*cancel\*\*\./);
  assert.match(text, /Apply \d+ changes\?/);
});

test('channels are listed under their category, with their topics', () => {
  const text = renderPlan(plan, blueprint);
  const community = text.indexOf('**Community**');
  const general = text.indexOf('**general**');
  assert.ok(community !== -1 && general > community, 'general sits under its category heading');
  assert.match(text, /anything and everything/i, 'the topic is shown');
});

test('what is already in place is named rather than silently skipped', () => {
  const partial = planSetup({
    categories: [{ name: 'Community', type: 'category' }],
    channels: [{ name: 'general', type: 'text' }],
    roles: [{ name: 'Admin' }],
  }, blueprint);
  const text = renderPlan(partial, blueprint);
  assert.match(text, /Already in place: .*category Community/);
  assert.match(text, /Already in place: .*role Admin/);
});

test('an empty plan reads as done, not as an error', () => {
  const built = {
    categories: blueprint.categories.map((category) => ({ name: category.name, type: 'category' })),
    channels: blueprint.categories.flatMap((category) => category.channels.map((channel) => ({ name: channel.name, type: channel.type ?? 'text' }))),
    roles: blueprint.roles.map((role) => ({ name: role.name })),
  };
  const text = renderPlan(planSetup(built, blueprint), blueprint);
  assert.match(text, /Nothing to do/);
  assert.match(text, /Nothing to apply\./);
});
