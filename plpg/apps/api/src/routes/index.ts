import { Router, type IRouter } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import onboardingRoutes from './onboarding.routes.js';
import roadmapRoutes from './roadmap.routes.js';

const router: IRouter = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/roadmap', roadmapRoutes);

export default router;
