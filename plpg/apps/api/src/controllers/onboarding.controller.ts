import type { Request, Response, NextFunction } from 'express';
import type { OnboardingStateResponse, Step1Data, Step2Data, Step3Data } from '@plpg/shared';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { BadRequestError } from '@plpg/shared';

const TOTAL_STEPS = 3;

/**
 * Get current onboarding state for the authenticated user
 */
export async function getOnboardingState(
  req: Request,
  res: Response<{ success: true; data: OnboardingStateResponse }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    let onboardingState = await prisma.onboardingState.findUnique({
      where: { userId },
    });

    // Create initial state if it doesn't exist
    if (!onboardingState) {
      onboardingState = await prisma.onboardingState.create({
        data: {
          userId,
          currentStep: 1,
        },
      });
      logger.info({ userId }, 'Created new onboarding state');
    }

    const response: OnboardingStateResponse = {
      currentStep: onboardingState.currentStep,
      totalSteps: TOTAL_STEPS,
      isComplete: onboardingState.isComplete,
      isSkipped: onboardingState.isSkipped,
      data: {
        currentRole: onboardingState.currentRole,
        targetRole: onboardingState.targetRole,
        weeklyHours: onboardingState.weeklyHours,
      },
    };

    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
}

/**
 * Save data for a specific onboarding step
 */
export async function saveStep(
  req: Request,
  res: Response<{ success: true; data: OnboardingStateResponse }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const step = parseInt(req.params.step, 10);

    // Ensure onboarding state exists
    let onboardingState = await prisma.onboardingState.findUnique({
      where: { userId },
    });

    if (!onboardingState) {
      onboardingState = await prisma.onboardingState.create({
        data: {
          userId,
          currentStep: 1,
        },
      });
    }

    // Prepare update data based on step
    const updateData: {
      currentRole?: string;
      targetRole?: string;
      weeklyHours?: number;
      currentStep?: number;
    } = {};

    switch (step) {
      case 1: {
        const data = req.body as Step1Data;
        updateData.currentRole = data.currentRole;
        updateData.currentStep = Math.max(onboardingState.currentStep, 2);
        break;
      }
      case 2: {
        const data = req.body as Step2Data;
        updateData.targetRole = data.targetRole;
        updateData.currentStep = Math.max(onboardingState.currentStep, 3);
        break;
      }
      case 3: {
        const data = req.body as Step3Data;
        updateData.weeklyHours = data.weeklyHours;
        break;
      }
      default:
        throw new BadRequestError('Invalid step number');
    }

    const updatedState = await prisma.onboardingState.update({
      where: { userId },
      data: updateData,
    });

    logger.info({ userId, step }, 'Saved onboarding step');

    const response: OnboardingStateResponse = {
      currentStep: updatedState.currentStep,
      totalSteps: TOTAL_STEPS,
      isComplete: updatedState.isComplete,
      isSkipped: updatedState.isSkipped,
      data: {
        currentRole: updatedState.currentRole,
        targetRole: updatedState.targetRole,
        weeklyHours: updatedState.weeklyHours,
      },
    };

    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
}

/**
 * Skip onboarding and use generic path
 */
export async function skipOnboarding(
  req: Request,
  res: Response<{ success: true; data: OnboardingStateResponse }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const updatedState = await prisma.onboardingState.upsert({
      where: { userId },
      create: {
        userId,
        isSkipped: true,
        isComplete: true,
        completedAt: new Date(),
      },
      update: {
        isSkipped: true,
        isComplete: true,
        completedAt: new Date(),
      },
    });

    logger.info({ userId }, 'User skipped onboarding');

    const response: OnboardingStateResponse = {
      currentStep: updatedState.currentStep,
      totalSteps: TOTAL_STEPS,
      isComplete: updatedState.isComplete,
      isSkipped: updatedState.isSkipped,
      data: {
        currentRole: updatedState.currentRole,
        targetRole: updatedState.targetRole,
        weeklyHours: updatedState.weeklyHours,
      },
    };

    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
}

/**
 * Complete onboarding and trigger roadmap generation
 */
export async function completeOnboarding(
  req: Request,
  res: Response<{ success: true; data: OnboardingStateResponse }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const onboardingState = await prisma.onboardingState.findUnique({
      where: { userId },
    });

    if (!onboardingState) {
      throw new BadRequestError('Onboarding not started');
    }

    // Validate all required fields are filled
    if (!onboardingState.currentRole || !onboardingState.targetRole || !onboardingState.weeklyHours) {
      throw new BadRequestError('Please complete all onboarding steps before finishing');
    }

    const updatedState = await prisma.onboardingState.update({
      where: { userId },
      data: {
        isComplete: true,
        completedAt: new Date(),
      },
    });

    logger.info(
      {
        userId,
        currentRole: updatedState.currentRole,
        targetRole: updatedState.targetRole,
        weeklyHours: updatedState.weeklyHours,
      },
      'User completed onboarding'
    );

    // TODO: Trigger roadmap generation in Epic 3

    const response: OnboardingStateResponse = {
      currentStep: updatedState.currentStep,
      totalSteps: TOTAL_STEPS,
      isComplete: updatedState.isComplete,
      isSkipped: updatedState.isSkipped,
      data: {
        currentRole: updatedState.currentRole,
        targetRole: updatedState.targetRole,
        weeklyHours: updatedState.weeklyHours,
      },
    };

    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
}
