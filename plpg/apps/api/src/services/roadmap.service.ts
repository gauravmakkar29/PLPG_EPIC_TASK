import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { analyzeGap } from './gapAnalysis.service.js';
import { sequenceSkills } from './sequencing.service.js';
import { calculateRoadmapTime } from './timeCalculation.service.js';
import type { Roadmap, RoadmapModule } from '@plpg/shared';

export interface GenerateRoadmapInput {
  userId: string;
  sourceRole: string;
  targetRole: string;
  title?: string;
  description?: string;
}

export interface GenerateRoadmapResult {
  roadmap: Roadmap;
  modules: RoadmapModule[];
  totalEstimatedHours: number;
}

/**
 * Recalculate and update total estimated hours for a roadmap.
 * This should be called whenever modules are added, removed, or their skip status changes.
 */
export async function recalculateRoadmapTime(roadmapId: string): Promise<number> {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: {
      modules: {
        include: {
          skill: {
            include: {
              resources: true,
            },
          },
        },
      },
    },
  });

  if (!roadmap) {
    throw new Error(`Roadmap ${roadmapId} not found`);
  }

  // Calculate time using the time calculation service
  const timeResult = calculateRoadmapTime(
    roadmap.modules.map((module: { id: string; skillId: string; isSkipped: boolean; skill: { id: string; name: string; slug: string; description: string; whyThisMatters: string | null; phase: string; estimatedHours: number; isOptional: boolean; sequenceOrder: number; createdAt: Date; updatedAt: Date; resources: Array<{ id: string; skillId: string; title: string; url: string; type: string; provider: string | null; durationMinutes: number | null; isFree: boolean; quality: number; createdAt: Date; updatedAt: Date }> } }) => ({
      id: module.id,
      skillId: module.skillId,
      isSkipped: module.isSkipped,
      skill: module.skill,
      resources: module.skill.resources,
    }))
  );

  // Update roadmap with calculated total hours
  await prisma.roadmap.update({
    where: { id: roadmapId },
    data: {
      totalEstimatedHours: timeResult.roundedTotalHours,
    },
  });

  logger.info(
    {
      roadmapId,
      totalEstimatedHours: timeResult.roundedTotalHours,
      moduleCount: roadmap.modules.length,
      skippedCount: roadmap.modules.filter((m: { isSkipped: boolean }) => m.isSkipped).length,
    },
    'Roadmap time recalculated'
  );

  return timeResult.roundedTotalHours;
}

/**
 * Generate a roadmap for a user based on their onboarding data.
 * This performs gap analysis, sequences skills, creates modules, and calculates time.
 */
export async function generateRoadmap(
  input: GenerateRoadmapInput
): Promise<GenerateRoadmapResult> {
  const startTime = Date.now();

  // 1. Perform gap analysis
  const gapAnalysis = await analyzeGap(input.userId, input.targetRole);

  if (gapAnalysis.orderedSkills.length === 0) {
    logger.warn(
      { userId: input.userId, targetRole: input.targetRole },
      'No missing skills found - user may already have all required skills'
    );
  }

  // 2. Sequence skills respecting prerequisites
  const skillIds = gapAnalysis.orderedSkills.map((s) => s.id);
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

  const sequencingResult = sequenceSkills(gapAnalysis.orderedSkills, dependencies);

  // 3. Create roadmap
  const roadmap = await prisma.roadmap.create({
    data: {
      userId: input.userId,
      title: input.title || `${input.sourceRole} to ${input.targetRole}`,
      description: input.description || null,
      sourceRole: input.sourceRole,
      targetRole: input.targetRole,
      totalEstimatedHours: 0, // Will be calculated after modules are created
      isActive: true,
    },
  });

  // 4. Create roadmap modules from sequenced skills
  const modules: RoadmapModule[] = [];
  for (const sequencedSkill of sequencingResult.sequencedSkills) {
    const module = await prisma.roadmapModule.create({
      data: {
        roadmapId: roadmap.id,
        skillId: sequencedSkill.id,
        phase: sequencedSkill.phase,
        sequenceOrder: sequencedSkill.sequenceOrder,
        isLocked: sequencedSkill.sequenceOrder > 1, // First module is unlocked
        isSkipped: false,
      },
    });
    modules.push(module);
  }

  // 5. Calculate and update total estimated hours
  const totalEstimatedHours = await recalculateRoadmapTime(roadmap.id);

  // 6. Update roadmap with calculated hours
  const updatedRoadmap = await prisma.roadmap.update({
    where: { id: roadmap.id },
    data: {
      totalEstimatedHours: totalEstimatedHours,
    },
  });

  const duration = Date.now() - startTime;
  logger.info(
    {
      roadmapId: updatedRoadmap.id,
      userId: input.userId,
      targetRole: input.targetRole,
      moduleCount: modules.length,
      totalEstimatedHours,
      duration,
    },
    'Roadmap generated successfully'
  );

  if (duration > 3000) {
    logger.warn({ duration }, 'Roadmap generation exceeded performance target of 3 seconds');
  }

  return {
    roadmap: updatedRoadmap,
    modules,
    totalEstimatedHours,
  };
}

