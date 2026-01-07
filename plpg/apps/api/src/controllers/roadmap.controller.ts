import type { Request, Response, NextFunction } from 'express';
import { analyzeGap, type GapAnalysisResult } from '../services/gapAnalysis.service.js';
import { logger } from '../lib/logger.js';
import { BadRequestError } from '@plpg/shared';

/**
 * Analyze the gap between user's current skills and target role requirements
 * GET /v1/roadmap/gap-analysis
 */
export async function getGapAnalysis(
  req: Request,
  res: Response<{ success: true; data: GapAnalysisResult }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const targetRole = req.query.targetRole as string | undefined;

    if (!targetRole) {
      throw new BadRequestError('targetRole query parameter is required');
    }

    const result = await analyzeGap(userId, targetRole);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Error in gap analysis');
    next(error);
  }
}

