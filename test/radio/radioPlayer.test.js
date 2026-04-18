const test = require('node:test');
const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');

const { RadioPlayer } = require('../../src/radio/radioPlayer');

function createPlayer(overrides = {}) {
  return new RadioPlayer({
    client: {},
    config: {
      guildId: 'guild',
      voiceChannelId: 'voice',
      radioStreamUrl: 'https://example.com/stream',
      streamReconnectDelayMs: 50,
      streamVolume: 0.5,
      ...overrides,
    },
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

test('start deduplicates concurrent startup attempts', async () => {
  const player = createPlayer();
  let connectCalls = 0;
  let playbackCalls = 0;

  player.connect = async () => {
    connectCalls += 1;
    await delay(10);
  };

  player.startPlayback = async () => {
    playbackCalls += 1;
    await delay(10);
  };

  await Promise.all([player.start(), player.start()]);

  assert.equal(connectCalls, 1);
  assert.equal(playbackCalls, 1);
});

test('scheduled restart does not trigger a second startup while start is in-flight', async () => {
  const player = createPlayer({ streamReconnectDelayMs: 1 });
  let connectCalls = 0;
  let playbackCalls = 0;

  player.connect = async () => {
    connectCalls += 1;
    await delay(30);
  };

  player.startPlayback = async () => {
    playbackCalls += 1;
    await delay(10);
  };

  const initialStart = player.start();
  player.scheduleRestart();

  await initialStart;
  await delay(20);

  assert.equal(connectCalls, 1);
  assert.equal(playbackCalls, 1);
});
