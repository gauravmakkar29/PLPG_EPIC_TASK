import { describe, it, expect } from 'vitest';
import {
  buildDependencyGraph,
  detectCircularDependency,
  topologicalSortWithPriority,
  groupIntoPhases,
  sequenceSkills,
  type SequencedSkill,
} from './sequencing.service.js';
import type { Skill, SkillDependency } from '@plpg/shared';
import { Phase } from '@plpg/shared';

describe('Sequencing Service', () => {
  const createMockSkill = (
    id: string,
    name: string,
    phase: string = Phase.FOUNDATION,
    sequenceOrder: number = 0
  ): Skill => ({
    id,
    name,
    slug: id,
    description: `${name} description`,
    whyThisMatters: null,
    phase: phase as any,
    estimatedHours: 10,
    isOptional: false,
    sequenceOrder,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('buildDependencyGraph', () => {
    it('should build dependency graph from skills and dependencies', () => {
      const skills: Skill[] = [
        createMockSkill('skill-a', 'Skill A'),
        createMockSkill('skill-b', 'Skill B'),
        createMockSkill('skill-c', 'Skill C'),
      ];

      const dependencies: SkillDependency[] = [
        {
          id: 'dep-1',
          skillId: 'skill-b',
          dependsOnId: 'skill-a',
          isHard: true,
        },
        {
          id: 'dep-2',
          skillId: 'skill-c',
          dependsOnId: 'skill-b',
          isHard: true,
        },
      ];

      const graph = buildDependencyGraph(skills, dependencies);

      expect(graph.get('skill-a')?.size).toBe(0);
      expect(graph.get('skill-b')?.has('skill-a')).toBe(true);
      expect(graph.get('skill-c')?.has('skill-b')).toBe(true);
    });
  });

  describe('detectCircularDependency', () => {
    it('should detect circular dependencies', () => {
      const skills: Skill[] = [
        createMockSkill('skill-a', 'Skill A'),
        createMockSkill('skill-b', 'Skill B'),
        createMockSkill('skill-c', 'Skill C'),
      ];

      const graph = new Map<string, Set<string>>();
      graph.set('skill-a', new Set(['skill-c']));
      graph.set('skill-b', new Set(['skill-a']));
      graph.set('skill-c', new Set(['skill-b']));

      const skillMap = new Map<string, Skill>();
      skills.forEach((s) => skillMap.set(s.id, s));

      const cycle = detectCircularDependency(graph, skillMap);

      expect(cycle).not.toBeNull();
      expect(cycle?.length).toBeGreaterThan(0);
    });

    it('should return null for acyclic graph', () => {
      const skills: Skill[] = [
        createMockSkill('skill-a', 'Skill A'),
        createMockSkill('skill-b', 'Skill B'),
        createMockSkill('skill-c', 'Skill C'),
      ];

      const graph = new Map<string, Set<string>>();
      graph.set('skill-a', new Set());
      graph.set('skill-b', new Set(['skill-a']));
      graph.set('skill-c', new Set(['skill-b']));

      const skillMap = new Map<string, Skill>();
      skills.forEach((s) => skillMap.set(s.id, s));

      const cycle = detectCircularDependency(graph, skillMap);

      expect(cycle).toBeNull();
    });
  });

  describe('topologicalSortWithPriority', () => {
    it('should perform basic topological sort (A→B→C)', () => {
      const skills: Skill[] = [
        createMockSkill('skill-a', 'Skill A', Phase.FOUNDATION, 1),
        createMockSkill('skill-b', 'Skill B', Phase.FOUNDATION, 2),
        createMockSkill('skill-c', 'Skill C', Phase.CORE_ML, 3),
      ];

      const graph = new Map<string, Set<string>>();
      graph.set('skill-a', new Set());
      graph.set('skill-b', new Set(['skill-a']));
      graph.set('skill-c', new Set(['skill-b']));

      const result = topologicalSortWithPriority(skills, graph);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('skill-a');
      expect(result[1].id).toBe('skill-b');
      expect(result[2].id).toBe('skill-c');
    });

    it('should handle multiple paths (A→C, B→C)', () => {
      const skills: Skill[] = [
        createMockSkill('skill-a', 'Skill A', Phase.FOUNDATION, 1),
        createMockSkill('skill-b', 'Skill B', Phase.FOUNDATION, 2),
        createMockSkill('skill-c', 'Skill C', Phase.CORE_ML, 3),
      ];

      const graph = new Map<string, Set<string>>();
      graph.set('skill-a', new Set());
      graph.set('skill-b', new Set());
      graph.set('skill-c', new Set(['skill-a', 'skill-b']));

      const result = topologicalSortWithPriority(skills, graph);

      expect(result).toHaveLength(3);
      const cIndex = result.findIndex((s) => s.id === 'skill-c');
      const aIndex = result.findIndex((s) => s.id === 'skill-a');
      const bIndex = result.findIndex((s) => s.id === 'skill-b');

      expect(cIndex).toBeGreaterThan(aIndex);
      expect(cIndex).toBeGreaterThan(bIndex);
    });

    it('should use priority score for ordering when multiple valid orderings exist', () => {
      const skills: Skill[] = [
        createMockSkill('skill-a', 'Skill A', Phase.FOUNDATION, 2),
        createMockSkill('skill-b', 'Skill B', Phase.FOUNDATION, 1),
        createMockSkill('skill-c', 'Skill C', Phase.CORE_ML, 3),
      ];

      const graph = new Map<string, Set<string>>();
      graph.set('skill-a', new Set());
      graph.set('skill-b', new Set());
      graph.set('skill-c', new Set(['skill-a', 'skill-b']));

      const result = topologicalSortWithPriority(skills, graph);

      expect(result).toHaveLength(3);
      // skill-b should come before skill-a due to lower sequenceOrder (higher priority)
      const aIndex = result.findIndex((s) => s.id === 'skill-a');
      const bIndex = result.findIndex((s) => s.id === 'skill-b');
      expect(bIndex).toBeLessThan(aIndex);
    });
  });

  describe('groupIntoPhases', () => {
    it('should group skills into phases correctly', () => {
      const sequencedSkills: SequencedSkill[] = [
        {
          ...createMockSkill('skill-1', 'Foundation Skill 1', Phase.FOUNDATION),
          sequenceOrder: 1,
        },
        {
          ...createMockSkill('skill-2', 'Foundation Skill 2', Phase.FOUNDATION),
          sequenceOrder: 2,
        },
        {
          ...createMockSkill('skill-3', 'Intermediate Skill', Phase.CORE_ML),
          sequenceOrder: 3,
        },
        {
          ...createMockSkill('skill-4', 'Advanced Skill', Phase.DEEP_LEARNING),
          sequenceOrder: 4,
        },
      ];

      const phaseGroups = groupIntoPhases(sequencedSkills);

      expect(phaseGroups).toHaveLength(3);
      expect(phaseGroups[0].phase).toBe(Phase.FOUNDATION);
      expect(phaseGroups[0].skills).toHaveLength(2);
      expect(phaseGroups[1].phase).toBe(Phase.CORE_ML);
      expect(phaseGroups[1].skills).toHaveLength(1);
      expect(phaseGroups[2].phase).toBe(Phase.DEEP_LEARNING);
      expect(phaseGroups[2].skills).toHaveLength(1);
    });

    it('should respect phase boundaries (Foundation → Intermediate → Advanced)', () => {
      const sequencedSkills: SequencedSkill[] = [
        {
          ...createMockSkill('skill-1', 'Foundation', Phase.FOUNDATION),
          sequenceOrder: 1,
        },
        {
          ...createMockSkill('skill-2', 'Intermediate', Phase.CORE_ML),
          sequenceOrder: 2,
        },
        {
          ...createMockSkill('skill-3', 'Advanced', Phase.DEEP_LEARNING),
          sequenceOrder: 3,
        },
      ];

      const phaseGroups = groupIntoPhases(sequencedSkills);

      expect(phaseGroups[0].phase).toBe(Phase.FOUNDATION);
      expect(phaseGroups[1].phase).toBe(Phase.CORE_ML);
      expect(phaseGroups[2].phase).toBe(Phase.DEEP_LEARNING);
    });
  });

  describe('sequenceSkills', () => {
    it('should sequence skills with basic DAG (A→B→C)', () => {
      const skills: Skill[] = [
        createMockSkill('skill-a', 'Skill A', Phase.FOUNDATION, 1),
        createMockSkill('skill-b', 'Skill B', Phase.FOUNDATION, 2),
        createMockSkill('skill-c', 'Skill C', Phase.CORE_ML, 3),
      ];

      const dependencies: SkillDependency[] = [
        {
          id: 'dep-1',
          skillId: 'skill-b',
          dependsOnId: 'skill-a',
          isHard: true,
        },
        {
          id: 'dep-2',
          skillId: 'skill-c',
          dependsOnId: 'skill-b',
          isHard: true,
        },
      ];

      const result = sequenceSkills(skills, dependencies);

      expect(result.hasCircularDependency).toBe(false);
      expect(result.sequencedSkills).toHaveLength(3);
      expect(result.sequencedSkills[0].id).toBe('skill-a');
      expect(result.sequencedSkills[1].id).toBe('skill-b');
      expect(result.sequencedSkills[2].id).toBe('skill-c');
      expect(result.phaseGroups).toHaveLength(2);
    });

    it('should detect and handle circular dependencies', () => {
      const skills: Skill[] = [
        createMockSkill('skill-a', 'Skill A', Phase.FOUNDATION, 1),
        createMockSkill('skill-b', 'Skill B', Phase.FOUNDATION, 2),
        createMockSkill('skill-c', 'Skill C', Phase.CORE_ML, 3),
      ];

      const dependencies: SkillDependency[] = [
        {
          id: 'dep-1',
          skillId: 'skill-a',
          dependsOnId: 'skill-c',
          isHard: true,
        },
        {
          id: 'dep-2',
          skillId: 'skill-b',
          dependsOnId: 'skill-a',
          isHard: true,
        },
        {
          id: 'dep-3',
          skillId: 'skill-c',
          dependsOnId: 'skill-b',
          isHard: true,
        },
      ];

      const result = sequenceSkills(skills, dependencies);

      expect(result.hasCircularDependency).toBe(true);
      expect(result.circularDependencyPath).toBeDefined();
      expect(result.circularDependencyPath?.length).toBeGreaterThan(0);
    });

    it('should handle empty graph', () => {
      const result = sequenceSkills([], []);

      expect(result.sequencedSkills).toHaveLength(0);
      expect(result.phaseGroups).toHaveLength(0);
      expect(result.hasCircularDependency).toBe(false);
    });

    it('should handle single node graph', () => {
      const skills: Skill[] = [createMockSkill('skill-1', 'Single Skill', Phase.FOUNDATION, 1)];

      const result = sequenceSkills(skills, []);

      expect(result.sequencedSkills).toHaveLength(1);
      expect(result.sequencedSkills[0].id).toBe('skill-1');
      expect(result.phaseGroups).toHaveLength(1);
      expect(result.hasCircularDependency).toBe(false);
    });

    it('should handle complex DAG with multiple paths', () => {
      // Python Basics → NumPy → Pandas → Data Preprocessing
      //                    ↘       ↗
      //              Linear Algebra → ML Fundamentals → Supervised Learning
      //                              ↗
      //                    Statistics
      const skills: Skill[] = [
        createMockSkill('python', 'Python Basics', Phase.FOUNDATION, 1),
        createMockSkill('numpy', 'NumPy', Phase.FOUNDATION, 2),
        createMockSkill('pandas', 'Pandas', Phase.FOUNDATION, 3),
        createMockSkill('preprocessing', 'Data Preprocessing', Phase.FOUNDATION, 4),
        createMockSkill('linear-algebra', 'Linear Algebra', Phase.FOUNDATION, 5),
        createMockSkill('statistics', 'Statistics', Phase.FOUNDATION, 6),
        createMockSkill('ml-fundamentals', 'ML Fundamentals', Phase.CORE_ML, 7),
        createMockSkill('supervised-learning', 'Supervised Learning', Phase.CORE_ML, 8),
      ];

      const dependencies: SkillDependency[] = [
        { id: 'd1', skillId: 'numpy', dependsOnId: 'python', isHard: true },
        { id: 'd2', skillId: 'pandas', dependsOnId: 'numpy', isHard: true },
        { id: 'd3', skillId: 'preprocessing', dependsOnId: 'pandas', isHard: true },
        { id: 'd4', skillId: 'numpy', dependsOnId: 'linear-algebra', isHard: true },
        { id: 'd5', skillId: 'ml-fundamentals', dependsOnId: 'linear-algebra', isHard: true },
        { id: 'd6', skillId: 'ml-fundamentals', dependsOnId: 'statistics', isHard: true },
        { id: 'd7', skillId: 'supervised-learning', dependsOnId: 'ml-fundamentals', isHard: true },
      ];

      const result = sequenceSkills(skills, dependencies);

      expect(result.hasCircularDependency).toBe(false);
      expect(result.sequencedSkills.length).toBe(skills.length);

      // Verify prerequisites come before dependents
      const pythonIndex = result.sequencedSkills.findIndex((s) => s.id === 'python');
      const numpyIndex = result.sequencedSkills.findIndex((s) => s.id === 'numpy');
      const pandasIndex = result.sequencedSkills.findIndex((s) => s.id === 'pandas');
      const mlIndex = result.sequencedSkills.findIndex((s) => s.id === 'ml-fundamentals');

      expect(pythonIndex).toBeLessThan(numpyIndex);
      expect(numpyIndex).toBeLessThan(pandasIndex);
      expect(mlIndex).toBeGreaterThan(numpyIndex);
    });
  });
});

