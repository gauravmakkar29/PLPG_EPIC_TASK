import type { Request, Response, NextFunction } from 'express';
import { analyzeGap, type GapAnalysisResult } from '../services/gapAnalysis.service.js';
import { sequenceSkills, type SequencingResult } from '../services/sequencing.service.js';
import { generateRoadmap, type RoadmapGenerationResult } from '../services/roadmapGeneration.service.js';
import { getRoadmap, type RoadmapResponse } from '../services/roadmapRetrieval.service.js';
import {
  recalculateRoadmapTime,
  updateModuleSkipStatus,
} from '../services/roadmap.service.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { BadRequestError, NotFoundError } from '@plpg/shared';
import type { Skill, Phase } from '@plpg/shared';

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

    // Cast skills to Skill[] with proper Phase type
    const typedSkills: Skill[] = skills.map(s => ({
      ...s,
      phase: s.phase as Phase
    }));

    const result = sequenceSkills(typedSkills, dependencies);

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Error in skill sequencing');
    next(error);
  }
}

/**
 * Generate a roadmap for the current user
 * POST /v1/roadmap/generate
 */
export async function createRoadmap(
  req: Request,
  res: Response<{ success: true; data: RoadmapGenerationResult }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const result = await generateRoadmap(userId);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Error generating roadmap');
    next(error);
  }
}

/**
 * Get user's active roadmap with all phases, modules, resources, progress, and timeline
 * GET /v1/roadmap
 * Returns 404 if no roadmap exists (frontend should redirect to onboarding)
 */
export async function getRoadmapEndpoint(
  req: Request,
  res: Response<{ success: true; data: RoadmapResponse }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const roadmap = await getRoadmap(userId);

    res.json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Pass to error handler to format response properly
      next(error);
      return;
    }
    logger.error({ error, userId: req.user?.id }, 'Error retrieving roadmap');
    next(error);
  }
}

/**
 * Get specific roadmap by ID
 * GET /v1/roadmap/:id
 */
export async function getRoadmapById(
  req: Request,
  res: Response<{ success: true; data: RoadmapResponse }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const roadmapId = req.params.id;

    // Verify roadmap belongs to user
    const roadmap = await prisma.roadmap.findFirst({
      where: {
        id: roadmapId,
        userId,
      },
    });

    if (!roadmap) {
      throw new NotFoundError('Roadmap not found');
    }

    // Use the same retrieval service
    const roadmapData = await getRoadmap(userId);

    res.json({
      success: true,
      data: roadmapData,
    });
  } catch (error) {
    logger.error({ error, userId: req.user?.id, roadmapId: req.params.id }, 'Error retrieving roadmap by ID');
    next(error);
  }
}

/**
 * Recalculate total estimated hours for a roadmap
 * POST /v1/roadmap/:id/recalculate-time
 */
export async function recalculateTime(
  req: Request,
  res: Response<{ success: true; data: { totalEstimatedHours: number } }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const roadmapId = req.params.id;

    // Verify roadmap belongs to user
    const roadmap = await prisma.roadmap.findFirst({
      where: {
        id: roadmapId,
        userId,
      },
    });

    if (!roadmap) {
      throw new BadRequestError('Roadmap not found');
    }

    const totalEstimatedHours = await recalculateRoadmapTime(roadmapId);

    res.json({
      success: true,
      data: { totalEstimatedHours },
    });
  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Error recalculating roadmap time');
    next(error);
  }
}

/**
 * Update a module's skip status
 * PATCH /v1/roadmap/:id/modules/:moduleId/skip
 */
export async function updateModuleSkip(
  req: Request,
  res: Response<{ success: true; data: { totalEstimatedHours: number } }>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const roadmapId = req.params.id;
    const moduleId = req.params.moduleId;
    const { isSkipped } = req.body;

    if (typeof isSkipped !== 'boolean') {
      throw new BadRequestError('isSkipped must be a boolean');
    }

    // Verify roadmap belongs to user
    const roadmap = await prisma.roadmap.findFirst({
      where: {
        id: roadmapId,
        userId,
      },
    });

    if (!roadmap) {
      throw new BadRequestError('Roadmap not found');
    }

    // Verify module belongs to roadmap
    const module = await prisma.roadmapModule.findFirst({
      where: {
        id: moduleId,
        roadmapId,
      },
    });

    if (!module) {
      throw new BadRequestError('Module not found');
    }

    const totalEstimatedHours = await updateModuleSkipStatus(roadmapId, moduleId, isSkipped);

    res.json({
      success: true,
      data: { totalEstimatedHours },
    });
  } catch (error) {
    logger.error({ error, userId: req.user?.id }, 'Error updating module skip status');
    next(error);
  }
}