/**
 * Update a module's skip status and recalculate roadmap time.
 */
export async function updateModuleSkipStatus(
  roadmapId: string,
  moduleId: string,
  isSkipped: boolean
): Promise<number> {
  await prisma.roadmapModule.update({
    where: { id: moduleId },
    data: { isSkipped },
  });

  // Recalculate total hours
  return await recalculateRoadmapTime(roadmapId);
}

export interface UpdateProgressInput {
  userId: string;
  roadmapId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  timeSpentMinutes?: number;
  notes?: string;
}

export interface UpdateProgressResult {
  progress: {
    id: string;
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
    timeSpentMinutes: number;
  };
  unlockedModules: string[];
}

/**
 * Update the progress status for a module.
 * When a module is marked as completed, unlock the next sequential module.
 */
export async function updateModuleProgress(
  input: UpdateProgressInput
): Promise<UpdateProgressResult> {
  const { userId, roadmapId, moduleId, status, timeSpentMinutes, notes } = input;
  const now = new Date();

  // First, get or create the progress record
  let progress = await prisma.progress.findUnique({
    where: {
      userId_roadmapModuleId: {
        userId,
        roadmapModuleId: moduleId,
      },
    },
  });

  const updateData: {
    status: string;
    startedAt?: Date;
    completedAt?: Date | null;
    timeSpentMinutes?: number;
    notes?: string;
  } = {
    status,
  };

  // Set timestamps based on status changes
  if (status === 'in_progress' && (!progress || progress.status === 'not_started')) {
    updateData.startedAt = now;
  }

  if (status === 'completed') {
    updateData.completedAt = now;
    if (!progress?.startedAt) {
      updateData.startedAt = now;
    }
  }

  if (status === 'not_started') {
    updateData.completedAt = null;
  }

  if (timeSpentMinutes !== undefined) {
    updateData.timeSpentMinutes = timeSpentMinutes;
  }

  if (notes !== undefined) {
    updateData.notes = notes;
  }

  // Upsert the progress record
  progress = await prisma.progress.upsert({
    where: {
      userId_roadmapModuleId: {
        userId,
        roadmapModuleId: moduleId,
      },
    },
    update: updateData,
    create: {
      userId,
      roadmapModuleId: moduleId,
      status,
      startedAt: status !== 'not_started' ? now : null,
      completedAt: status === 'completed' ? now : null,
      timeSpentMinutes: timeSpentMinutes || 0,
      notes: notes || null,
    },
  });

  // Track unlocked modules
  const unlockedModules: string[] = [];

  // If module is completed, unlock the next module(s)
  if (status === 'completed') {
    // Get the current module to find its sequence order
    const currentModule = await prisma.roadmapModule.findUnique({
      where: { id: moduleId },
    });

    if (currentModule) {
      // Find and unlock the next module in sequence
      const nextModule = await prisma.roadmapModule.findFirst({
        where: {
          roadmapId,
          sequenceOrder: currentModule.sequenceOrder + 1,
          isLocked: true,
        },
      });

      if (nextModule) {
        await prisma.roadmapModule.update({
          where: { id: nextModule.id },
          data: { isLocked: false },
        });
        unlockedModules.push(nextModule.id);

        logger.info(
          {
            userId,
            roadmapId,
            completedModuleId: moduleId,
            unlockedModuleId: nextModule.id,
          },
          'Module unlocked after completion'
        );
      }

      // Update completed hours on roadmap
      const completedModules = await prisma.roadmapModule.findMany({
        where: {
          roadmapId,
        },
        include: {
          skill: true,
          progress: {
            where: {
              status: 'completed',
            },
          },
        },
      });

      const completedHours = completedModules
        .filter((m: { progress: unknown[] }) => m.progress.length > 0)
        .reduce((sum: number, m: { skill: { estimatedHours: number } }) => sum + m.skill.estimatedHours, 0);

      await prisma.roadmap.update({
        where: { id: roadmapId },
        data: { completedHours },
      });
    }
  }

  logger.info(
    {
      userId,
      roadmapId,
      moduleId,
      status,
      unlockedCount: unlockedModules.length,
    },
    'Module progress updated'
  );

  return {
    progress: {
      id: progress.id,
      status: progress.status,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
      timeSpentMinutes: progress.timeSpentMinutes,
    },
    unlockedModules,
  };
}

