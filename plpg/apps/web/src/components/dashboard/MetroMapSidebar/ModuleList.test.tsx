import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleList } from './ModuleList';
import { Phase } from '@plpg/shared';
import type { RoadmapModuleWithSkill, Skill, Progress } from '@plpg/shared';

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

describe('ModuleList', () => {
  const defaultProps = {
    modules: [createMockModule()],
    isExpanded: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders module list when expanded', () => {
      render(<ModuleList {...defaultProps} />);

      expect(screen.getByText('1. Python Basics')).toBeInTheDocument();
    });

    it('hides module list when collapsed via height 0', () => {
      render(<ModuleList {...defaultProps} isExpanded={false} />);

      // The content should be hidden via height: 0
      const container = screen.getByText('1. Python Basics').closest('div[class*="overflow-hidden"]');
      expect(container).toHaveStyle({ height: '0px' });
    });

    it('renders multiple modules with correct numbering', () => {
      const modules = [
        createMockModule({ skill: createMockSkill({ name: 'Python Basics' }) }),
        createMockModule({ id: 'module-2', skill: createMockSkill({ id: 'skill-2', name: 'NumPy' }) }),
        createMockModule({ id: 'module-3', skill: createMockSkill({ id: 'skill-3', name: 'Pandas' }) }),
      ];

      render(<ModuleList modules={modules} isExpanded={true} />);

      expect(screen.getByText('1. Python Basics')).toBeInTheDocument();
      expect(screen.getByText('2. NumPy')).toBeInTheDocument();
      expect(screen.getByText('3. Pandas')).toBeInTheDocument();
    });

    it('displays estimated hours for unlocked modules', () => {
      render(<ModuleList {...defaultProps} />);

      expect(screen.getByText('10h')).toBeInTheDocument();
    });

    it('shows lock icon for locked modules', () => {
      const modules = [createMockModule({ isLocked: true })];

      render(<ModuleList modules={modules} isExpanded={true} />);

      // Locked modules should have a lock SVG
      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      const lockIcon = moduleItem?.querySelector('svg');
      expect(lockIcon).toBeInTheDocument();
    });
  });

  describe('Module Status Indicators', () => {
    it('displays completed module with correct style', () => {
      const modules = [
        createMockModule({
          progress: createMockProgress({ status: 'completed' }),
        }),
      ];

      render(<ModuleList modules={modules} isExpanded={true} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      const statusDot = moduleItem?.querySelector('div[class*="rounded-full"]');
      expect(statusDot).toHaveClass('bg-success-500');
    });

    it('displays in-progress module with correct style', () => {
      const modules = [
        createMockModule({
          progress: createMockProgress({ status: 'in_progress' }),
        }),
      ];

      render(<ModuleList modules={modules} isExpanded={true} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      const statusDot = moduleItem?.querySelector('div[class*="rounded-full"]');
      expect(statusDot).toHaveClass('bg-primary-500');
      expect(statusDot).toHaveClass('animate-pulse');
    });

    it('displays not-started module with correct style', () => {
      const modules = [createMockModule()];

      render(<ModuleList modules={modules} isExpanded={true} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      const statusDot = moduleItem?.querySelector('div[class*="rounded-full"]');
      expect(statusDot).toHaveClass('bg-white');
      expect(statusDot).toHaveClass('border-secondary-300');
    });

    it('displays skipped module with correct style', () => {
      const modules = [
        createMockModule({
          progress: createMockProgress({ status: 'skipped' }),
        }),
      ];

      render(<ModuleList modules={modules} isExpanded={true} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      const statusDot = moduleItem?.querySelector('div[class*="rounded-full"]');
      expect(statusDot).toHaveClass('bg-secondary-300');

      // Text should have line-through
      const moduleText = screen.getByText('1. Python Basics');
      expect(moduleText).toHaveClass('line-through');
    });

    it('displays locked module with correct style', () => {
      const modules = [createMockModule({ isLocked: true })];

      render(<ModuleList modules={modules} isExpanded={true} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      const statusDot = moduleItem?.querySelector('div[class*="rounded-full"]');
      expect(statusDot).toHaveClass('bg-secondary-100');
    });
  });

  describe('Current Module Highlighting', () => {
    it('highlights current module', () => {
      render(<ModuleList {...defaultProps} currentModuleId="module-1" />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      expect(moduleItem).toHaveClass('bg-primary-50');
    });

    it('does not highlight non-current modules', () => {
      render(<ModuleList {...defaultProps} currentModuleId="other-module" />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      expect(moduleItem).not.toHaveClass('bg-primary-50');
    });

    it('shows ring around current module status dot', () => {
      render(<ModuleList {...defaultProps} currentModuleId="module-1" />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      const statusDot = moduleItem?.querySelector('div[class*="rounded-full"]');
      expect(statusDot).toHaveClass('ring-2');
      expect(statusDot).toHaveClass('ring-primary-200');
    });
  });

  describe('Click Handling', () => {
    it('calls onModuleClick when unlocked module is clicked', () => {
      const onModuleClick = vi.fn();

      render(<ModuleList {...defaultProps} onModuleClick={onModuleClick} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      fireEvent.click(moduleItem!);

      expect(onModuleClick).toHaveBeenCalledWith('module-1');
    });

    it('does not call onModuleClick when locked module is clicked', () => {
      const onModuleClick = vi.fn();
      const modules = [createMockModule({ isLocked: true })];

      render(<ModuleList modules={modules} isExpanded={true} onModuleClick={onModuleClick} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      fireEvent.click(moduleItem!);

      expect(onModuleClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('responds to Enter key for unlocked modules', () => {
      const onModuleClick = vi.fn();

      render(<ModuleList {...defaultProps} onModuleClick={onModuleClick} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      fireEvent.keyDown(moduleItem!, { key: 'Enter' });

      expect(onModuleClick).toHaveBeenCalledWith('module-1');
    });

    it('responds to Space key for unlocked modules', () => {
      const onModuleClick = vi.fn();

      render(<ModuleList {...defaultProps} onModuleClick={onModuleClick} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      fireEvent.keyDown(moduleItem!, { key: ' ' });

      expect(onModuleClick).toHaveBeenCalledWith('module-1');
    });

    it('does not respond to keyboard for locked modules', () => {
      const onModuleClick = vi.fn();
      const modules = [createMockModule({ isLocked: true })];

      render(<ModuleList modules={modules} isExpanded={true} onModuleClick={onModuleClick} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      fireEvent.keyDown(moduleItem!, { key: 'Enter' });

      expect(onModuleClick).not.toHaveBeenCalled();
    });

    it('sets correct tabIndex for clickable modules', () => {
      render(<ModuleList {...defaultProps} onModuleClick={vi.fn()} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      expect(moduleItem).toHaveAttribute('tabIndex', '0');
    });

    it('sets tabIndex -1 for locked modules', () => {
      const modules = [createMockModule({ isLocked: true })];

      render(<ModuleList modules={modules} isExpanded={true} onModuleClick={vi.fn()} />);

      const moduleItem = screen.getByText('1. Python Basics').closest('li');
      expect(moduleItem).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Animation', () => {
    it('has CSS transition classes for animation', () => {
      render(<ModuleList {...defaultProps} />);

      const container = screen.getByText('1. Python Basics').closest('div[class*="overflow-hidden"]');
      expect(container).toHaveClass('transition-all');
      expect(container).toHaveClass('duration-300');
    });
  });
});
