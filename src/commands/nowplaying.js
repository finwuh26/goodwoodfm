const { SlashCommandBuilder } = require('discord.js');
const { buildNowPlayingEmbed } = require('../utils/embedFactory');

module.exports = {
  data: new SlashCommandBuilder().setName('nowplaying').setDescription('Show the currently playing track'),
  cooldown: 5,
  async execute(interaction, client) {
    const song = client.services.nowPlaying.getCurrentSong();

    await interaction.reply({
      embeds: [buildNowPlayingEmbed(song)],
      ephemeral: false,
    });
  },
};
