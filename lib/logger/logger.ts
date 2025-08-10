import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = pino({
  // Only enable logs in development; silence in production and other envs
  enabled: isDevelopment,
  level: isDevelopment ? 'debug' : 'silent',
});

export default logger;