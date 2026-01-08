import { logger } from '../lib/logger.js';
import type { Skill, SkillDependency } from '@plpg/shared';
import { PHASE_ORDER, type Phase } from '@plpg/shared';

export interface SequencedSkill extends Skill {
  sequenceOrder: number;
  phase: Phase;
}

export interface PhaseGroup {
  phase: Phase;
  skills: SequencedSkill[];
  totalHours: number;
  sequenceStart: number;
}

export interface SequencingResult {
  sequencedSkills: SequencedSkill[];
  phaseGroups: PhaseGroup[];
  hasCircularDependency: boolean;
  circularDependencyPath?: string[];
}

/**
 * Build dependency graph from skill prerequisites.
 * Returns a map: skillId -> Set of prerequisite skill IDs
 */
export function buildDependencyGraph(
  skills: Skill[],
  dependencies: SkillDependency[]
): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();

  // Initialize all skills in the graph
  for (const skill of skills) {
    graph.set(skill.id, new Set());
  }

  // Add dependencies
  for (const dep of dependencies) {
    if (graph.has(dep.skillId)) {
      graph.get(dep.skillId)!.add(dep.dependsOnId);
    }
  }

  return graph;
}

/**
 * Detect circular dependencies using DFS.
 * Returns the cycle path if found, null otherwise.
 */
export function detectCircularDependency(
  graph: Map<string, Set<string>>,
  _skillMap: Map<string, Skill>
): string[] | null {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];
  let cyclePath: string[] | null = null;

  function dfs(skillId: string): boolean {
    if (recursionStack.has(skillId)) {
      // Found a cycle - extract the cycle path
      const cycleStartIndex = path.indexOf(skillId);
      if (cycleStartIndex !== -1) {
        cyclePath = [...path.slice(cycleStartIndex), skillId];
        return true;
      }
      return false;
    }

    if (visited.has(skillId)) {
      return false;
    }

    visited.add(skillId);
    recursionStack.add(skillId);
    path.push(skillId);

    const prerequisites = graph.get(skillId) || new Set();
    for (const prereqId of prerequisites) {
      if (dfs(prereqId)) {
        return true;
      }
    }

    recursionStack.delete(skillId);
    path.pop();
    return false;
  }

  // Check all skills
  for (const skillId of graph.keys()) {
    if (!visited.has(skillId)) {
      if (dfs(skillId)) {
        return cyclePath;
      }
    }
  }

  return null;
}

/**
 * Calculate priority score for a skill.
 * Higher score = higher priority.
 * Uses sequenceOrder as the primary factor.
 */
function calculatePriorityScore(skill: Skill): number {
  // Use sequenceOrder as base priority (lower sequenceOrder = higher priority)
  // Invert so higher number = higher priority
  const baseScore = 1000 - skill.sequenceOrder;

  // Boost non-optional skills
  const optionalPenalty = skill.isOptional ? -100 : 0;

  // Phase-based priority (foundation > intermediate > advanced)
  const phaseOrder = PHASE_ORDER.indexOf(skill.phase as Phase);
  const phaseScore = (PHASE_ORDER.length - phaseOrder) * 10;

  return baseScore + optionalPenalty + phaseScore;
}

/**
 * Topological sort with priority-based ordering for multiple valid orderings.
 * Uses Kahn's algorithm with priority queue for tie-breaking.
 */
export function topologicalSortWithPriority(
  skills: Skill[],
  dependencyGraph: Map<string, Set<string>>
): SequencedSkill[] {
  const skillMap = new Map<string, Skill>();
  const inDegree = new Map<string, number>();
  const priorityQueue: Array<{ skill: Skill; priority: number }> = [];

  // Initialize
  for (const skill of skills) {
    skillMap.set(skill.id, skill);
    inDegree.set(skill.id, 0);
  }

  // Calculate in-degrees
  for (const skill of skills) {
    const prereqs = dependencyGraph.get(skill.id) || new Set();
    for (const prereqId of prereqs) {
      if (skillMap.has(prereqId)) {
        inDegree.set(skill.id, (inDegree.get(skill.id) || 0) + 1);
      }
    }
  }

  // Find all nodes with no incoming edges and add to priority queue
  for (const skill of skills) {
    if ((inDegree.get(skill.id) || 0) === 0) {
      priorityQueue.push({
        skill,
        priority: calculatePriorityScore(skill),
      });
    }
  }

  // Sort by priority (highest first)
  priorityQueue.sort((a, b) => b.priority - a.priority);

  const result: SequencedSkill[] = [];
  let sequenceOrder = 1;

  // Process queue
  while (priorityQueue.length > 0) {
    const { skill } = priorityQueue.shift()!;
    result.push({
      ...skill,
      sequenceOrder: sequenceOrder++,
    });

    // Find all skills that depend on this one
    for (const [otherSkillId, prereqs] of dependencyGraph.entries()) {
      if (prereqs.has(skill.id) && skillMap.has(otherSkillId)) {
        const newDegree = (inDegree.get(otherSkillId) || 0) - 1;
        inDegree.set(otherSkillId, newDegree);

        if (newDegree === 0) {
          const otherSkill = skillMap.get(otherSkillId)!;
          priorityQueue.push({
            skill: otherSkill,
            priority: calculatePriorityScore(otherSkill),
          });
          // Re-sort after adding
          priorityQueue.sort((a, b) => b.priority - a.priority);
        }
      }
    }
  }

  // If we couldn't process all skills, there's a cycle
  if (result.length !== skills.length) {
    logger.warn(
      {
        processed: result.length,
        total: skills.length,
      },
      'Topological sort incomplete - possible cycle in dependency graph'
    );
  }

  return result;
}

