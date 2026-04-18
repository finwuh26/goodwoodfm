const requiredEnv = [
  'DISCORD_TOKEN',
  'GUILD_ID',
  'VOICE_CHANNEL_ID',
  'RADIO_STREAM_URL',
  'AZURACAST_API_URL',
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getConfig() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    discordToken: requireEnv('DISCORD_TOKEN'),
    guildId: requireEnv('GUILD_ID'),
    voiceChannelId: requireEnv('VOICE_CHANNEL_ID'),
    radioStreamUrl: requireEnv('RADIO_STREAM_URL'),
    azuraCastApiUrl: requireEnv('AZURACAST_API_URL'),
    commandCooldownSeconds: Number(process.env.COMMAND_COOLDOWN_SECONDS || 5),
    streamReconnectDelayMs: Number(process.env.STREAM_RECONNECT_DELAY_MS || 5000),
    apiPollIntervalMs: Number(process.env.API_POLL_INTERVAL_MS || 15000),
    streamVolume: Number(process.env.STREAM_VOLUME || 0.5),
  };
}

module.exports = {
  getConfig,
};
