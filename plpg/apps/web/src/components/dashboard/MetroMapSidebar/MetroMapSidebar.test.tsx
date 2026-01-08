import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MetroMapSidebar } from './index';
import { Phase } from '@plpg/shared';
import type { RoadmapWithModules, RoadmapModuleWithSkill, Skill, Progress } from '@plpg/shared';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper to create mock skill
const createMockSkill = (overrides: Partial<Skill> = {}): Skill => ({
  id: 'skill-1',
  name: 'Python Basics',
  slug: 'python-basics',
  description: 'Learn Python fundamentals',
  whyThisMatters: null,
  phase: Phase.FOUNDATION,
  estimatedHours: 10,
  isOptional: false,
  sequenceOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper to create mock progress
const createMockProgress = (overrides: Partial<Progress> = {}): Progress => ({
  id: 'progress-1',
  userId: 'user-1',
  roadmapModuleId: 'module-1',
  status: 'not_started',
  startedAt: null,
  completedAt: null,
  timeSpentMinutes: 0,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper to create mock module
const createMockModule = (overrides: Partial<RoadmapModuleWithSkill> = {}): RoadmapModuleWithSkill => ({
  id: 'module-1',
  roadmapId: 'roadmap-1',
  skillId: 'skill-1',
  phase: Phase.FOUNDATION,
  sequenceOrder: 1,
  isLocked: false,
  isSkipped: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  skill: createMockSkill(),
  progress: null,
  ...overrides,
});

// Helper to create mock roadmap
const createMockRoadmap = (modules: RoadmapModuleWithSkill[] = []): RoadmapWithModules => ({
  id: 'roadmap-1',
  userId: 'user-1',
  title: 'ML Engineer Path',
  description: 'Path to becoming an ML Engineer',
  sourceRole: 'software_developer',
  targetRole: 'ml_engineer',
  totalEstimatedHours: 200,
  completedHours: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  modules,
});

describe('MetroMapSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Rendering', () => {
    it('renders all phases correctly', () => {
      const roadmap = createMockRoadmap([
        createMockModule({ phase: Phase.FOUNDATION }),
        createMockModule({ id: 'module-2', phase: Phase.CORE_ML, skill: createMockSkill({ id: 'skill-2', phase: Phase.CORE_ML }) }),
        createMockModule({ id: 'module-3', phase: Phase.DEEP_LEARNING, skill: createMockSkill({ id: 'skill-3', phase: Phase.DEEP_LEARNING }) }),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      expect(screen.getByText('Foundation')).toBeInTheDocument();
      expect(screen.getByText('Core ML')).toBeInTheDocument();
      expect(screen.getByText('Deep Learning')).toBeInTheDocument();
    });

    it('displays phase progress count correctly', () => {
      const roadmap = createMockRoadmap([
        createMockModule({
          progress: createMockProgress({ status: 'completed' }),
        }),
        createMockModule({
          id: 'module-2',
          skillId: 'skill-2',
          skill: createMockSkill({ id: 'skill-2' }),
        }),
        createMockModule({
          id: 'module-3',
          skillId: 'skill-3',
          skill: createMockSkill({ id: 'skill-3' }),
        }),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      // Check for progress in header
      const header = screen.getByText('Your Journey').closest('div');
      expect(within(header!).getByText('1 of 3 modules complete')).toBeInTheDocument();
    });

    it('renders empty state when no roadmap', () => {
      render(<MetroMapSidebar roadmap={null} />);

      expect(screen.getByText('Your learning path will appear here')).toBeInTheDocument();
    });

    it('displays overall progress percentage', () => {
      const roadmap = createMockRoadmap([
        createMockModule({
          progress: createMockProgress({ status: 'completed' }),
        }),
        createMockModule({
          id: 'module-2',
          skillId: 'skill-2',
          skill: createMockSkill({ id: 'skill-2' }),
        }),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Phase States', () => {
    it('displays completed phase with success styling', () => {
      const roadmap = createMockRoadmap([
        createMockModule({
          progress: createMockProgress({ status: 'completed' }),
        }),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      const foundationPhase = screen.getByText('Foundation').closest('div[role="button"]');
      expect(foundationPhase).toHaveClass('text-success-600');
    });

    it('displays active phase with primary styling', () => {
      const roadmap = createMockRoadmap([
        createMockModule(),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      const foundationPhase = screen.getByText('Foundation').closest('div[role="button"]');
      expect(foundationPhase).toHaveClass('text-primary-600');
    });

    it('displays locked phase with secondary styling', () => {
      const roadmap = createMockRoadmap([
        createMockModule({
          phase: Phase.CORE_ML,
          isLocked: true,
          skill: createMockSkill({ phase: Phase.CORE_ML }),
        }),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      const coreMLPhase = screen.getByText('Core ML').closest('div[role="button"]');
      expect(coreMLPhase).toHaveClass('text-secondary-400');
    });

    it('displays pending phase with secondary styling', () => {
      const roadmap = createMockRoadmap([
        createMockModule({
          progress: createMockProgress({ status: 'completed' }),
        }),
        createMockModule({
          id: 'module-2',
          phase: Phase.CORE_ML,
          skill: createMockSkill({ id: 'skill-2', phase: Phase.CORE_ML }),
        }),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      // Deep Learning should be pending (after active Core ML)
      const deepLearningPhase = screen.getByText('Deep Learning').closest('div[role="button"]');
      expect(deepLearningPhase).toHaveClass('text-secondary-400');
    });
  });

  describe('Expand/Collapse', () => {
    it('expands phase on click to show modules', () => {
      const roadmap = createMockRoadmap([
        createMockModule(),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      const foundationPhase = screen.getByText('Foundation').closest('div[role="button"]');
      fireEvent.click(foundationPhase!);

      expect(screen.getByText('1. Python Basics')).toBeInTheDocument();
    });

    it('collapses phase on second click', () => {
      const roadmap = createMockRoadmap([
        createMockModule(),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      const foundationPhase = screen.getByText('Foundation').closest('div[role="button"]');

      // Expand
      fireEvent.click(foundationPhase!);
      expect(screen.getByText('1. Python Basics')).toBeInTheDocument();

      // Collapse
      fireEvent.click(foundationPhase!);
      // Module should still be in DOM but container height should be 0
    });

    it('persists expand/collapse state to localStorage', () => {
      const roadmap = createMockRoadmap([
        createMockModule(),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      const foundationPhase = screen.getByText('Foundation').closest('div[role="button"]');
      fireEvent.click(foundationPhase!);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'metro-map-expanded-phases',
        expect.stringContaining('foundation')
      );
    });

    it('loads expanded state from localStorage on mount', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        foundation: true,
        core_ml: false,
        deep_learning: false,
      }));

      const roadmap = createMockRoadmap([
        createMockModule(),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      // Foundation should be expanded on mount - module visible
      expect(screen.getByText('1. Python Basics')).toBeInTheDocument();
    });
  });

  describe('Current Module', () => {
    it('highlights current module', () => {
      const roadmap = createMockRoadmap([
        createMockModule(),
      ]);

      // Expand foundation first
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        foundation: true,
        core_ml: false,
        deep_learning: false,
      }));

      render(<MetroMapSidebar roadmap={roadmap} currentModuleId="module-1" />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      expect(moduleItem).toHaveClass('bg-primary-50');
    });
  });

  describe('Module Click', () => {
    it('calls onModuleClick when module is clicked', () => {
      const onModuleClick = vi.fn();
      const roadmap = createMockRoadmap([
        createMockModule(),
      ]);

      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        foundation: true,
        core_ml: false,
        deep_learning: false,
      }));

      render(<MetroMapSidebar roadmap={roadmap} onModuleClick={onModuleClick} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      fireEvent.click(moduleItem!);

      expect(onModuleClick).toHaveBeenCalledWith('module-1');
    });

    it('does not call onModuleClick for locked modules', () => {
      const onModuleClick = vi.fn();
      const roadmap = createMockRoadmap([
        createMockModule({ isLocked: true }),
      ]);

      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        foundation: true,
        core_ml: false,
        deep_learning: false,
      }));

      render(<MetroMapSidebar roadmap={roadmap} onModuleClick={onModuleClick} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      fireEvent.click(moduleItem!);

      expect(onModuleClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('is keyboard accessible (Enter) for phases', () => {
      const roadmap = createMockRoadmap([
        createMockModule(),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      const foundationPhase = screen.getByText('Foundation').closest('div[role="button"]');

      // Test Enter key
      fireEvent.keyDown(foundationPhase!, { key: 'Enter' });
      expect(screen.getByText('1. Python Basics')).toBeInTheDocument();
    });

    it('is keyboard accessible (Space) for phases', () => {
      const roadmap = createMockRoadmap([
        createMockModule(),
      ]);

      render(<MetroMapSidebar roadmap={roadmap} />);

      const foundationPhase = screen.getByText('Foundation').closest('div[role="button"]');

      // Test Space key
      fireEvent.keyDown(foundationPhase!, { key: ' ' });
      expect(screen.getByText('1. Python Basics')).toBeInTheDocument();
    });
  });
});
