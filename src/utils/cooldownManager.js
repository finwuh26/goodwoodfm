class CooldownManager {
  constructor(defaultCooldownSeconds = 5) {
    this.defaultCooldownSeconds = defaultCooldownSeconds;
    this.cooldowns = new Map();
  }

  getRemainingMs(commandName, userId, cooldownSeconds = this.defaultCooldownSeconds) {
    const key = `${commandName}:${userId}`;
    const now = Date.now();
    const expiresAt = this.cooldowns.get(key);

    if (expiresAt && expiresAt > now) {
      return expiresAt - now;
    }

    this.cooldowns.set(key, now + cooldownSeconds * 1000);
    return 0;
  }
}

module.exports = {
  CooldownManager,
};
