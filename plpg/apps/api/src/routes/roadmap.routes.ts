import { Router } from 'express';
import { getGapAnalysis, getSequencedSkills } from '../controllers/roadmap.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/gap-analysis', requireAuth, getGapAnalysis);
router.get('/sequence-skills', requireAuth, getSequencedSkills);

export default router;

