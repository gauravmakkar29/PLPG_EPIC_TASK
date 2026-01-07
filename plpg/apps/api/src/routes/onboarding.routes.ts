import { Router } from 'express';
import {
  getOnboardingState,
  saveStep,
  gotoStep,
  skipOnboarding,
  completeOnboarding,
  restartOnboarding,
} from '../controllers/onboarding.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { step1Schema, step2Schema, step3Schema, stepParamsSchema } from '@plpg/shared';

const router = Router();

// All onboarding routes require authentication
router.use(requireAuth);

// Get current onboarding state
router.get('/', getOnboardingState);

// Save step data - validation depends on step number
router.patch('/step/:step', validate({ params: stepParamsSchema }), async (req, res, next) => {
  const step = parseInt(req.params.step, 10);

  // Validate body based on step
  let bodySchema;
  switch (step) {
    case 1:
      bodySchema = step1Schema;
      break;
    case 2:
      bodySchema = step2Schema;
      break;
    case 3:
      bodySchema = step3Schema;
      break;
    default:
      return next();
  }

  try {
    req.body = await bodySchema.parseAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
}, saveStep);

// Navigate to a specific step (for edit functionality)
router.post('/goto/:step', validate({ params: stepParamsSchema }), gotoStep);

// Skip onboarding
router.post('/skip', skipOnboarding);

// Restart onboarding for edit preferences
router.post('/restart', restartOnboarding);

// Complete onboarding
router.post('/complete', completeOnboarding);

export default router;
