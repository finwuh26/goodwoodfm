const { EmbedBuilder } = require('discord.js');

const COLORS = {
  info: 0x2f3136,
  success: 0x57f287,
  error: 0xed4245,
};

function createBaseEmbed(title, color = COLORS.info) {
  return new EmbedBuilder().setTitle(title).setColor(color);
}

function buildNowPlayingEmbed(song) {
  const embed = createBaseEmbed('Now Playing');
  embed.addFields(
    { name: 'Title', value: song?.title || 'Unknown Title', inline: true },
    { name: 'Artist', value: song?.artist || 'Unknown Artist', inline: true },
  );

  if (song?.album) {
    embed.addFields({ name: 'Album', value: song.album, inline: true });
  }

  return embed;
}

module.exports = {
  COLORS,
  createBaseEmbed,
  buildNowPlayingEmbed,
};
