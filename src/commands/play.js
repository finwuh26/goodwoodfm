const { SlashCommandBuilder } = require('discord.js');
const { COLORS, createBaseEmbed } = require('../utils/embedFactory');

module.exports = {
  data: new SlashCommandBuilder().setName('play').setDescription('Start or restart radio playback'),
  adminOnly: true,
  cooldown: 10,
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
      await client.radioPlayer.reconnect();
      await interaction.editReply({
        embeds: [createBaseEmbed('Radio playback started', COLORS.success)],
      });
    } catch (error) {
      client.logger.error('Play command failed to reconnect', { error: error.message });
      await interaction.editReply({
        embeds: [createBaseEmbed('Failed to start radio playback', COLORS.error)],
      });
    }
  },
};
