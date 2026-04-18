function parseNowPlaying(payload) {
  const source = Array.isArray(payload) ? payload[0] : payload;
  const song = source?.now_playing?.song || source?.song || {};

  const title = typeof song.title === 'string' && song.title.trim() ? song.title.trim() : 'Unknown Title';
  const artist = typeof song.artist === 'string' && song.artist.trim() ? song.artist.trim() : 'Unknown Artist';
  const album = typeof song.album === 'string' && song.album.trim() ? song.album.trim() : null;
  const artwork = typeof song.art === 'string' && song.art.trim() ? song.art.trim() : null;

  return { title, artist, album, artwork };
}

class NowPlayingService {
  constructor({ apiUrl, pollIntervalMs, logger }) {
    this.apiUrl = apiUrl;
    this.pollIntervalMs = pollIntervalMs;
    this.logger = logger;
    this.currentSong = null;
    this.interval = null;
    this.onSongChanged = null;
  }

  start(onSongChanged) {
    this.onSongChanged = onSongChanged;
    this.stop();
    this.poll().catch((error) => {
      this.logger.error('Initial now playing poll failed', { error: error.message });
    });

    this.interval = setInterval(() => {
      this.poll().catch((error) => {
        this.logger.error('Now playing poll failed', { error: error.message });
      });
    }, this.pollIntervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getCurrentSong() {
    return this.currentSong;
  }

  async poll() {
    const response = await fetch(this.apiUrl, {
      headers: {
        'User-Agent': 'goodwoodfm-bot/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Now playing API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const nextSong = parseNowPlaying(data);

    const changed =
      !this.currentSong ||
      this.currentSong.title !== nextSong.title ||
      this.currentSong.artist !== nextSong.artist ||
      this.currentSong.album !== nextSong.album;

    this.currentSong = nextSong;

    if (changed && typeof this.onSongChanged === 'function') {
      this.onSongChanged(nextSong);
    }

    return nextSong;
  }
}

module.exports = {
  NowPlayingService,
  parseNowPlaying,
};
