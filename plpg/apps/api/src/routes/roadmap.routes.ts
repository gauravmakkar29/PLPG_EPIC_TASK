import { Router } from 'express';
import { getGapAnalysis } from '../controllers/roadmap.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/gap-analysis', requireAuth, getGapAnalysis);

export default router;

