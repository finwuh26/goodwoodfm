const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { Client, GatewayIntentBits } = require('discord.js');

const { getConfig } = require('./config');
const logger = require('./utils/logger');
const { loadCommands } = require('./utils/commandHandler');
const { registerEvents } = require('./utils/eventHandler');
const { CooldownManager } = require('./utils/cooldownManager');
const { NowPlayingService } = require('./services/nowPlayingService');
const { RadioPlayer } = require('./radio/radioPlayer');

async function main() {
  const config = getConfig();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  client.config = config;
  client.logger = logger;
  client.commands = loadCommands(path.join(__dirname, 'commands'));
  client.cooldowns = new CooldownManager(config.commandCooldownSeconds);
  client.services = {
    nowPlaying: new NowPlayingService({
      apiUrl: config.azuraCastApiUrl,
      pollIntervalMs: config.apiPollIntervalMs,
      logger,
    }),
  };
  client.radioPlayer = new RadioPlayer({
    client,
    config,
    logger,
  });

  registerEvents(client, path.join(__dirname, 'events'));

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down');
    client.services.nowPlaying.stop();
    await client.radioPlayer.stop();
    await client.destroy();
    process.exit(0);
  });

  await client.login(config.discordToken);
}

main().catch((error) => {
  logger.error('Bot failed to start', { error: error.message });
  process.exit(1);
});
