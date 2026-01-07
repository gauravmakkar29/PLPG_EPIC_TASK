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
    roadmap.modules.map((module) => ({
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
      skippedCount: roadmap.modules.filter((m) => m.isSkipped).length,
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