/**
 * Group sequenced skills into phases.
 * Respects phase boundaries: Foundation → Intermediate → Advanced
 */
export function groupIntoPhases(sequencedSkills: SequencedSkill[]): PhaseGroup[] {
  const phaseMap = new Map<Phase, SequencedSkill[]>();

  // Group by phase
  for (const skill of sequencedSkills) {
    const phase = skill.phase as Phase;
    if (!phaseMap.has(phase)) {
      phaseMap.set(phase, []);
    }
    phaseMap.get(phase)!.push(skill);
  }

  // Create phase groups in order
  const phaseGroups: PhaseGroup[] = [];
  let sequenceStart = 1;

  for (const phase of PHASE_ORDER) {
    const skills = phaseMap.get(phase) || [];
    if (skills.length > 0) {
      // Sort skills within phase by sequenceOrder
      skills.sort((a, b) => a.sequenceOrder - b.sequenceOrder);

      const totalHours = skills.reduce((sum, skill) => sum + skill.estimatedHours, 0);

      phaseGroups.push({
        phase,
        skills,
        totalHours,
        sequenceStart,
      });

      sequenceStart += skills.length;
    }
  }

  return phaseGroups;
}

/**
 * Sequence skills respecting prerequisites and phase boundaries.
 * Main function that orchestrates the sequencing process.
 */
export function sequenceSkills(
  skills: Skill[],
  dependencies: SkillDependency[]
): SequencingResult {
  const startTime = Date.now();

  if (skills.length === 0) {
    return {
      sequencedSkills: [],
      phaseGroups: [],
      hasCircularDependency: false,
    };
  }

  // 1. Build dependency graph
  const dependencyGraph = buildDependencyGraph(skills, dependencies);

  // 2. Detect circular dependencies
  const skillMap = new Map<string, Skill>();
  for (const skill of skills) {
    skillMap.set(skill.id, skill);
  }

  const cycle = detectCircularDependency(dependencyGraph, skillMap);
  if (cycle) {
    const cycleNames = cycle.map((id) => skillMap.get(id)?.name || id);
    logger.error(
      {
        cycle: cycleNames,
        cycleIds: cycle,
      },
      'Circular dependency detected in skill prerequisites'
    );

    // Try to sequence what we can by removing cycle edges temporarily
    // Remove dependencies that cause the cycle
    const cycleIds = new Set(cycle);
    const filteredDependencies = dependencies.filter((dep) => {
      // Remove edge if both nodes are in the cycle
      return !(cycleIds.has(dep.skillId) && cycleIds.has(dep.dependsOnId));
    });

    const filteredGraph = buildDependencyGraph(skills, filteredDependencies);
    const sequencedSkills = topologicalSortWithPriority(skills, filteredGraph);
    const phaseGroups = groupIntoPhases(sequencedSkills);

    return {
      sequencedSkills,
      phaseGroups,
      hasCircularDependency: true,
      circularDependencyPath: cycleNames,
    };
  }

  // 3. Perform topological sort with priority
  const sequencedSkills = topologicalSortWithPriority(skills, dependencyGraph);

  // 4. Group into phases
  const phaseGroups = groupIntoPhases(sequencedSkills);

  // 5. Verify phase boundaries are respected
  // Skills in later phases should not depend on skills in earlier phases
  // (This is already handled by topological sort, but we verify)
  for (let i = 0; i < phaseGroups.length; i++) {
    const currentPhase = phaseGroups[i];
    const currentPhaseIndex = PHASE_ORDER.indexOf(currentPhase.phase);

    for (const skill of currentPhase.skills) {
      const prereqs = dependencyGraph.get(skill.id) || new Set();
      for (const prereqId of prereqs) {
        const prereqSkill = sequencedSkills.find((s) => s.id === prereqId);
        if (prereqSkill) {
          const prereqPhaseIndex = PHASE_ORDER.indexOf(prereqSkill.phase as Phase);
          if (prereqPhaseIndex > currentPhaseIndex) {
            logger.warn(
              {
                skill: skill.name,
                skillPhase: skill.phase,
                prereq: prereqSkill.name,
                prereqPhase: prereqSkill.phase,
              },
              'Phase boundary violation detected - prerequisite in later phase'
            );
          }
        }
      }
    }
  }

  const duration = Date.now() - startTime;
  logger.info(
    {
      skillCount: skills.length,
      phaseCount: phaseGroups.length,
      duration,
    },
    'Skill sequencing completed'
  );

  return {
    sequencedSkills,
    phaseGroups,
    hasCircularDependency: false,
  };
}

