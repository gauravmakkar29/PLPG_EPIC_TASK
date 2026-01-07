import { logger } from '../lib/logger.js';
import type { RoadmapModule, Skill, Resource } from '@plpg/shared';

export interface TimeCalculationConfig {
  /** Practice time ratio (default: 0.5 = 50% of resource time) */
  practiceTimeRatio?: number;
  /** Buffer percentage (default: 0.1 = 10%) */
  bufferPercentage?: number;
}

export interface ModuleTimeData {
  moduleId: string;
  skillId: string;
  resourceTimeHours: number;
  practiceTimeHours: number;
  moduleTimeHours: number;
  isSkipped: boolean;
}

export interface TimeCalculationResult {
  totalResourceTimeHours: number;
  totalPracticeTimeHours: number;
  totalModuleTimeHours: number;
  bufferHours: number;
  totalEstimatedHours: number;
  roundedTotalHours: number;
  moduleBreakdown: ModuleTimeData[];
}

/**
 * Calculate resource time for a module.
 * Uses skill.estimatedHours as the resource time (pre-defined during curation).
 * If resources are provided, can optionally sum their durations instead.
 */
function calculateResourceTime(
  skill: Skill,
  resources?: Resource[]
): number {
  // If resources are provided and have durations, sum them
  if (resources && resources.length > 0) {
    const totalMinutes = resources.reduce((sum, resource) => {
      return sum + (resource.durationMinutes || 0);
    }, 0);
    
    if (totalMinutes > 0) {
      // Convert minutes to hours
      return totalMinutes / 60;
    }
  }
  
  // Fallback to skill's estimatedHours (pre-defined during curation)
  return skill.estimatedHours;
}

/**
 * Calculate total learning time for a roadmap.
 * 
 * Formula:
 * - Module Time = Resource Time + Practice Time
 * - Practice Time = Resource Time * practiceRatio (default 0.5)
 * - Buffer = Total Module Time * bufferPercentage (default 0.1)
 * - Final = (Total Module Time + Buffer) rounded to nearest hour
 * 
 * @param modules - Roadmap modules with their associated skills
 * @param config - Optional configuration for practice ratio and buffer
 * @returns Time calculation result with breakdown
 */
export function calculateRoadmapTime(
  modules: Array<{
    id: string;
    skillId: string;
    isSkipped: boolean;
    skill: Skill;
    resources?: Resource[];
  }>,
  config: TimeCalculationConfig = {}
): TimeCalculationResult {
  const practiceRatio = config.practiceTimeRatio ?? 0.5;
  const bufferPercentage = config.bufferPercentage ?? 0.1;

  const moduleBreakdown: ModuleTimeData[] = [];
  let totalResourceTimeHours = 0;
  let totalPracticeTimeHours = 0;
  let totalModuleTimeHours = 0;

  // Calculate time for each non-skipped module
  for (const module of modules) {
    const resourceTimeHours = calculateResourceTime(module.skill, module.resources);
    const practiceTimeHours = resourceTimeHours * practiceRatio;
    const moduleTimeHours = resourceTimeHours + practiceTimeHours;

    moduleBreakdown.push({
      moduleId: module.id,
      skillId: module.skillId,
      resourceTimeHours,
      practiceTimeHours,
      moduleTimeHours,
      isSkipped: module.isSkipped,
    });

    // Only count non-skipped modules
    if (!module.isSkipped) {
      totalResourceTimeHours += resourceTimeHours;
      totalPracticeTimeHours += practiceTimeHours;
      totalModuleTimeHours += moduleTimeHours;
    }
  }

  // Calculate buffer (10% of total module time)
  const bufferHours = totalModuleTimeHours * bufferPercentage;

  // Final total with buffer
  const totalEstimatedHours = totalModuleTimeHours + bufferHours;

  // Round to nearest hour
  const roundedTotalHours = Math.round(totalEstimatedHours);

  logger.debug(
    {
      moduleCount: modules.length,
      skippedCount: modules.filter((m) => m.isSkipped).length,
      totalResourceTimeHours,
      totalPracticeTimeHours,
      totalModuleTimeHours,
      bufferHours,
      totalEstimatedHours,
      roundedTotalHours,
    },
    'Roadmap time calculation completed'
  );

  return {
    totalResourceTimeHours,
    totalPracticeTimeHours,
    totalModuleTimeHours,
    bufferHours,
    totalEstimatedHours,
    roundedTotalHours,
    moduleBreakdown,
  };
}

/**
 * Calculate time for a single module.
 * Useful for individual module time estimates.
 */
export function calculateModuleTime(
  skill: Skill,
  resources?: Resource[],
  practiceRatio: number = 0.5
): {
  resourceTimeHours: number;
  practiceTimeHours: number;
  totalTimeHours: number;
} {
  const resourceTimeHours = calculateResourceTime(skill, resources);
  const practiceTimeHours = resourceTimeHours * practiceRatio;
  const totalTimeHours = resourceTimeHours + practiceTimeHours;

  return {
    resourceTimeHours,
    practiceTimeHours,
    totalTimeHours,
  };
}

