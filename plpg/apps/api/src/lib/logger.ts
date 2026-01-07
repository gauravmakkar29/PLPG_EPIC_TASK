<<<<<<< HEAD
import pinoModule from 'pino';
import { env } from './env.js';

const pino = pinoModule.default || pinoModule;

export const logger = pino({
=======
import pinoLib from 'pino';
import { env } from './env.js';

// Handle ESM/CommonJS interop for pino
const pino = (pinoLib as any).default || pinoLib;
export const logger = (pino as typeof import('pino').default)({
>>>>>>> 06ef476c0a79162633c7b8017b3cb9ff185d9f69
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
