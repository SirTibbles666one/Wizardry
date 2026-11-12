import assert from 'node:assert/strict';
import test from 'node:test';
import { PRESETS, readBlueprint } from '../src/wizard/blueprint.js';

test('every preset is a blueprint the planner can read', () => {
  for (const [name, preset] of Object.entries(PRESETS)) {
    const blueprint = readBlueprint(name);
    assert.equal(blueprint.name, preset.name);
    assert.ok(blueprint.categories.length > 0, `${name} has categories`);
    assert.ok(blueprint.roles.length > 0, `${name} has roles`);
    for (const category of blueprint.categories) {
      assert.ok(category.name, `${name}: a category has no name`);
      assert.ok(category.channels.length > 0, `${name}/${category.name} has no channels`);
    }
  }
});

test('a blueprint pasted as JSON is read as JSON', () => {
  const blueprint = readBlueprint(JSON.stringify({
    name: 'one-off',
    roles: [{ name: 'Reader' }],
    categories: [{ name: 'Reading', channels: [{ name: 'shelf', type: 'text' }] }],
  }));
  assert.equal(blueprint.name, 'one-off');
  assert.equal(blueprint.categories[0].channels[0].name, 'shelf');
});

test('two channels with the same name in one category are refused', () => {
  assert.throws(() => readBlueprint({
    categories: [{ name: 'A', channels: [{ name: 'chat' }, { name: 'Chat' }] }],
  }), /twice/);
});

test('an unknown preset name that is not JSON says which presets exist', () => {
  assert.throws(() => readBlueprint('tuesday'), /Known presets: community/);
});
