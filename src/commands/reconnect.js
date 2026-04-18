const { SlashCommandBuilder } = require('discord.js');
const { COLORS, createBaseEmbed } = require('../utils/embedFactory');

module.exports = {
  data: new SlashCommandBuilder().setName('reconnect').setDescription('Reconnect voice and restart stream'),
  cooldown: 10,
  adminOnly: true,
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    await client.radioPlayer.reconnect();

    await interaction.editReply({
      embeds: [createBaseEmbed('Radio reconnected successfully', COLORS.success)],
    });
  },
};
