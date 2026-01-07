import { Router, type IRouter } from 'express';
import { getMe, signup, login } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

// POST /v1/auth/signup - User registration
router.post('/signup', signup);

// POST /v1/auth/login - User login
router.post('/login', login);

// GET /v1/auth/me - Get current session (per user story AIRE-156)
router.get('/me', requireAuth, getMe);

export default router;
