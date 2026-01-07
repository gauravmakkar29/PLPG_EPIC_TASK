<<<<<<< HEAD
import { Router, type IRouter } from 'express';
import { getSession, clerkWebhook } from '../controllers/auth.controller.js';
=======
import { Router } from 'express';
import { getMe, getSession, clerkWebhook } from '../controllers/auth.controller.js';
>>>>>>> 4384108764234eb13ab9409d73f280f084551795
import { requireAuth } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// GET /v1/auth/me - Get current session (per user story AIRE-156)
router.get('/me', requireAuth, getMe);
router.post('/webhook/clerk', clerkWebhook);

export default router;
