import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import type { Skill } from '@plpg/shared';

export interface GapAnalysisResult {
  missingSkills: Skill[];
  orderedSkills: Skill[];
  totalHours: number;
}

/**
 * Get all required skills for a target role.
 * For MVP, we assume all non-optional skills are required.
 * In the future, this can be enhanced with role-specific skill mappings.
 */
async function getRequiredSkillsForRole(targetRole: string): Promise<Skill[]> {
  // For MVP, return all non-optional skills
  // TODO: Add role-specific skill mapping table in future
  const skills = await prisma.skill.findMany({
    where: {
      isOptional: false,
    },
    orderBy: {
      sequenceOrder: 'asc',
    },
  });

  logger.debug({ targetRole, skillCount: skills.length }, 'Loaded required skills for target role');
  return skills;
}

/**
 * Get all transitive prerequisites for a skill (all skills that must be learned before this skill).
 * Uses DFS to traverse the dependency graph.
 */
function getAllPrerequisites(
  skillId: string,
  dependencyMap: Map<string, Set<string>>,
  visited: Set<string> = new Set()
): Set<string> {
  if (visited.has(skillId)) {
    return new Set();
  }
  visited.add(skillId);

  const prerequisites = new Set<string>();
  const directPrereqs = dependencyMap.get(skillId) || new Set();

  for (const prereqId of directPrereqs) {
    prerequisites.add(prereqId);
    // Recursively get prerequisites of prerequisites
    const transitivePrereqs = getAllPrerequisites(prereqId, dependencyMap, visited);
    for (const transitiveId of transitivePrereqs) {
      prerequisites.add(transitiveId);
    }
  }

  return prerequisites;
}

/**
 * Check if a skill is already satisfied by the user.
 * A skill is satisfied if:
 * 1. User has the skill itself, OR
 * 2. User has a skill that depends on this skill (transitive: if user has C and A→B→C, then A and B are satisfied)
 */
function isSkillSatisfied(
  skillId: string,
  userSkillIds: Set<string>,
  dependencyMap: Map<string, Set<string>>
): boolean {
  // Check if user has the skill itself
  if (userSkillIds.has(skillId)) {
    return true;
  }

  // Check if user has any skill that requires this skill as a prerequisite
  // If user has skill C and A→B→C, then A and B are implicitly satisfied
  for (const userSkillId of userSkillIds) {
    const userSkillPrereqs = getAllPrerequisites(userSkillId, dependencyMap);
    if (userSkillPrereqs.has(skillId)) {
      return true;
    }
  }

  return false;
}

/**
 * Topological sort using Kahn's algorithm for ordering skills by prerequisites.
 * Returns skills in order such that prerequisites come before dependents.
 */
function topologicalSort(
  skills: Skill[],
  dependencyMap: Map<string, Set<string>>
): Skill[] {
  // Build in-degree map
  const inDegree = new Map<string, number>();
  const skillMap = new Map<string, Skill>();

  for (const skill of skills) {
    inDegree.set(skill.id, 0);
    skillMap.set(skill.id, skill);
  }

  // Calculate in-degrees
  for (const skill of skills) {
    const prereqs = dependencyMap.get(skill.id) || new Set();
    for (const prereqId of prereqs) {
      if (skillMap.has(prereqId)) {
        inDegree.set(skill.id, (inDegree.get(skill.id) || 0) + 1);
      }
    }
  }

  // Find all nodes with no incoming edges
  const queue: string[] = [];
  for (const [skillId, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(skillId);
    }
  }

  const result: Skill[] = [];

  // Process queue
  while (queue.length > 0) {
    const skillId = queue.shift()!;
    const skill = skillMap.get(skillId);
    if (skill) {
      result.push(skill);
    }

    // Find all skills that depend on this one
    for (const [otherSkillId, prereqs] of dependencyMap.entries()) {
      if (prereqs.has(skillId) && skillMap.has(otherSkillId)) {
        const newDegree = (inDegree.get(otherSkillId) || 0) - 1;
        inDegree.set(otherSkillId, newDegree);
        if (newDegree === 0) {
          queue.push(otherSkillId);
        }
      }
    }
  }

  // If we couldn't process all skills, there's a cycle (shouldn't happen in valid DAG)
  if (result.length !== skills.length) {
    logger.warn(
      { processed: result.length, total: skills.length },
      'Topological sort incomplete - possible cycle in dependency graph'
    );
    // Return what we have plus remaining skills
    const processedIds = new Set(result.map((s) => s.id));
    for (const skill of skills) {
      if (!processedIds.has(skill.id)) {
        result.push(skill);
      }
    }
  }

  return result;
}

/**
 * Perform gap analysis to identify missing skills for a user's target role.
 *
 * @param userId - User ID
 * @param targetRole - Target role (e.g., "ml_engineer")
 * @returns Gap analysis result with missing skills ordered by prerequisites
 */
export async function analyzeGap(userId: string, targetRole: string): Promise<GapAnalysisResult> {
  const startTime = Date.now();

  // 1. Load target role skill requirements
  const requiredSkills = await getRequiredSkillsForRole(targetRole);

  if (requiredSkills.length === 0) {
    logger.warn({ targetRole }, 'No required skills found for target role');
    return {
      missingSkills: [],
      orderedSkills: [],
      totalHours: 0,
    };
  }

  // 2. Get user's existing skills from onboarding
  const onboardingState = await prisma.onboardingState.findUnique({
    where: { userId },
    select: { existingSkills: true },
  });

  const userSkillSlugs = new Set(onboardingState?.existingSkills || []);
  
  // Convert skill slugs to skill IDs by looking them up
  const userSkills = await prisma.skill.findMany({
    where: {
      slug: { in: Array.from(userSkillSlugs) },
    },
  });
  const userSkillIds = new Set<string>(userSkills.map((s: { id: string }) => s.id));

  logger.debug(
    { userId, userSkillCount: userSkillIds.size, requiredSkillCount: requiredSkills.length },
    'Loaded user and required skills'
  );

  // 3. Load all skill dependencies
  const allDependencies = await prisma.skillDependency.findMany({
    include: {
      skill: true,
      dependsOn: true,
    },
  });

  // Build dependency map: skillId -> Set of prerequisite skill IDs
  const dependencyMap = new Map<string, Set<string>>();
  for (const dep of allDependencies) {
    if (!dependencyMap.has(dep.skillId)) {
      dependencyMap.set(dep.skillId, new Set());
    }
    dependencyMap.get(dep.skillId)!.add(dep.dependsOnId);
  }

  // 4. Identify missing skills (exclude skills user already has)
  // Handle transitive dependencies: if user has skill C where A→B→C, exclude A and B from gap
  const missingSkills: Skill[] = [];

  for (const skill of requiredSkills) {
    // Check if skill is satisfied (either directly or transitively)
    if (!isSkillSatisfied(skill.id, userSkillIds, dependencyMap)) {
      missingSkills.push(skill);
    }
  }

  // 5. Order skills by prerequisite dependencies (topological sort)
  const orderedSkills = topologicalSort(missingSkills, dependencyMap);

  // 6. Calculate total hours
  const totalHours = orderedSkills.reduce((sum, skill) => sum + skill.estimatedHours, 0);

  const duration = Date.now() - startTime;
  logger.info(
    {
      userId,
      targetRole,
      missingSkillCount: missingSkills.length,
      totalHours,
      duration,
    },
    'Gap analysis completed'
  );

  if (duration > 500) {
    logger.warn({ duration }, 'Gap analysis exceeded performance target of 500ms');
  }

  return {
    missingSkills,
    orderedSkills,
    totalHours,
  };
}

