const { ActivityType, Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(_, client) {
    client.logger.info('Discord client ready', { user: client.user.tag });

    const commandDefinitions = Array.from(client.commands.values()).map((command) => command.data.toJSON());
    await client.application.commands.set([]);
    client.logger.info('Global slash commands cleared');
    await client.application.commands.set(commandDefinitions, client.config.guildId);
    client.logger.info('Guild slash commands registered', {
      guildId: client.config.guildId,
      count: commandDefinitions.length,
    });

    client.services.nowPlaying.start((song) => {
      const activityName = `${song.artist} - ${song.title}`;
      client.user.setPresence({
        activities: [{ name: activityName, type: ActivityType.Listening }],
        status: 'online',
      });
    });

    try {
      await client.radioPlayer.start();
      client.logger.info('Radio playback started at boot');
    } catch (error) {
      client.logger.error('Failed to start radio playback at boot', { error: error.message });
      client.radioPlayer.scheduleRestart();
    }
  },
};
