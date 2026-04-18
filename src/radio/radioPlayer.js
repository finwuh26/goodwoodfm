const { Readable } = require('node:stream');
const {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  StreamType,
} = require('@discordjs/voice');

class RadioPlayer {
  constructor({ client, config, logger }) {
    this.client = client;
    this.config = config;
    this.logger = logger;

    this.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });

    this.connection = null;
    this.restartTimer = null;
    this.streamAbortController = null;
    this.isStopped = true;

    this.bindPlayerEvents();
  }

  bindPlayerEvents() {
    // Idle/error events are treated as stream-health signals and trigger controlled restarts.
    this.player.on(AudioPlayerStatus.Idle, () => {
      if (this.isStopped) {
        return;
      }

      this.logger.warn('Audio player became idle, scheduling restart');
      this.scheduleRestart();
    });

    this.player.on('error', (error) => {
      this.logger.error('Audio player error', { error: error.message });
      this.scheduleRestart();
    });
  }

  async start() {
    this.isStopped = false;
    await this.connect();
    await this.startPlayback();
  }

  async stop() {
    this.isStopped = true;
    this.clearRestart();
    this.abortStream();
    this.player.stop(true);

    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    }
  }

  async reconnect() {
    this.logger.info('Manual reconnect requested');
    await this.stop();
    await this.start();
  }

  async connect() {
    const channel = await this.client.channels.fetch(this.config.voiceChannelId);

    if (!channel?.isVoiceBased()) {
      throw new Error('Configured voice channel is invalid or not voice-based');
    }

    if (channel.guild.id !== this.config.guildId) {
      throw new Error('Configured voice channel does not belong to configured guild');
    }

    if (this.connection) {
      this.connection.destroy();
      this.connection = null;
    }

    // Keep one authoritative voice connection instance and always subscribe the persistent player.
    this.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });

    this.bindConnectionEvents();

    await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);
    this.connection.subscribe(this.player);

    this.logger.info('Voice connection ready');
  }

  bindConnectionEvents() {
    if (!this.connection) {
      return;
    }

    this.connection.on('error', (error) => {
      this.logger.error('Voice connection error', { error: error.message });
      this.scheduleRestart();
    });

    this.connection.on('stateChange', async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        if (this.isStopped) {
          return;
        }

        this.logger.warn('Voice disconnected, attempting recovery');

        try {
          await Promise.race([
            entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch {
          this.scheduleRestart();
        }
      }
    });
  }

  async startPlayback() {
    if (this.isStopped) {
      return;
    }

    this.abortStream();

    const response = await this.fetchStream();
    if (!response.body) {
      throw new Error('Radio stream response has no body');
    }

    const stream = Readable.fromWeb(response.body);
    stream.on('error', (error) => {
      this.logger.error('Radio stream error', { error: error.message });
      this.scheduleRestart();
    });

    // Resource options keep decoding controlled and allow runtime gain adjustments.
    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
      inlineVolume: true,
      silencePaddingFrames: 5,
    });

    if (resource.volume) {
      resource.volume.setVolume(this.config.streamVolume);
    }

    this.player.play(resource);
    this.logger.info('Radio stream playback started');
  }

  async fetchStream() {
    this.streamAbortController = new AbortController();

    const response = await fetch(this.config.radioStreamUrl, {
      signal: this.streamAbortController.signal,
      headers: {
        'User-Agent': 'goodwoodfm-bot/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Radio stream request failed with status ${response.status}`);
    }

    return response;
  }

  scheduleRestart() {
    if (this.isStopped || this.restartTimer) {
      return;
    }

    this.restartTimer = setTimeout(async () => {
      this.restartTimer = null;
      if (this.isStopped) {
        return;
      }

      try {
        await this.connect();
        await this.startPlayback();
      } catch (error) {
        this.logger.error('Radio restart failed', { error: error.message });
        this.scheduleRestart();
      }
    }, this.config.streamReconnectDelayMs);
  }

  clearRestart() {
    if (!this.restartTimer) {
      return;
    }

    clearTimeout(this.restartTimer);
    this.restartTimer = null;
  }

  abortStream() {
    if (this.streamAbortController) {
      this.streamAbortController.abort();
      this.streamAbortController = null;
    }
  }
}

module.exports = {
  RadioPlayer,
};
