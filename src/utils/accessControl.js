const { PermissionFlagsBits } = require('discord.js');

function isAdmin(interaction) {
  if (!interaction.inGuild()) {
    return false;
  }

  return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ?? false;
}

module.exports = {
  isAdmin,
};
