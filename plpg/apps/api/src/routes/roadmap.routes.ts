import { Router } from 'express';
import { getGapAnalysis, getSequencedSkills, generateRoadmapEndpoint } from '../controllers/roadmap.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/gap-analysis', requireAuth, getGapAnalysis);
router.get('/sequence-skills', requireAuth, getSequencedSkills);
router.post('/generate', requireAuth, generateRoadmapEndpoint);

export default router;

