const { SlashCommandBuilder } = require('discord.js');
const { COLORS, createBaseEmbed } = require('../utils/embedFactory');

module.exports = {
  data: new SlashCommandBuilder().setName('play').setDescription('Start or restart radio playback'),
  adminOnly: true,
  cooldown: 10,
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    await client.radioPlayer.reconnect();
    await interaction.editReply({
      embeds: [createBaseEmbed('Radio playback started', COLORS.success)],
    });
  },
};
