import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { clerkMiddleware } from '@clerk/express';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { rateLimiter } from './middleware/rateLimiter.middleware.js';
import routes from './routes/index.js';
import { env } from './lib/env.js';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Parsing
app.use(express.json({ limit: '10kb' }));

// Logging
app.use(requestLogger);

// Auth (Clerk)
app.use(clerkMiddleware());

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/v1', routes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
