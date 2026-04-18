const { SlashCommandBuilder } = require('discord.js');
const { COLORS, createBaseEmbed } = require('../utils/embedFactory');

module.exports = {
  data: new SlashCommandBuilder().setName('start').setDescription('Join voice and start streaming'),
  cooldown: 10,
  adminOnly: true,
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    await client.radioPlayer.start();

    await interaction.editReply({
      embeds: [createBaseEmbed('Radio started successfully', COLORS.success)],
    });
  },
};
