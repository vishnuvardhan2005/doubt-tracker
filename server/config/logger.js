/*
 * Minimal logger wrapper. This is the single module permitted to touch the
 * console, so application code never calls console.log directly (see CLAUDE.md).
 * Swap the internals for pino/winston later without changing any call sites.
 */
/* eslint-disable no-console */
const write = (level, args) => {
  const timestamp = new Date().toISOString();
  console[level === 'debug' ? 'log' : level](
    `[${timestamp}] [${level.toUpperCase()}]`,
    ...args
  );
};

module.exports = {
  info: (...args) => write('info', args),
  warn: (...args) => write('warn', args),
  error: (...args) => write('error', args),
  debug: (...args) => write('debug', args),
};
