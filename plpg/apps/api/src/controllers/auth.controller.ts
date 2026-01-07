import type { Request, Response, NextFunction } from 'express';
import type { Session } from '@plpg/shared';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/backend';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { env } from '../lib/env.js';

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

export async function clerkWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Verify webhook signature if CLERK_WEBHOOK_SECRET is configured
    let evt: WebhookEvent;
    
    if (env.CLERK_WEBHOOK_SECRET) {
      const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;
      const wh = new Webhook(WEBHOOK_SECRET);
      
      // Get headers
      const svixId = req.headers['svix-id'] as string;
      const svixTimestamp = req.headers['svix-timestamp'] as string;
      const svixSignature = req.headers['svix-signature'] as string;

      if (!svixId || !svixTimestamp || !svixSignature) {
        logger.warn('Missing svix headers in webhook request');
        res.status(400).json({ error: 'Invalid signature' });
        return;
      }

      const headers = {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      };

      // Verify signature
      try {
        // svix expects the raw body as a string
        const payload = JSON.stringify(req.body);
        evt = wh.verify(payload, headers) as WebhookEvent;
      } catch (err) {
        logger.warn({ error: err }, 'Invalid webhook signature');
        res.status(400).json({ error: 'Invalid signature' });
        return;
      }
    } else {
      // In development, allow webhooks without signature verification
      // but log a warning
      logger.warn('CLERK_WEBHOOK_SECRET not configured, skipping signature verification');
      evt = req.body as WebhookEvent;
    }

    logger.info({ type: evt.type }, 'Received Clerk webhook');

    switch (evt.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses[0]?.email_address;

        if (email) {
          await prisma.user.create({
            data: {
              clerkId: id,
              email,
              name: [first_name, last_name].filter(Boolean).join(' ') || null,
              avatarUrl: image_url || null,
              trialStartDate: new Date(),
              trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            },
          });

          logger.info({ clerkId: id, email }, 'Created new user from Clerk webhook');
          
          // Track signup_completed analytics event
          // Note: Full analytics integration will be added in Epic 9
          logger.info(
            { 
              event: 'signup_completed',
              clerkId: id,
              email,
              timestamp: new Date().toISOString()
            },
            'Analytics: signup_completed'
          );
        }
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses[0]?.email_address;

        await prisma.user.update({
          where: { clerkId: id },
          data: {
            email,
            name: [first_name, last_name].filter(Boolean).join(' ') || null,
            avatarUrl: image_url || null,
          },
        });

        logger.info({ clerkId: id }, 'Updated user from Clerk webhook');
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;

        await prisma.user.delete({
          where: { clerkId: id },
        });

        logger.info({ clerkId: id }, 'Deleted user from Clerk webhook');
        break;
      }

      default:
        logger.debug({ type: evt.type }, 'Unhandled webhook event type');
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error({ error }, 'Error processing Clerk webhook');
    next(error);
  }
}
