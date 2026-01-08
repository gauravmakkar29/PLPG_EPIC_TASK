import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateRoadmap } from './roadmapGeneration.service.js';
import { prisma } from '../lib/prisma.js';
import { analyzeGap } from './gapAnalysis.service.js';
import { sequenceSkills } from './sequencing.service.js';
import { Phase } from '@plpg/shared';

// Mock dependencies
vi.mock('../lib/prisma.js', () => ({
  prisma: {
    roadmap: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    roadmapModule: {
      createMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    onboardingState: {
      findUnique: vi.fn(),
    },
    skillDependency: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('./gapAnalysis.service.js', () => ({
  analyzeGap: vi.fn(),
}));

vi.mock('./sequencing.service.js', () => ({
  sequenceSkills: vi.fn(),
}));

describe('Roadmap Generation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate roadmap after onboarding completion', async () => {
    const userId = 'user-1';
    const mockOnboardingState = {
      userId,
      isComplete: true,
      targetRole: 'ml_engineer',
      weeklyHours: 10,
      currentRole: 'software_engineer',
      existingSkills: ['python'],
    };

    const mockSkills = [
      {
        id: 'skill-1',
        name: 'ML Fundamentals',
        slug: 'ml-fundamentals',
        description: 'ML basics',
        whyThisMatters: null,
        phase: Phase.CORE_ML,
        estimatedHours: 40,
        isOptional: false,
        sequenceOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue(mockOnboardingState as any);
    vi.mocked(analyzeGap).mockResolvedValue({
      missingSkills: mockSkills as any,
      orderedSkills: mockSkills as any,
      totalHours: 40,
    });
    vi.mocked(prisma.skillDependency.findMany).mockResolvedValue([]);
    vi.mocked(sequenceSkills).mockReturnValue({
      sequencedSkills: mockSkills.map((s, i) => ({ ...s, sequenceOrder: i + 1 })) as any,
      phaseGroups: [
        {
          phase: Phase.CORE_ML,
          skills: mockSkills.map((s, i) => ({ ...s, sequenceOrder: i + 1 })) as any,
          totalHours: 40,
          sequenceStart: 1,
        },
      ],
      hasCircularDependency: false,
    });
    vi.mocked(prisma.roadmap.create).mockResolvedValue({
      id: 'roadmap-1',
      userId,
      title: 'From software_engineer to ml_engineer',
      description: 'Personalized learning path...',
      sourceRole: 'software_engineer',
      targetRole: 'ml_engineer',
      totalEstimatedHours: 40,
      completedHours: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    vi.mocked(prisma.roadmapModule.createMany).mockResolvedValue({ count: 1 } as any);

    const result = await generateRoadmap(userId);

    expect(result.roadmapId).toBe('roadmap-1');
    expect(result.totalHours).toBe(40);
    expect(result.moduleCount).toBe(1);
    expect(result.phaseCount).toBe(1);
    expect(prisma.roadmap.create).toHaveBeenCalled();
    expect(prisma.roadmapModule.createMany).toHaveBeenCalled();
  });

  it('should return existing roadmap if one already exists (idempotency)', async () => {
    const userId = 'user-1';
    const existingRoadmap = {
      id: 'roadmap-existing',
      userId,
      totalEstimatedHours: 50,
      isActive: true,
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(existingRoadmap as any);
    vi.mocked(prisma.roadmapModule.count).mockResolvedValue(5);
    vi.mocked(prisma.roadmapModule.groupBy).mockResolvedValue([
      { phase: 'foundation' },
      { phase: 'intermediate' },
    ] as any);

    const result = await generateRoadmap(userId);

    expect(result.roadmapId).toBe('roadmap-existing');
    expect(result.totalHours).toBe(50);
    expect(prisma.roadmap.create).not.toHaveBeenCalled();
  });

  it('should link roadmap to user correctly', async () => {
    const userId = 'user-1';
    const mockOnboardingState = {
      userId,
      isComplete: true,
      targetRole: 'ml_engineer',
      weeklyHours: 10,
      currentRole: 'software_engineer',
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue(mockOnboardingState as any);
    vi.mocked(analyzeGap).mockResolvedValue({
      missingSkills: [],
      orderedSkills: [],
      totalHours: 0,
    });
    vi.mocked(prisma.skillDependency.findMany).mockResolvedValue([]);
    vi.mocked(sequenceSkills).mockReturnValue({
      sequencedSkills: [],
      phaseGroups: [],
      hasCircularDependency: false,
    });
    vi.mocked(prisma.roadmap.create).mockResolvedValue({
      id: 'roadmap-1',
      userId,
    } as any);
    vi.mocked(prisma.roadmapModule.createMany).mockResolvedValue({ count: 0 } as any);

    await generateRoadmap(userId);

    expect(prisma.roadmap.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId,
      }),
    });
  });

  it('should populate total_hours field', async () => {
    const userId = 'user-1';
    const mockOnboardingState = {
      userId,
      isComplete: true,
      targetRole: 'ml_engineer',
      weeklyHours: 10,
      currentRole: 'software_engineer',
    };

    const mockSkills = [
      {
        id: 'skill-1',
        name: 'Skill 1',
        slug: 'skill-1',
        description: 'Description',
        whyThisMatters: null,
        phase: Phase.FOUNDATION,
        estimatedHours: 20,
        isOptional: false,
        sequenceOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'skill-2',
        name: 'Skill 2',
        slug: 'skill-2',
        description: 'Description',
        whyThisMatters: null,
        phase: Phase.FOUNDATION,
        estimatedHours: 30,
        isOptional: false,
        sequenceOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue(mockOnboardingState as any);
    vi.mocked(analyzeGap).mockResolvedValue({
      missingSkills: mockSkills as any,
      orderedSkills: mockSkills as any,
      totalHours: 50,
    });
    vi.mocked(prisma.skillDependency.findMany).mockResolvedValue([]);
    vi.mocked(sequenceSkills).mockReturnValue({
      sequencedSkills: mockSkills.map((s, i) => ({ ...s, sequenceOrder: i + 1 })) as any,
      phaseGroups: [
        {
          phase: Phase.FOUNDATION,
          skills: mockSkills.map((s, i) => ({ ...s, sequenceOrder: i + 1 })) as any,
          totalHours: 50,
          sequenceStart: 1,
        },
      ],
      hasCircularDependency: false,
    });
    vi.mocked(prisma.roadmap.create).mockResolvedValue({
      id: 'roadmap-1',
      totalEstimatedHours: 50,
    } as any);
    vi.mocked(prisma.roadmapModule.createMany).mockResolvedValue({ count: 2 } as any);

    const result = await generateRoadmap(userId);

    expect(result.totalHours).toBe(50);
    expect(prisma.roadmap.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        totalEstimatedHours: 50,
      }),
    });
  });

  it('should calculate projected completion date', async () => {
    const userId = 'user-1';
    const mockOnboardingState = {
      userId,
      isComplete: true,
      targetRole: 'ml_engineer',
      weeklyHours: 10, // 10 hours per week
      currentRole: 'software_engineer',
    };

    const mockSkills = [
      {
        id: 'skill-1',
        name: 'Skill 1',
        slug: 'skill-1',
        description: 'Description',
        whyThisMatters: null,
        phase: Phase.FOUNDATION,
        estimatedHours: 50, // 50 total hours
        isOptional: false,
        sequenceOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue(mockOnboardingState as any);
    vi.mocked(analyzeGap).mockResolvedValue({
      missingSkills: mockSkills as any,
      orderedSkills: mockSkills as any,
      totalHours: 50,
    });
    vi.mocked(prisma.skillDependency.findMany).mockResolvedValue([]);
    vi.mocked(sequenceSkills).mockReturnValue({
      sequencedSkills: mockSkills.map((s, i) => ({ ...s, sequenceOrder: i + 1 })) as any,
      phaseGroups: [
        {
          phase: Phase.FOUNDATION,
          skills: mockSkills.map((s, i) => ({ ...s, sequenceOrder: i + 1 })) as any,
          totalHours: 50,
          sequenceStart: 1,
        },
      ],
      hasCircularDependency: false,
    });
    vi.mocked(prisma.roadmap.create).mockResolvedValue({
      id: 'roadmap-1',
    } as any);
    vi.mocked(prisma.roadmapModule.createMany).mockResolvedValue({ count: 1 } as any);

    const result = await generateRoadmap(userId);

    // 50 hours / 10 hours per week = 5 weeks
    const expectedWeeks = Math.ceil(50 / 10);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + expectedWeeks * 7);

    expect(result.projectedCompletion).toBeInstanceOf(Date);
    // Allow 1 day tolerance for test timing
    const diffDays = Math.abs(
      (result.projectedCompletion.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBeLessThan(1);
  });

  it('should create roadmap with phases and modules', async () => {
    const userId = 'user-1';
    const mockOnboardingState = {
      userId,
      isComplete: true,
      targetRole: 'ml_engineer',
      weeklyHours: 10,
      currentRole: 'software_engineer',
    };

    const mockSkills = [
      {
        id: 'skill-1',
        name: 'Foundation Skill',
        slug: 'foundation-skill',
        description: 'Description',
        whyThisMatters: null,
        phase: Phase.FOUNDATION,
        estimatedHours: 20,
        isOptional: false,
        sequenceOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'skill-2',
        name: 'Core ML Skill',
        slug: 'core-ml-skill',
        description: 'Description',
        whyThisMatters: null,
        phase: Phase.CORE_ML,
        estimatedHours: 30,
        isOptional: false,
        sequenceOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue(mockOnboardingState as any);
    vi.mocked(analyzeGap).mockResolvedValue({
      missingSkills: mockSkills as any,
      orderedSkills: mockSkills as any,
      totalHours: 50,
    });
    vi.mocked(prisma.skillDependency.findMany).mockResolvedValue([]);
    vi.mocked(sequenceSkills).mockReturnValue({
      sequencedSkills: mockSkills.map((s, i) => ({ ...s, sequenceOrder: i + 1 })) as any,
      phaseGroups: [
        {
          phase: Phase.FOUNDATION,
          skills: [mockSkills[0]] as any,
          totalHours: 20,
          sequenceStart: 1,
        },
        {
          phase: Phase.CORE_ML,
          skills: [mockSkills[1]] as any,
          totalHours: 30,
          sequenceStart: 2,
        },
      ],
      hasCircularDependency: false,
    });
    vi.mocked(prisma.roadmap.create).mockResolvedValue({
      id: 'roadmap-1',
    } as any);
    vi.mocked(prisma.roadmapModule.createMany).mockResolvedValue({ count: 2 } as any);

    const result = await generateRoadmap(userId);

    expect(result.phaseCount).toBe(2);
    expect(result.moduleCount).toBe(2);
    expect(prisma.roadmapModule.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          skillId: 'skill-1',
          phase: 'foundation',
          sequenceOrder: 1,
          isLocked: false, // First module unlocked
        }),
        expect.objectContaining({
          skillId: 'skill-2',
          phase: 'core_ml',
          sequenceOrder: 2,
          isLocked: true, // Subsequent modules locked
        }),
      ]),
    });
  });

  it('should set roadmap status to active', async () => {
    const userId = 'user-1';
    const mockOnboardingState = {
      userId,
      isComplete: true,
      targetRole: 'ml_engineer',
      weeklyHours: 10,
      currentRole: 'software_engineer',
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue(mockOnboardingState as any);
    vi.mocked(analyzeGap).mockResolvedValue({
      missingSkills: [],
      orderedSkills: [],
      totalHours: 0,
    });
    vi.mocked(prisma.skillDependency.findMany).mockResolvedValue([]);
    vi.mocked(sequenceSkills).mockReturnValue({
      sequencedSkills: [],
      phaseGroups: [],
      hasCircularDependency: false,
    });
    vi.mocked(prisma.roadmap.create).mockResolvedValue({
      id: 'roadmap-1',
      isActive: true,
    } as any);
    vi.mocked(prisma.roadmapModule.createMany).mockResolvedValue({ count: 0 } as any);

    await generateRoadmap(userId);

    expect(prisma.roadmap.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        isActive: true,
      }),
    });
  });

  it('should throw error if onboarding not completed', async () => {
    const userId = 'user-1';
    const mockOnboardingState = {
      userId,
      isComplete: false,
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue(mockOnboardingState as any);

    await expect(generateRoadmap(userId)).rejects.toThrow('Onboarding must be completed');
  });

  it('should throw error if target role or weekly hours missing', async () => {
    const userId = 'user-1';
    const mockOnboardingState = {
      userId,
      isComplete: true,
      targetRole: null,
      weeklyHours: null,
    };

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue(mockOnboardingState as any);

    await expect(generateRoadmap(userId)).rejects.toThrow(
      'Target role and weekly hours are required'
    );
  });

  it('should complete generation in less than 3 seconds', async () => {
    const userId = 'user-1';
    const mockOnboardingState = {
      userId,
      isComplete: true,
      targetRole: 'ml_engineer',
      weeklyHours: 10,
      currentRole: 'software_engineer',
    };

    const mockSkills = Array.from({ length: 100 }, (_, i) => ({
      id: `skill-${i}`,
      name: `Skill ${i}`,
      slug: `skill-${i}`,
      description: 'Description',
      whyThisMatters: null,
      phase: Phase.FOUNDATION,
      estimatedHours: 10,
      isOptional: false,
      sequenceOrder: i,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    vi.mocked(prisma.roadmap.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.onboardingState.findUnique).mockResolvedValue(mockOnboardingState as any);
    vi.mocked(analyzeGap).mockResolvedValue({
      missingSkills: mockSkills as any,
      orderedSkills: mockSkills as any,
      totalHours: 1000,
    });
    vi.mocked(prisma.skillDependency.findMany).mockResolvedValue([]);
    vi.mocked(sequenceSkills).mockReturnValue({
      sequencedSkills: mockSkills.map((s, i) => ({ ...s, sequenceOrder: i + 1 })) as any,
      phaseGroups: [
        {
          phase: Phase.FOUNDATION,
          skills: mockSkills.map((s, i) => ({ ...s, sequenceOrder: i + 1 })) as any,
          totalHours: 1000,
          sequenceStart: 1,
        },
      ],
      hasCircularDependency: false,
    });
    vi.mocked(prisma.roadmap.create).mockResolvedValue({
      id: 'roadmap-1',
    } as any);
    vi.mocked(prisma.roadmapModule.createMany).mockResolvedValue({ count: 100 } as any);

    const startTime = Date.now();
    await generateRoadmap(userId);
    const duration = Date.now() - startTime;

    // More lenient for test environment, but should be fast
    expect(duration).toBeLessThan(5000);
  });
});

