const fs = require('node:fs');
const path = require('node:path');

let commandFiles;
try {
  commandFiles = fs
    .readdirSync(__dirname)
    .filter((file) => file.endsWith('.js') && file !== 'index.js');
} catch (error) {
  error.message = `Failed to read command directory '${__dirname}': ${error.message}`;
  throw error;
}

const commands = [];
for (const file of commandFiles) {
  let command;
  try {
    command = require(path.join(__dirname, file));
  } catch (error) {
    error.message = `Failed to load command module '${file}': ${error.message}`;
    throw error;
  }

  if (!command?.data?.name || typeof command.execute !== 'function') {
    throw new Error(`Invalid command module '${file}': expected data.name and execute()`);
  }

  commands.push(command);
}

module.exports = commands;
