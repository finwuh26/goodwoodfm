const test = require('node:test');
const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');

const { isAdmin } = require('../../src/utils/accessControl');

test('isAdmin returns true for administrator permission', () => {
  const interaction = {
    inGuild: () => true,
    memberPermissions: {
      has: (permission) => permission === PermissionFlagsBits.Administrator,
    },
  };

  assert.equal(isAdmin(interaction), true);
});

test('isAdmin returns false outside guild context', () => {
  const interaction = {
    inGuild: () => false,
  };

  assert.equal(isAdmin(interaction), false);
});
