import { Router } from 'express';
import {
  getGapAnalysis,
  getSequencedSkills,
  generateRoadmapEndpoint,
  getRoadmapEndpoint,
  getRoadmapById,
} from '../controllers/roadmap.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Specific routes must come before parameterized routes
router.get('/gap-analysis', requireAuth, getGapAnalysis);
router.get('/sequence-skills', requireAuth, getSequencedSkills);
router.post('/generate', requireAuth, generateRoadmapEndpoint);

// Parameterized routes come last
router.get('/:id', requireAuth, getRoadmapById);
router.get('/', requireAuth, getRoadmapEndpoint);

export default router;

