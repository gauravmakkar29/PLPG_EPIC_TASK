import type { Request, Response, NextFunction } from 'express';
import { analyzeGap, type GapAnalysisResult } from '../services/gapAnalysis.service.js';
import { sequenceSkills, type SequencingResult } from '../services/sequencing.service.js';
import { generateRoadmap, type RoadmapGenerationResult } from '../services/roadmapGeneration.service.js';
import { getRoadmap, type RoadmapResponse } from '../services/roadmapRetrieval.service.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { BadRequestError, NotFoundError } from '@plpg/shared';

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

    // Serialize Date to ISO string for JSON response
    res.json({
      success: true,
      data: {
        ...roadmap,
        timeline: {
          ...roadmap.timeline,
          projectedCompletion: roadmap.timeline.projectedCompletion.toISOString(),
        },
        createdAt: roadmap.createdAt.toISOString(),
        updatedAt: roadmap.updatedAt.toISOString(),
        phases: roadmap.phases.map((phase) => ({
          ...phase,
          modules: phase.modules.map((module) => ({
            ...module,
            progress: module.progress
              ? {
                  ...module.progress,
                  startedAt: module.progress.startedAt?.toISOString() ?? null,
                  completedAt: module.progress.completedAt?.toISOString() ?? null,
                }
              : null,
          })),
        })),
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Return 404 with a message indicating redirect to onboarding
      res.status(404).json({
        success: false,
        error: error.message,
        redirectTo: '/onboarding',
      });
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

    // Serialize Date to ISO string for JSON response
    res.json({
      success: true,
      data: {
        ...roadmapData,
        timeline: {
          ...roadmapData.timeline,
          projectedCompletion: roadmapData.timeline.projectedCompletion.toISOString(),
        },
        createdAt: roadmapData.createdAt.toISOString(),
        updatedAt: roadmapData.updatedAt.toISOString(),
        phases: roadmapData.phases.map((phase) => ({
          ...phase,
          modules: phase.modules.map((module) => ({
            ...module,
            progress: module.progress
              ? {
                  ...module.progress,
                  startedAt: module.progress.startedAt?.toISOString() ?? null,
                  completedAt: module.progress.completedAt?.toISOString() ?? null,
                }
              : null,
          })),
        })),
      },
    });
  } catch (error) {
    logger.error({ error, userId: req.user?.id, roadmapId: req.params.id }, 'Error retrieving roadmap by ID');
    next(error);
  }
}

