import type { Request, Response, NextFunction } from 'express';
import { analyzeGap, type GapAnalysisResult } from '../services/gapAnalysis.service.js';
import { sequenceSkills, type SequencingResult } from '../services/sequencing.service.js';
import { generateRoadmap, type RoadmapGenerationResult } from '../services/roadmapGeneration.service.js';
import { prisma } from '../lib/prisma.js';
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

/**
 * Sequence skills respecting prerequisites and phase boundaries
 * GET /v1/roadmap/sequence-skills
 * Optional query params: skillIds (comma-separated) to sequence specific skills
 */
export async function getSequencedSkills(
  req: Request,
  res: Response<{ success: true; data: SequencingResult }>,
  next: NextFunction
): Promise<void> {
  try {
    const skillIdsParam = req.query.skillIds as string | undefined;

    let skills;
    if (skillIdsParam) {
      // Sequence specific skills
      const skillIds = skillIdsParam.split(',').map((id) => id.trim());
      skills = await prisma.skill.findMany({
        where: {
          id: { in: skillIds },
        },
      });
    } else {
      // Sequence all non-optional skills
      skills = await prisma.skill.findMany({
        where: {
          isOptional: false,
        },
      });
    }

    // Load all dependencies for these skills
    const skillIds = skills.map((s) => s.id);
    const dependencies = await prisma.skillDependency.findMany({
      where: {
        skillId: { in: skillIds },
        dependsOnId: { in: skillIds },
      },
      include: {
        skill: true,
        dependsOn: true,
      },
    });

    const result = sequenceSkills(skills, dependencies);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Error in skill sequencing');
    next(error);
  }
}

/**
 * Generate roadmap for the authenticated user
 * POST /v1/roadmap/generate
 * Idempotent: returns existing roadmap if one already exists
 */
export async function generateRoadmapEndpoint(
  req: Request,
  res: Response<{ success: true; data: RoadmapGenerationResult }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const result = await generateRoadmap(userId);

    // Serialize Date to ISO string for JSON response
    res.status(201).json({
      success: true,
      data: {
        ...result,
        projectedCompletion: result.projectedCompletion.toISOString(),
      },
    });
  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Error generating roadmap');
    next(error);
  }
}

