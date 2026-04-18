const test = require('node:test');
const assert = require('node:assert/strict');

const { parseNowPlaying } = require('../../src/services/nowPlayingService');

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
