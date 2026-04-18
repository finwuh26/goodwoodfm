function write(level, message, meta = {}) {
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
  };

  if (level === 'error') {
    console.error(JSON.stringify(payload));
    return;
  }

  console.log(JSON.stringify(payload));
}

module.exports = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
};
