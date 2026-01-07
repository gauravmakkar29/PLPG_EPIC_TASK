import { Router, type IRouter } from 'express';
import { getMe, clerkWebhook } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// GET /v1/auth/me - Get current session (per user story AIRE-156)
router.get('/me', requireAuth, getMe);
router.post('/webhook/clerk', clerkWebhook);

export default router;
