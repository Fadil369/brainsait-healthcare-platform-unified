type Level = 'info' | 'error' | 'warn' | 'debug';

function log(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
  };
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
};

