const test = require('node:test');
const assert = require('node:assert/strict');
const userAgent = require('../../src/utils/userAgent');

const { parseNowPlaying, NowPlayingService } = require('../../src/services/nowPlayingService');

test('parseNowPlaying extracts song details from object payload', () => {
  const result = parseNowPlaying({
    now_playing: {
      song: {
        title: 'Song',
        artist: 'Artist',
        album: 'Album',
        art: 'hidden',
      },
    },
  });

  assert.equal(result.title, 'Song');
  assert.equal(result.artist, 'Artist');
  assert.equal(result.album, 'Album');
  assert.equal(result.artwork, 'hidden');
});

test('parseNowPlaying supports array payload shape', () => {
  const result = parseNowPlaying([
    {
      now_playing: {
        song: {
          title: 'Array Song',
          artist: 'Array Artist',
        },
      },
    },
  ]);

  assert.equal(result.title, 'Array Song');
  assert.equal(result.artist, 'Array Artist');
  assert.equal(result.album, null);
});

test('parseNowPlaying falls back to unknown values when song is missing', () => {
  const result = parseNowPlaying({});

  assert.equal(result.title, 'Unknown Title');
  assert.equal(result.artist, 'Unknown Artist');
  assert.equal(result.album, null);
});

test('NowPlayingService.fetchNowPlaying requests API payload with user-agent', async () => {
  const originalFetch = global.fetch;
  const payload = {
    now_playing: {
      song: {
        title: 'Song',
        artist: 'Artist',
      },
    },
  };
  let request;

  global.fetch = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      json: async () => payload,
    };
  };

  try {
    const service = new NowPlayingService({
      apiUrl: 'https://example.com/now-playing',
      pollIntervalMs: 1_000,
      logger: { error: () => {} },
    });

    const data = await service.fetchNowPlaying();

    assert.deepEqual(data, payload);
    assert.equal(request.url, 'https://example.com/now-playing');
    assert.equal(request.options.headers['User-Agent'], userAgent);
  } finally {
    global.fetch = originalFetch;
  }
});
