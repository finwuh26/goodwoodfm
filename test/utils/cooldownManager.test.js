const test = require('node:test');
const assert = require('node:assert/strict');

const { CooldownManager } = require('../../src/utils/cooldownManager');

test('CooldownManager returns remaining time on repeated calls', () => {
  const manager = new CooldownManager(1);

  const first = manager.getRemainingMs('nowplaying', 'user1');
  const second = manager.getRemainingMs('nowplaying', 'user1');

  assert.equal(first, 0);
  assert.ok(second > 0);
});
