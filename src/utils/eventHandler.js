const fs = require('node:fs');
const path = require('node:path');

function registerEvents(client, eventsPath) {
  const files = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const event = require(path.join(eventsPath, file));
    if (!event?.name || typeof event.execute !== 'function') {
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

module.exports = {
  registerEvents,
};
