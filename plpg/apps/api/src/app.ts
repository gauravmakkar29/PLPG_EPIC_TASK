import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { clerkMiddleware } from '@clerk/express';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { rateLimiter } from './middleware/rateLimiter.middleware.js';
import routes from './routes/index.js';
import healthRoutes from './routes/health.routes.js';
import { env } from './lib/env.js';

const app: Express = express();

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

// Health check (before auth - public endpoint)
app.use('/v1/health', healthRoutes);

// Auth (Clerk) - only if keys are configured
if (env.CLERK_SECRET_KEY && env.CLERK_SECRET_KEY !== 'sk_test_...') {
  app.use(clerkMiddleware());
}

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/v1', routes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
