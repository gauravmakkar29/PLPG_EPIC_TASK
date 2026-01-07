import type { Request, Response, NextFunction } from 'express';
import type { Session } from '@plpg/shared';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { generateToken } from '../lib/jwt.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';

/**
 * Get current user session
 * GET /v1/auth/me
 * Requires authentication via requireAuth middleware
 */
export async function getMe(req: Request, res: Response<Session>): Promise<void> {
  // req.user populated by requireAuth middleware
  const { id, email, name, subscriptionStatus, trialEndsAt } = req.user!;

  const session: Session = {
    userId: id,
    email,
    name,
    subscriptionStatus,
    trialEndsAt: trialEndsAt?.toISOString() ?? null,
  };

  res.json(session);
}

export async function getSession(
  req: Request,
  res: Response<{ success: true; data: Session }>,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;

    const session: Session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt?.toISOString() ?? null,
    };

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
}

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * User signup
 * POST /v1/auth/signup
 */
export async function signup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = signupSchema.parse(req.body);
    const { email, password, name } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info({ userId: user.id, email }, 'User signed up');

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    next(error);
  }
}

/**
 * User login
 * POST /v1/auth/login
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const { email, password } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info({ userId: user.id, email }, 'User logged in');

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    next(error);
  }
}
