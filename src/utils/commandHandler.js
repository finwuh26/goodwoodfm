const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');

function loadCommands(commandsPath) {
  const commands = new Collection();
  const files = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const command = require(path.join(commandsPath, file));
    if (!command?.data?.name || typeof command.execute !== 'function') {
      continue;
    }
    commands.set(command.data.name, command);
  }

  return commands;
}

module.exports = {
  loadCommands,
};
