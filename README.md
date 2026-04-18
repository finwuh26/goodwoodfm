# goodwoodfm

Production-ready Discord radio bot for continuous AzuraCast MP3 streaming.

Playback autostarts when the bot comes online. Manual start/stop/reconnect slash commands are intentionally removed.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start the bot:
   ```bash
   npm start
   ```

## Slash commands

- `/nowplaying` — show the currently playing track

## Web player

- Open `player.html?stream=<YOUR_MP3_STREAM_URL>` to load a minimal autoplay MP3 player page (the `stream` parameter is required).

## Environment variables

- `DISCORD_TOKEN`
- `GUILD_ID`
- `VOICE_CHANNEL_ID`
- `RADIO_STREAM_URL`
- `AZURACAST_API_URL`
- `COMMAND_COOLDOWN_SECONDS` (optional, default `5`)
- `STREAM_RECONNECT_DELAY_MS` (optional, default `5000`)
- `API_POLL_INTERVAL_MS` (optional, default `15000`)
- `STREAM_VOLUME` (optional, default `0.5`)
- `FFMPEG_PATH` (optional, overrides bundled ffmpeg binary path)
