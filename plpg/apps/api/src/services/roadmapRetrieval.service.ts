import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { NotFoundError } from '@plpg/shared/errors';

export interface RoadmapModuleWithProgress {
  id: string;
  skillId: string;
  phase: string;
  sequenceOrder: number;
  isLocked: boolean;
  isSkipped: boolean;
  skill: {
    id: string;
    name: string;
    slug: string;
    description: string;
    phase: string;
    estimatedHours: number;
    resources: Array<{
      id: string;
      title: string;
      url: string;
      type: string;
      provider: string | null;
      durationMinutes: number | null;
      isFree: boolean;
      quality: number;
    }>;
  };
  progress: {
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
    timeSpentMinutes: number;
  } | null;
}

export interface RoadmapPhase {
  phase: string;
  modules: RoadmapModuleWithProgress[];
  totalHours: number;
  completedHours: number;
  completedModules: number;
  totalModules: number;
}

export interface RoadmapProgress {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  skippedModules: number;
  notStartedModules: number;
  completionPercentage: number;
  totalHours: number;
  completedHours: number;
  remainingHours: number;
}

export interface RoadmapTimeline {
  totalHours: number;
  completedHours: number;
  remainingHours: number;
  projectedCompletion: Date;
  weeklyHours: number;
}

export interface RoadmapResponse {
  id: string;
  title: string;
  description: string | null;
  sourceRole: string;
  targetRole: string;
  phases: RoadmapPhase[];
  progress: RoadmapProgress;
  timeline: RoadmapTimeline;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculate projected completion date based on remaining hours and weekly hours.
 */
function calculateProjectedCompletion(
  remainingHours: number,
  weeklyHours: number
): Date {
  if (weeklyHours <= 0) {
    // Default to 10 hours per week if not specified
    weeklyHours = 10;
  }
  const weeks = Math.ceil(remainingHours / weeklyHours);
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + weeks * 7);
  return completionDate;
}

/**
 * Retrieve user's active roadmap with all related data.
 * Uses eager loading to optimize performance and avoid N+1 queries.
 *
 * @param userId - User ID
 * @returns Roadmap response with phases, modules, resources, progress, and timeline
 * @throws NotFoundError if no active roadmap exists
 */
export async function getRoadmap(userId: string): Promise<RoadmapResponse> {
  // Get active roadmap with all related data in a single query
  const roadmap = await prisma.roadmap.findFirst({
    where: {
      userId,
      isActive: true,
    },
    include: {
      modules: {
        include: {
          skill: {
            include: {
              resources: {
                orderBy: {
                  quality: 'desc', // Order resources by quality (best first)
                },
              },
            },
          },
          progress: {
            where: {
              userId,
            },
            take: 1, // Get the latest progress for this user
          },
        },
        orderBy: {
          sequenceOrder: 'asc',
        },
      },
    },
  });

  if (!roadmap) {
    throw new NotFoundError('No active roadmap found. Please complete onboarding to generate a roadmap.');
  }

  // Get user's weekly hours from onboarding state for timeline calculation
  const onboardingState = await prisma.onboardingState.findUnique({
    where: { userId },
    select: { weeklyHours: true },
  });
  const weeklyHours = onboardingState?.weeklyHours || 10;

  // Group modules by phase
  const phaseMap = new Map<string, RoadmapModuleWithProgress[]>();
  for (const module of roadmap.modules) {
    const phase = module.phase;
    if (!phaseMap.has(phase)) {
      phaseMap.set(phase, []);
    }
    phaseMap.get(phase)!.push({
      id: module.id,
      skillId: module.skillId,
      phase: module.phase,
      sequenceOrder: module.sequenceOrder,
      isLocked: module.isLocked,
      isSkipped: module.isSkipped,
      skill: {
        id: module.skill.id,
        name: module.skill.name,
        slug: module.skill.slug,
        description: module.skill.description,
        phase: module.skill.phase,
        estimatedHours: module.skill.estimatedHours,
        resources: module.skill.resources.map((r) => ({
          id: r.id,
          title: r.title,
          url: r.url,
          type: r.type,
          provider: r.provider,
          durationMinutes: r.durationMinutes,
          isFree: r.isFree,
          quality: r.quality,
        })),
      },
      progress: module.progress[0]
        ? {
            status: module.progress[0].status,
            startedAt: module.progress[0].startedAt,
            completedAt: module.progress[0].completedAt,
            timeSpentMinutes: module.progress[0].timeSpentMinutes,
          }
        : null,
    });
  }

  // Build phases array with progress calculations
  const phases: RoadmapPhase[] = [];
  for (const [phaseName, modules] of phaseMap.entries()) {
    const totalHours = modules.reduce(
      (sum, m) => sum + m.skill.estimatedHours,
      0
    );
    const completedModules = modules.filter(
      (m) => m.progress?.status === 'completed'
    ).length;
    const completedHours = modules
      .filter((m) => m.progress?.status === 'completed')
      .reduce((sum, m) => sum + m.skill.estimatedHours, 0);

    phases.push({
      phase: phaseName,
      modules,
      totalHours,
      completedHours,
      completedModules,
      totalModules: modules.length,
    });
  }

  // Sort phases by typical order (foundation -> intermediate -> advanced)
  const phaseOrder = ['foundation', 'intermediate', 'advanced', 'core_ml', 'deep_learning'];
  phases.sort((a, b) => {
    const aIndex = phaseOrder.indexOf(a.phase) !== -1 ? phaseOrder.indexOf(a.phase) : 999;
    const bIndex = phaseOrder.indexOf(b.phase) !== -1 ? phaseOrder.indexOf(b.phase) : 999;
    return aIndex - bIndex;
  });

  // Calculate overall progress
  const totalModules = roadmap.modules.length;
  const completedModules = roadmap.modules.filter(
    (m) => m.progress[0]?.status === 'completed'
  ).length;
  const inProgressModules = roadmap.modules.filter(
    (m) => m.progress[0]?.status === 'in_progress'
  ).length;
  const skippedModules = roadmap.modules.filter(
    (m) => m.progress[0]?.status === 'skipped' || m.isSkipped
  ).length;
  const notStartedModules = totalModules - completedModules - inProgressModules - skippedModules;

  const completionPercentage =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const totalHours = roadmap.totalEstimatedHours;
  const completedHours = roadmap.completedHours;
  const remainingHours = Math.max(0, totalHours - completedHours);

  const progress: RoadmapProgress = {
    totalModules,
    completedModules,
    inProgressModules,
    skippedModules,
    notStartedModules,
    completionPercentage,
    totalHours,
    completedHours,
    remainingHours,
  };

  // Calculate timeline
  const projectedCompletion = calculateProjectedCompletion(remainingHours, weeklyHours);

  const timeline: RoadmapTimeline = {
    totalHours,
    completedHours,
    remainingHours,
    projectedCompletion,
    weeklyHours,
  };

  logger.info(
    {
      userId,
      roadmapId: roadmap.id,
      moduleCount: totalModules,
      phaseCount: phases.length,
    },
    'Roadmap retrieved successfully'
  );

  return {
    id: roadmap.id,
    title: roadmap.title,
    description: roadmap.description,
    sourceRole: roadmap.sourceRole,
    targetRole: roadmap.targetRole,
    phases,
    progress,
    timeline,
    createdAt: roadmap.createdAt,
    updatedAt: roadmap.updatedAt,
  };
}

