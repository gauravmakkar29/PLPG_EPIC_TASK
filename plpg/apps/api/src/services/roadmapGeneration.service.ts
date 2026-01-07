import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { analyzeGap } from './gapAnalysis.service.js';
import { sequenceSkills } from './sequencing.service.js';
import type { Skill, SkillDependency } from '@plpg/shared';

export interface RoadmapGenerationResult {
  roadmapId: string;
  totalHours: number;
  projectedCompletion: Date;
  moduleCount: number;
  phaseCount: number;
}

/**
 * Calculate projected completion date based on total hours and weekly hours.
 * Formula: projectedCompletion = now + (totalHours / weeklyHours) weeks
 */
function calculateProjectedCompletion(totalHours: number, weeklyHours: number): Date {
  const weeks = Math.ceil(totalHours / weeklyHours);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + weeks * 7);
  return completionDate;
}

/**
 * Generate a roadmap title based on source and target roles.
 */
function generateRoadmapTitle(sourceRole: string | null, targetRole: string): string {
  if (sourceRole) {
    return `From ${sourceRole} to ${targetRole}`;
  }
  return `Path to ${targetRole}`;
}

/**
 * Generate roadmap description.
 */
function generateRoadmapDescription(targetRole: string, totalHours: number): string {
  return `Personalized learning path to become a ${targetRole}. Estimated ${totalHours} hours of focused learning.`;
}

/**
 * Generate a roadmap for a user based on their onboarding data.
 * This function:
 * 1. Performs gap analysis to identify missing skills
 * 2. Sequences skills using prerequisite dependencies
 * 3. Creates roadmap with modules organized by phases
 * 4. Calculates projected completion date
 *
 * @param userId - User ID
 * @returns Roadmap generation result
 */
export async function generateRoadmap(userId: string): Promise<RoadmapGenerationResult> {
  const startTime = Date.now();

  // Check if roadmap already exists (idempotency)
  const existingRoadmap = await prisma.roadmap.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });

  if (existingRoadmap) {
    logger.info({ userId, roadmapId: existingRoadmap.id }, 'Roadmap already exists, returning existing');
    const moduleCount = await prisma.roadmapModule.count({
      where: { roadmapId: existingRoadmap.id },
    });
    const phaseCount = await prisma.roadmapModule.groupBy({
      by: ['phase'],
      where: { roadmapId: existingRoadmap.id },
    });

    // Calculate projected completion from existing roadmap
    // We need to get weekly hours from onboarding state to calculate this
    const onboardingState = await prisma.onboardingState.findUnique({
      where: { userId },
      select: { weeklyHours: true },
    });
    const weeklyHours = onboardingState?.weeklyHours || 10; // Default to 10 if not found
    const projectedCompletion = calculateProjectedCompletion(
      existingRoadmap.totalEstimatedHours,
      weeklyHours
    );

    return {
      roadmapId: existingRoadmap.id,
      totalHours: existingRoadmap.totalEstimatedHours,
      projectedCompletion,
      moduleCount,
      phaseCount: phaseCount.length,
    };
  }

  // Get user's onboarding data
  const onboardingState = await prisma.onboardingState.findUnique({
    where: { userId },
  });

  if (!onboardingState || !onboardingState.isComplete) {
    throw new Error('Onboarding must be completed before generating roadmap');
  }

  if (!onboardingState.targetRole || !onboardingState.weeklyHours) {
    throw new Error('Target role and weekly hours are required for roadmap generation');
  }

  const { targetRole, weeklyHours, currentRole, existingSkills } = onboardingState;

  // 1. Perform gap analysis
  const gapAnalysis = await analyzeGap(userId, targetRole);

  if (gapAnalysis.missingSkills.length === 0) {
    logger.warn({ userId, targetRole }, 'No missing skills found - user may already have all required skills');
    // Still create an empty roadmap
  }

  // 2. Load dependencies for sequencing
  const skillIds = gapAnalysis.missingSkills.map((s) => s.id);
  const dependencies = await prisma.skillDependency.findMany({
    where: {
      skillId: { in: skillIds },
      dependsOnId: { in: skillIds },
    },
  });

  // 3. Sequence skills
  const sequencingResult = sequenceSkills(gapAnalysis.missingSkills, dependencies);

  if (sequencingResult.hasCircularDependency) {
    logger.warn(
      { userId, cycle: sequencingResult.circularDependencyPath },
      'Circular dependency detected during sequencing, proceeding with available skills'
    );
  }

  // 4. Create roadmap
  const totalHours = sequencingResult.sequencedSkills.reduce(
    (sum, skill) => sum + skill.estimatedHours,
    0
  );
  const projectedCompletion = calculateProjectedCompletion(totalHours, weeklyHours);

  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      title: generateRoadmapTitle(currentRole, targetRole),
      description: generateRoadmapDescription(targetRole, totalHours),
      sourceRole: currentRole || 'beginner',
      targetRole,
      totalEstimatedHours: totalHours,
      completedHours: 0,
      isActive: true,
    },
  });

  // 5. Create roadmap modules from sequenced skills
  const modules = sequencingResult.sequencedSkills.map((skill, index) => ({
    roadmapId: roadmap.id,
    skillId: skill.id,
    phase: skill.phase,
    sequenceOrder: index + 1,
    isLocked: index > 0, // First module is unlocked, others are locked initially
    isSkipped: false,
  }));

  await prisma.roadmapModule.createMany({
    data: modules,
  });

  const duration = Date.now() - startTime;
  logger.info(
    {
      userId,
      roadmapId: roadmap.id,
      moduleCount: modules.length,
      totalHours,
      duration,
    },
    'Roadmap generated successfully'
  );

  if (duration > 3000) {
    logger.warn({ duration }, 'Roadmap generation exceeded performance target of 3 seconds');
  }

  // Count phases
  const phaseGroups = sequencingResult.phaseGroups;

  return {
    roadmapId: roadmap.id,
    totalHours,
    projectedCompletion,
    moduleCount: modules.length,
    phaseCount: phaseGroups.length,
  };
}

