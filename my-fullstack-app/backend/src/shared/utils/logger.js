/**
 * Professional logger utility for the backend.
 * Provides consistent formatting and levels without external dependencies.
 */

const levels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = process.env.NODE_ENV === 'production' ? levels.INFO : levels.DEBUG;

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` | meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaString}`;
};

const logger = {
  error: (message, meta) => {
    if (currentLevel >= levels.ERROR) {
      console.error(formatMessage('ERROR', message, meta));
    }
  },
  warn: (message, meta) => {
    if (currentLevel >= levels.WARN) {
      console.warn(formatMessage('WARN', message, meta));
    }
  },
  info: (message, meta) => {
    if (currentLevel >= levels.INFO) {
      console.info(formatMessage('INFO', message, meta));
    }
  },
  debug: (message, meta) => {
    if (currentLevel >= levels.DEBUG) {
      console.debug(formatMessage('DEBUG', message, meta));
    }
  },
};

module.exports = logger;
