import { describe, it, expect } from 'vitest';
import {
  calculateRoadmapTime,
  calculateModuleTime,
  type TimeCalculationConfig,
} from './timeCalculation.service.js';
import type { Skill, Resource } from '@plpg/shared';

// Helper to create a mock skill
function createMockSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: 'skill-1',
    name: 'Test Skill',
    slug: 'test-skill',
    description: 'Test description',
    whyThisMatters: null,
    phase: 'foundation',
    estimatedHours: 10,
    isOptional: false,
    sequenceOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Helper to create a mock resource
function createMockResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: 'resource-1',
    skillId: 'skill-1',
    title: 'Test Resource',
    url: 'https://example.com',
    type: 'video',
    provider: null,
    durationMinutes: 60,
    isFree: true,
    quality: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('timeCalculation.service', () => {
  describe('calculateModuleTime', () => {
    it('should calculate time for a module with skill estimatedHours', () => {
      const skill = createMockSkill({ estimatedHours: 10 });
      const result = calculateModuleTime(skill);

      expect(result.resourceTimeHours).toBe(10);
      expect(result.practiceTimeHours).toBe(5); // 10 * 0.5
      expect(result.totalTimeHours).toBe(15); // 10 + 5
    });

    it('should use resources duration when provided', () => {
      const skill = createMockSkill({ estimatedHours: 10 });
      const resources: Resource[] = [
        createMockResource({ durationMinutes: 120 }), // 2 hours
        createMockResource({ durationMinutes: 60 }), // 1 hour
      ];

      const result = calculateModuleTime(skill, resources);

      expect(result.resourceTimeHours).toBe(3); // (120 + 60) / 60
      expect(result.practiceTimeHours).toBe(1.5); // 3 * 0.5
      expect(result.totalTimeHours).toBe(4.5); // 3 + 1.5
    });

    it('should fallback to skill estimatedHours when resources have no duration', () => {
      const skill = createMockSkill({ estimatedHours: 10 });
      const resources: Resource[] = [
        createMockResource({ durationMinutes: null }),
      ];

      const result = calculateModuleTime(skill, resources);

      expect(result.resourceTimeHours).toBe(10);
      expect(result.practiceTimeHours).toBe(5);
      expect(result.totalTimeHours).toBe(15);
    });

    it('should use custom practice ratio', () => {
      const skill = createMockSkill({ estimatedHours: 10 });
      const result = calculateModuleTime(skill, undefined, 0.75);

      expect(result.resourceTimeHours).toBe(10);
      expect(result.practiceTimeHours).toBe(7.5); // 10 * 0.75
      expect(result.totalTimeHours).toBe(17.5); // 10 + 7.5
    });
  });

  describe('calculateRoadmapTime', () => {
    describe('basic time calculation', () => {
      it('should calculate time for a single module', () => {
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill: createMockSkill({ estimatedHours: 10 }),
          },
        ];

        const result = calculateRoadmapTime(modules);

        expect(result.totalResourceTimeHours).toBe(10);
        expect(result.totalPracticeTimeHours).toBe(5);
        expect(result.totalModuleTimeHours).toBe(15);
        expect(result.bufferHours).toBe(1.5); // 15 * 0.1
        expect(result.totalEstimatedHours).toBe(16.5); // 15 + 1.5
        expect(result.roundedTotalHours).toBe(17); // rounded
        expect(result.moduleBreakdown).toHaveLength(1);
      });

      it('should calculate time for multiple modules', () => {
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill: createMockSkill({ id: 'skill-1', estimatedHours: 10 }),
          },
          {
            id: 'module-2',
            skillId: 'skill-2',
            isSkipped: false,
            skill: createMockSkill({ id: 'skill-2', estimatedHours: 20 }),
          },
          {
            id: 'module-3',
            skillId: 'skill-3',
            isSkipped: false,
            skill: createMockSkill({ id: 'skill-3', estimatedHours: 30 }),
          },
        ];

        const result = calculateRoadmapTime(modules);

        // Resource time: 10 + 20 + 30 = 60
        expect(result.totalResourceTimeHours).toBe(60);
        // Practice time: 5 + 10 + 15 = 30
        expect(result.totalPracticeTimeHours).toBe(30);
        // Module time: 15 + 30 + 45 = 90
        expect(result.totalModuleTimeHours).toBe(90);
        // Buffer: 90 * 0.1 = 9
        expect(result.bufferHours).toBe(9);
        // Total: 90 + 9 = 99
        expect(result.totalEstimatedHours).toBe(99);
        // Rounded: 99
        expect(result.roundedTotalHours).toBe(99);
      });
    });

    describe('buffer time included', () => {
      it('should include 10% buffer by default', () => {
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill: createMockSkill({ estimatedHours: 100 }),
          },
        ];

        const result = calculateRoadmapTime(modules);

        // Module time: 100 + 50 = 150
        expect(result.totalModuleTimeHours).toBe(150);
        // Buffer: 150 * 0.1 = 15
        expect(result.bufferHours).toBe(15);
        // Total: 150 + 15 = 165
        expect(result.totalEstimatedHours).toBe(165);
        expect(result.roundedTotalHours).toBe(165);
      });

      it('should use custom buffer percentage', () => {
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill: createMockSkill({ estimatedHours: 100 }),
          },
        ];

        const config: TimeCalculationConfig = { bufferPercentage: 0.2 };
        const result = calculateRoadmapTime(modules, config);

        expect(result.totalModuleTimeHours).toBe(150);
        expect(result.bufferHours).toBe(30); // 150 * 0.2
        expect(result.totalEstimatedHours).toBe(180);
      });
    });

    describe('skipped modules excluded', () => {
      it('should exclude skipped modules from calculation', () => {
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill: createMockSkill({ id: 'skill-1', estimatedHours: 10 }),
          },
          {
            id: 'module-2',
            skillId: 'skill-2',
            isSkipped: true, // Skipped
            skill: createMockSkill({ id: 'skill-2', estimatedHours: 20 }),
          },
          {
            id: 'module-3',
            skillId: 'skill-3',
            isSkipped: false,
            skill: createMockSkill({ id: 'skill-3', estimatedHours: 30 }),
          },
          {
            id: 'module-4',
            skillId: 'skill-4',
            isSkipped: true, // Skipped
            skill: createMockSkill({ id: 'skill-4', estimatedHours: 15 }),
          },
        ];

        const result = calculateRoadmapTime(modules);

        // Only module-1 (10) and module-3 (30) are counted
        // Resource time: 10 + 30 = 40
        expect(result.totalResourceTimeHours).toBe(40);
        // Practice time: 5 + 15 = 20
        expect(result.totalPracticeTimeHours).toBe(20);
        // Module time: 15 + 45 = 60
        expect(result.totalModuleTimeHours).toBe(60);
        // Buffer: 60 * 0.1 = 6
        expect(result.bufferHours).toBe(6);
        // Total: 60 + 6 = 66
        expect(result.totalEstimatedHours).toBe(66);
        expect(result.roundedTotalHours).toBe(66);

        // All modules should be in breakdown
        expect(result.moduleBreakdown).toHaveLength(4);
        // But only 2 should contribute to totals
        const nonSkipped = result.moduleBreakdown.filter((m) => !m.isSkipped);
        expect(nonSkipped).toHaveLength(2);
      });
    });

    describe('rounding to nearest hour', () => {
      it('should round down when decimal is < 0.5', () => {
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill: createMockSkill({ estimatedHours: 10 }),
          },
        ];

        // This gives: 15 (module) + 1.5 (buffer) = 16.5
        // Should round to 17
        const result = calculateRoadmapTime(modules);
        expect(result.totalEstimatedHours).toBe(16.5);
        expect(result.roundedTotalHours).toBe(17);
      });

      it('should round up when decimal is >= 0.5', () => {
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill: createMockSkill({ estimatedHours: 10.4 }),
          },
        ];

        // Resource: 10.4, Practice: 5.2, Module: 15.6
        // Buffer: 1.56, Total: 17.16
        // Should round to 17
        const result = calculateRoadmapTime(modules);
        expect(result.totalEstimatedHours).toBeCloseTo(17.16, 2);
        expect(result.roundedTotalHours).toBe(17);
      });

      it('should round correctly for 15.6 hours', () => {
        // Create modules that sum to exactly 15.6 hours after buffer
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill: createMockSkill({ estimatedHours: 10.4 }),
          },
        ];

        const result = calculateRoadmapTime(modules);
        // Module: 10.4 + 5.2 = 15.6
        // Buffer: 1.56
        // Total: 17.16 -> rounds to 17
        expect(result.roundedTotalHours).toBe(17);
      });
    });

    describe('zero modules', () => {
      it('should return 0 for empty roadmap', () => {
        const result = calculateRoadmapTime([]);

        expect(result.totalResourceTimeHours).toBe(0);
        expect(result.totalPracticeTimeHours).toBe(0);
        expect(result.totalModuleTimeHours).toBe(0);
        expect(result.bufferHours).toBe(0);
        expect(result.totalEstimatedHours).toBe(0);
        expect(result.roundedTotalHours).toBe(0);
        expect(result.moduleBreakdown).toHaveLength(0);
      });

      it('should return 0 when all modules are skipped', () => {
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: true,
            skill: createMockSkill({ estimatedHours: 10 }),
          },
          {
            id: 'module-2',
            skillId: 'skill-2',
            isSkipped: true,
            skill: createMockSkill({ estimatedHours: 20 }),
          },
        ];

        const result = calculateRoadmapTime(modules);

        expect(result.totalResourceTimeHours).toBe(0);
        expect(result.totalPracticeTimeHours).toBe(0);
        expect(result.totalModuleTimeHours).toBe(0);
        expect(result.bufferHours).toBe(0);
        expect(result.totalEstimatedHours).toBe(0);
        expect(result.roundedTotalHours).toBe(0);
      });
    });

    describe('configurable practice ratio', () => {
      it('should use custom practice ratio', () => {
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill: createMockSkill({ estimatedHours: 10 }),
          },
        ];

        const config: TimeCalculationConfig = { practiceTimeRatio: 0.75 };
        const result = calculateRoadmapTime(modules, config);

        // Resource: 10
        expect(result.totalResourceTimeHours).toBe(10);
        // Practice: 10 * 0.75 = 7.5
        expect(result.totalPracticeTimeHours).toBe(7.5);
        // Module: 10 + 7.5 = 17.5
        expect(result.totalModuleTimeHours).toBe(17.5);
        // Buffer: 17.5 * 0.1 = 1.75
        expect(result.bufferHours).toBe(1.75);
        // Total: 17.5 + 1.75 = 19.25
        expect(result.totalEstimatedHours).toBe(19.25);
        // Rounded: 19
        expect(result.roundedTotalHours).toBe(19);
      });
    });

    describe('resources vs skill estimatedHours', () => {
      it('should prefer resources duration when available', () => {
        const skill = createMockSkill({ estimatedHours: 10 });
        const resources: Resource[] = [
          createMockResource({ durationMinutes: 180 }), // 3 hours
          createMockResource({ durationMinutes: 120 }), // 2 hours
        ];

        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill,
            resources,
          },
        ];

        const result = calculateRoadmapTime(modules);

        // Should use resources: (180 + 120) / 60 = 5 hours
        expect(result.totalResourceTimeHours).toBe(5);
        expect(result.totalPracticeTimeHours).toBe(2.5);
        expect(result.totalModuleTimeHours).toBe(7.5);
      });

      it('should fallback to skill estimatedHours when resources have no duration', () => {
        const skill = createMockSkill({ estimatedHours: 10 });
        const resources: Resource[] = [
          createMockResource({ durationMinutes: null }),
        ];

        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill,
            resources,
          },
        ];

        const result = calculateRoadmapTime(modules);

        // Should use skill.estimatedHours: 10
        expect(result.totalResourceTimeHours).toBe(10);
        expect(result.totalPracticeTimeHours).toBe(5);
        expect(result.totalModuleTimeHours).toBe(15);
      });
    });

    describe('module breakdown', () => {
      it('should include breakdown for all modules', () => {
        const modules = [
          {
            id: 'module-1',
            skillId: 'skill-1',
            isSkipped: false,
            skill: createMockSkill({ id: 'skill-1', estimatedHours: 10 }),
          },
          {
            id: 'module-2',
            skillId: 'skill-2',
            isSkipped: true,
            skill: createMockSkill({ id: 'skill-2', estimatedHours: 20 }),
          },
        ];

        const result = calculateRoadmapTime(modules);

        expect(result.moduleBreakdown).toHaveLength(2);
        expect(result.moduleBreakdown[0]).toMatchObject({
          moduleId: 'module-1',
          skillId: 'skill-1',
          resourceTimeHours: 10,
          practiceTimeHours: 5,
          moduleTimeHours: 15,
          isSkipped: false,
        });
        expect(result.moduleBreakdown[1]).toMatchObject({
          moduleId: 'module-2',
          skillId: 'skill-2',
          resourceTimeHours: 20,
          practiceTimeHours: 10,
          moduleTimeHours: 30,
          isSkipped: true,
        });
      });
    });
  });
});

