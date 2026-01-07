import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@plpg/shared';
import { prisma } from '../lib/prisma.js';
import { verifyToken, extractTokenFromHeader } from '../lib/jwt.js';

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
        subscriptionStatus: 'free' | 'trial' | 'pro';
        trialEndsAt: Date | null;
      };
    }
  }
}

/**
 * Validates JWT token from Authorization header and attaches user to request
 * Usage: router.get('/protected', requireAuth, handler)
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    // Verify JWT token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify email matches (extra security check)
    if (user.email !== decoded.email) {
      throw new UnauthorizedError('Invalid token');
    }

    // Determine subscription status
    let subscriptionStatus: 'free' | 'trial' | 'pro' = 'free';
    const now = new Date();

    if (user.subscription?.status === 'active') {
      subscriptionStatus = 'pro';
    } else if (user.trialEndDate && user.trialEndDate > now) {
      subscriptionStatus = 'trial';
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      subscriptionStatus,
      trialEndsAt: user.trialEndDate,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Requires Pro subscription or active trial
 * Must be used AFTER requireAuth
 * Usage: router.get('/pro-feature', requireAuth, requirePro, handler)
 */
export async function requirePro(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  const { subscriptionStatus } = req.user;

  if (subscriptionStatus === 'free') {
    return next(new ForbiddenError('Pro subscription required'));
  }

  next();
}

/**
 * Requires specific phase access based on subscription
 * Phase 1 (foundation) = Free (during trial)
 * Phase 2-3 (intermediate, advanced) = Pro only
 */
export function requirePhaseAccess(phase: 'foundation' | 'intermediate' | 'advanced') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const { subscriptionStatus } = req.user;

    // Foundation phase accessible to trial users
    if (phase === 'foundation' && subscriptionStatus !== 'free') {
      return next();
    }

    // Intermediate and advanced require Pro
    if ((phase === 'intermediate' || phase === 'advanced') && subscriptionStatus !== 'pro') {
      return next(
        new ForbiddenError(`${phase.charAt(0).toUpperCase() + phase.slice(1)} phase requires Pro subscription`)
      );
    }

    // Pro users can access everything
    if (subscriptionStatus === 'pro') {
      return next();
    }

    // Trial users can only access foundation
    if (subscriptionStatus === 'trial' && phase === 'foundation') {
      return next();
    }

    return next(new ForbiddenError('Subscription required for this content'));
  };
}

/**
 * Optional auth - attaches user if authenticated, but doesn't require it
 * Usage: router.get('/public-with-user', optionalAuth, handler)
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return next();
    }

    // Verify JWT token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { subscription: true },
    });

    if (user && user.email === decoded.email) {
      let subscriptionStatus: 'free' | 'trial' | 'pro' = 'free';
      const now = new Date();

      if (user.subscription?.status === 'active') {
        subscriptionStatus = 'pro';
      } else if (user.trialEndDate && user.trialEndDate > now) {
        subscriptionStatus = 'trial';
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus,
        trialEndsAt: user.trialEndDate,
      };
    }

    next();
  } catch {
    // Silently continue without user
    next();
  }
}
