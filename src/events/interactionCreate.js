const { Events } = require('discord.js');
const { COLORS, createBaseEmbed } = require('../utils/embedFactory');
const { isAdmin } = require('../utils/accessControl');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      return;
    }

    if (command.adminOnly && !isAdmin(interaction)) {
      await interaction.reply({
        embeds: [createBaseEmbed('You do not have permission to use this command', COLORS.error)],
        ephemeral: true,
      });
      return;
    }

    const cooldown = command.cooldown ?? client.config.commandCooldownSeconds;
    const remainingMs = client.cooldowns.getRemainingMs(command.data.name, interaction.user.id, cooldown);

    if (remainingMs > 0) {
      const seconds = Math.ceil(remainingMs / 1000);
      await interaction.reply({
        embeds: [createBaseEmbed(`Please wait ${seconds}s before using this command again`, COLORS.error)],
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      client.logger.error('Command execution failed', {
        command: interaction.commandName,
        error: error.message,
      });

      const payload = {
        embeds: [createBaseEmbed('Command failed to execute', COLORS.error)],
        ephemeral: true,
      };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(payload).catch(() => null);
      } else {
        await interaction.reply(payload).catch(() => null);
      }
    }
  },
};
