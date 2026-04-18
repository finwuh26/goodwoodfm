const { SlashCommandBuilder } = require('discord.js');
const { COLORS, createBaseEmbed } = require('../utils/embedFactory');

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Stop stream and disconnect bot'),
  cooldown: 10,
  adminOnly: true,
  async execute(interaction, client) {
    await client.radioPlayer.stop();

    await interaction.reply({
      embeds: [createBaseEmbed('Radio stopped and disconnected', COLORS.success)],
      ephemeral: true,
    });
  },
};
