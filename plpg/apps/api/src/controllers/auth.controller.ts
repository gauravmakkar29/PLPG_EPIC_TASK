import type { Request, Response, NextFunction } from 'express';
import type { Session } from '@plpg/shared';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

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
      name: null, // Will be populated from database
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt?.toISOString() ?? null,
    };

    // Get full user details from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    });

    if (dbUser) {
      session.name = dbUser.name;
    }

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
}

export async function clerkWebhook(
  req: Request,
  res: Response<{ received: boolean }>,
  next: NextFunction
): Promise<void> {
  try {
    const event = req.body;

    logger.info({ type: event.type }, 'Received Clerk webhook');

    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
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
        }
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = event.data;
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
        const { id } = event.data;

        await prisma.user.delete({
          where: { clerkId: id },
        });

        logger.info({ clerkId: id }, 'Deleted user from Clerk webhook');
        break;
      }

      default:
        logger.debug({ type: event.type }, 'Unhandled webhook event type');
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}
