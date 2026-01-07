import { Router } from 'express';
import { getSession, clerkWebhook } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, getSession);
router.post('/webhook/clerk', clerkWebhook);

export default router;
