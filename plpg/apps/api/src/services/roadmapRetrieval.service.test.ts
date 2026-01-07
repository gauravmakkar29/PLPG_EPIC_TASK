import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRoadmap } from './roadmapRetrieval.service.js';
import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '@plpg/shared/errors';

// Mock prisma client
vi.mock('../lib/prisma.js', () => ({
  prisma: {
    roadmap: {
      findFirst: vi.fn(),
    },
    onboardingState: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Roadmap Retrieval Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return active roadmap', async () => {
    const userId = 'user-1';
    const mockRoadmap = {
      id: 'roadmap-1',
      userId,
      title: 'Test Roadmap',
      description: 'Test Description',
      sourceRole: 'software_engineer',
      targetRole: 'ml_engineer',
      totalEstimatedHours: 100,
      completedHours: 20,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          id: 'module-1',
          skillId: 'skill-1',
          phase: 'foundation',
          sequenceOrder: 1,
          isLocked: false,
          isSkipped: false,
          skill: {
            id: 'skill-1',
            name: 'Python Basics',
            slug: 'python-basics',
            description: 'Learn Python',
            phase: 'foundation',
            estimatedHours: 20,
            resources: [
              {
                id: 'resource-1',
                title: 'Python Tutorial',
                url: 'https://example.com',
                type: 'video',
                provider: 'YouTube',
                durationMinutes: 120,
                isFree: true,
                quality: 5,
              },
            ],
          },
          progress: [
            {
              status: 'completed',
              startedAt: new Date(),
              completedAt: new Date(),
              timeSpentMinutes: 120,
            },
          ],
        },
      ],
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(mockRoadmap as any);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue({
      weeklyHours: 10,
    } as any);

    const result = await getRoadmap(userId);

    expect(result.id).toBe('roadmap-1');
    expect(result.phases).toHaveLength(1);
    expect(result.phases[0].phase).toBe('foundation');
    expect(result.phases[0].modules).toHaveLength(1);
    expect(result.progress.totalModules).toBe(1);
    expect(result.progress.completedModules).toBe(1);
  });

  it('should include all phases, modules, and resources', async () => {
    const userId = 'user-1';
    const mockRoadmap = {
      id: 'roadmap-1',
      userId,
      title: 'Test Roadmap',
      description: 'Test Description',
      sourceRole: 'software_engineer',
      targetRole: 'ml_engineer',
      totalEstimatedHours: 100,
      completedHours: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          id: 'module-1',
          skillId: 'skill-1',
          phase: 'foundation',
          sequenceOrder: 1,
          isLocked: false,
          isSkipped: false,
          skill: {
            id: 'skill-1',
            name: 'Python Basics',
            slug: 'python-basics',
            description: 'Learn Python',
            phase: 'foundation',
            estimatedHours: 20,
            resources: [
              {
                id: 'resource-1',
                title: 'Python Tutorial',
                url: 'https://example.com',
                type: 'video',
                provider: 'YouTube',
                durationMinutes: 120,
                isFree: true,
                quality: 5,
              },
            ],
          },
          progress: [],
        },
        {
          id: 'module-2',
          skillId: 'skill-2',
          phase: 'intermediate',
          sequenceOrder: 2,
          isLocked: true,
          isSkipped: false,
          skill: {
            id: 'skill-2',
            name: 'ML Fundamentals',
            slug: 'ml-fundamentals',
            description: 'Learn ML',
            phase: 'intermediate',
            estimatedHours: 30,
            resources: [
              {
                id: 'resource-2',
                title: 'ML Course',
                url: 'https://example.com/ml',
                type: 'course',
                provider: 'Coursera',
                durationMinutes: 300,
                isFree: false,
                quality: 4,
              },
            ],
          },
          progress: [],
        },
      ],
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(mockRoadmap as any);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue({
      weeklyHours: 10,
    } as any);

    const result = await getRoadmap(userId);

    expect(result.phases).toHaveLength(2);
    expect(result.phases[0].phase).toBe('foundation');
    expect(result.phases[1].phase).toBe('intermediate');
    expect(result.phases[0].modules[0].skill.resources).toHaveLength(1);
    expect(result.phases[1].modules[0].skill.resources).toHaveLength(1);
  });

  it('should include current progress data', async () => {
    const userId = 'user-1';
    const mockRoadmap = {
      id: 'roadmap-1',
      userId,
      title: 'Test Roadmap',
      description: 'Test Description',
      sourceRole: 'software_engineer',
      targetRole: 'ml_engineer',
      totalEstimatedHours: 100,
      completedHours: 20,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          id: 'module-1',
          skillId: 'skill-1',
          phase: 'foundation',
          sequenceOrder: 1,
          isLocked: false,
          isSkipped: false,
          skill: {
            id: 'skill-1',
            name: 'Python Basics',
            slug: 'python-basics',
            description: 'Learn Python',
            phase: 'foundation',
            estimatedHours: 20,
            resources: [],
          },
          progress: [
            {
              status: 'completed',
              startedAt: new Date(),
              completedAt: new Date(),
              timeSpentMinutes: 120,
            },
          ],
        },
        {
          id: 'module-2',
          skillId: 'skill-2',
          phase: 'foundation',
          sequenceOrder: 2,
          isLocked: false,
          isSkipped: false,
          skill: {
            id: 'skill-2',
            name: 'SQL',
            slug: 'sql',
            description: 'Learn SQL',
            phase: 'foundation',
            estimatedHours: 30,
            resources: [],
          },
          progress: [
            {
              status: 'in_progress',
              startedAt: new Date(),
              completedAt: null,
              timeSpentMinutes: 60,
            },
          ],
        },
        {
          id: 'module-3',
          skillId: 'skill-3',
          phase: 'foundation',
          sequenceOrder: 3,
          isLocked: false,
          isSkipped: true,
          skill: {
            id: 'skill-3',
            name: 'Git',
            slug: 'git',
            description: 'Learn Git',
            phase: 'foundation',
            estimatedHours: 10,
            resources: [],
          },
          progress: [
            {
              status: 'skipped',
              startedAt: null,
              completedAt: null,
              timeSpentMinutes: 0,
            },
          ],
        },
      ],
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(mockRoadmap as any);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue({
      weeklyHours: 10,
    } as any);

    const result = await getRoadmap(userId);

    expect(result.progress.totalModules).toBe(3);
    expect(result.progress.completedModules).toBe(1);
    expect(result.progress.inProgressModules).toBe(1);
    expect(result.progress.skippedModules).toBe(1);
    expect(result.progress.notStartedModules).toBe(0);
    expect(result.progress.completionPercentage).toBe(33); // 1/3 = 33%
    expect(result.progress.completedHours).toBe(20);
    expect(result.progress.remainingHours).toBe(80);
  });

  it('should include timeline projections', async () => {
    const userId = 'user-1';
    const mockRoadmap = {
      id: 'roadmap-1',
      userId,
      title: 'Test Roadmap',
      description: 'Test Description',
      sourceRole: 'software_engineer',
      targetRole: 'ml_engineer',
      totalEstimatedHours: 100,
      completedHours: 20,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [],
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(mockRoadmap as any);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue({
      weeklyHours: 10,
    } as any);

    const result = await getRoadmap(userId);

    expect(result.timeline.totalHours).toBe(100);
    expect(result.timeline.completedHours).toBe(20);
    expect(result.timeline.remainingHours).toBe(80);
    expect(result.timeline.weeklyHours).toBe(10);
    expect(result.timeline.projectedCompletion).toBeInstanceOf(Date);
    // 80 hours / 10 hours per week = 8 weeks
    const expectedWeeks = Math.ceil(80 / 10);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + expectedWeeks * 7);
    const diffDays = Math.abs(
      (result.timeline.projectedCompletion.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBeLessThan(1);
  });

  it('should throw NotFoundError if no roadmap exists', async () => {
    const userId = 'user-1';

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);

    await expect(getRoadmap(userId)).rejects.toThrow(NotFoundError);
    await expect(getRoadmap(userId)).rejects.toThrow('No active roadmap found');
  });

  it('should only return roadmap for authenticated user', async () => {
    const userId = 'user-1';
    const otherUserId = 'user-2';
    const mockRoadmap = {
      id: 'roadmap-1',
      userId, // This roadmap belongs to user-1
      title: 'Test Roadmap',
      description: 'Test Description',
      sourceRole: 'software_engineer',
      targetRole: 'ml_engineer',
      totalEstimatedHours: 100,
      completedHours: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [],
    };

    vi.mocked(prisma.roadmap.findFirst).mockImplementation((args: any) => {
      if (args.where.userId === userId) {
        return Promise.resolve(mockRoadmap as any);
      }
      return Promise.resolve(null);
    });
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue({
      weeklyHours: 10,
    } as any);

    const result = await getRoadmap(userId);
    expect(result.id).toBe('roadmap-1');

    // Other user should not get this roadmap
    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);
    await expect(getRoadmap(otherUserId)).rejects.toThrow(NotFoundError);
  });

  it('should use eager loading to avoid N+1 queries', async () => {
    const userId = 'user-1';
    const mockRoadmap = {
      id: 'roadmap-1',
      userId,
      title: 'Test Roadmap',
      description: 'Test Description',
      sourceRole: 'software_engineer',
      targetRole: 'ml_engineer',
      totalEstimatedHours: 100,
      completedHours: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          id: 'module-1',
          skillId: 'skill-1',
          phase: 'foundation',
          sequenceOrder: 1,
          isLocked: false,
          isSkipped: false,
          skill: {
            id: 'skill-1',
            name: 'Python Basics',
            slug: 'python-basics',
            description: 'Learn Python',
            phase: 'foundation',
            estimatedHours: 20,
            resources: [
              {
                id: 'resource-1',
                title: 'Python Tutorial',
                url: 'https://example.com',
                type: 'video',
                provider: 'YouTube',
                durationMinutes: 120,
                isFree: true,
                quality: 5,
              },
            ],
          },
          progress: [],
        },
      ],
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(mockRoadmap as any);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue({
      weeklyHours: 10,
    } as any);

    await getRoadmap(userId);

    // Verify that findFirst was called with include for eager loading
    expect(prisma.roadmap.findFirst).toHaveBeenCalledWith({
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
                    quality: 'desc',
                  },
                },
              },
            },
            progress: {
              where: {
                userId,
              },
              take: 1,
            },
          },
          orderBy: {
            sequenceOrder: 'asc',
          },
        },
      },
    });
  });

  it('should return only active roadmap when multiple exist', async () => {
    const userId = 'user-1';
    const activeRoadmap = {
      id: 'roadmap-active',
      userId,
      title: 'Active Roadmap',
      description: 'Active Description',
      sourceRole: 'software_engineer',
      targetRole: 'ml_engineer',
      totalEstimatedHours: 100,
      completedHours: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [],
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(activeRoadmap as any);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue({
      weeklyHours: 10,
    } as any);

    const result = await getRoadmap(userId);

    expect(result.id).toBe('roadmap-active');
    expect(prisma.roadmap.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId,
          isActive: true,
        },
      })
    );
  });

  it('should sort phases in correct order', async () => {
    const userId = 'user-1';
    const mockRoadmap = {
      id: 'roadmap-1',
      userId,
      title: 'Test Roadmap',
      description: 'Test Description',
      sourceRole: 'software_engineer',
      targetRole: 'ml_engineer',
      totalEstimatedHours: 100,
      completedHours: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          id: 'module-1',
          skillId: 'skill-1',
          phase: 'advanced',
          sequenceOrder: 3,
          isLocked: false,
          isSkipped: false,
          skill: {
            id: 'skill-1',
            name: 'Advanced Skill',
            slug: 'advanced-skill',
            description: 'Advanced',
            phase: 'advanced',
            estimatedHours: 20,
            resources: [],
          },
          progress: [],
        },
        {
          id: 'module-2',
          skillId: 'skill-2',
          phase: 'foundation',
          sequenceOrder: 1,
          isLocked: false,
          isSkipped: false,
          skill: {
            id: 'skill-2',
            name: 'Foundation Skill',
            slug: 'foundation-skill',
            description: 'Foundation',
            phase: 'foundation',
            estimatedHours: 20,
            resources: [],
          },
          progress: [],
        },
        {
          id: 'module-3',
          skillId: 'skill-3',
          phase: 'intermediate',
          sequenceOrder: 2,
          isLocked: false,
          isSkipped: false,
          skill: {
            id: 'skill-3',
            name: 'Intermediate Skill',
            slug: 'intermediate-skill',
            description: 'Intermediate',
            phase: 'intermediate',
            estimatedHours: 20,
            resources: [],
          },
          progress: [],
        },
      ],
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(mockRoadmap as any);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue({
      weeklyHours: 10,
    } as any);

    const result = await getRoadmap(userId);

    expect(result.phases).toHaveLength(3);
    expect(result.phases[0].phase).toBe('foundation');
    expect(result.phases[1].phase).toBe('intermediate');
    expect(result.phases[2].phase).toBe('advanced');
  });
});

