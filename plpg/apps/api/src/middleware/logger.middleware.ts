import pinoHttpLib from 'pino-http';
import type { Request, Response, RequestHandler } from 'express';
import { logger } from '../lib/logger.js';

// Handle ESM/CommonJS interop for pino-http
const pinoHttp = (pinoHttpLib as any).default || pinoHttpLib;
export const requestLogger: RequestHandler = (pinoHttp as typeof import('pino-http').default)({
  logger,
  autoLogging: {
    ignore: (req: Request) => req.url === '/v1/health',
  },
  customLogLevel: (_req: Request, res: Response, err: Error | undefined) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
  customSuccessMessage: (req: Request, res: Response) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req: Request, res: Response) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
});
