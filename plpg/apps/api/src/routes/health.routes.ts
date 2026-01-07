import { Router, type IRouter } from 'express';
import { healthCheck } from '../controllers/health.controller.js';

const router: IRouter = Router();

router.get('/', healthCheck);

export default router;
