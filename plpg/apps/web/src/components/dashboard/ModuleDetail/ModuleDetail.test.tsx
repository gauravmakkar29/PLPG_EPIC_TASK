import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ModuleDetail } from './index';
import { Phase } from '@plpg/shared';
import type { RoadmapModuleWithSkill, Skill, Progress, Resource } from '@plpg/shared';

// Mock analytics module
vi.mock('../../../lib/analytics', () => ({
  track: vi.fn(),
}));

import { track } from '../../../lib/analytics';

// Helper to create mock resource
const createMockResource = (overrides: Partial<Resource> = {}): Resource => ({
  id: 'resource-1',
  skillId: 'skill-1',
  title: 'Python Tutorial',
  url: 'https://example.com/python',
  type: 'video',
  provider: 'YouTube',
  durationMinutes: 60,
  isFree: true,
  quality: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper to create mock skill
const createMockSkill = (overrides: Partial<Skill & { resources?: Resource[] }> = {}): Skill & { resources?: Resource[] } => ({
  id: 'skill-1',
  name: 'Python Basics',
  slug: 'python-basics',
  description: 'Learn Python fundamentals for machine learning',
  whyThisMatters: 'Python is the most popular language for ML and data science.',
  phase: Phase.FOUNDATION,
  estimatedHours: 10,
  isOptional: false,
  sequenceOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  resources: [createMockResource()],
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

describe('ModuleDetail', () => {
  const defaultProps = {
    module: createMockModule(),
    moduleIndex: 0,
    totalModulesInPhase: 3,
    onMarkComplete: vi.fn(),
    onNavigatePrevious: vi.fn(),
    onNavigateNext: vi.fn(),
    isFirst: false,
    isLast: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('ModuleDetail Component Tests', () => {
    it('renders current module title', () => {
      render(<ModuleDetail {...defaultProps} />);

      expect(screen.getByText('Python Basics')).toBeInTheDocument();
    });

    it('displays phase context (Phase X - Module Y of Z)', () => {
      render(<ModuleDetail {...defaultProps} />);

      expect(screen.getByText('Foundation')).toBeInTheDocument();
      expect(screen.getByText('Module 1 of 3')).toBeInTheDocument();
    });

    it('shows estimated time for module', () => {
      render(<ModuleDetail {...defaultProps} />);

      expect(screen.getByText('10 hours')).toBeInTheDocument();
    });

    it('renders "Why This Matters" section', () => {
      render(<ModuleDetail {...defaultProps} />);

      expect(screen.getByText('Why This Matters')).toBeInTheDocument();
      expect(
        screen.getByText('Python is the most popular language for ML and data science.')
      ).toBeInTheDocument();
    });

    it('displays resource list', () => {
      render(<ModuleDetail {...defaultProps} />);

      expect(screen.getByText('Learning Resources')).toBeInTheDocument();
      expect(screen.getByText('Python Tutorial')).toBeInTheDocument();
    });

    it('renders "Mark Complete" button', () => {
      render(<ModuleDetail {...defaultProps} />);

      expect(screen.getByRole('button', { name: /mark as complete/i })).toBeInTheDocument();
    });
  });

  describe('Navigation Tests', () => {
    it('renders Previous button when not first module', () => {
      render(<ModuleDetail {...defaultProps} isFirst={false} />);

      const previousButton = screen.getByRole('button', { name: /previous/i });
      expect(previousButton).toBeInTheDocument();
      expect(previousButton).not.toBeDisabled();
    });

    it('renders Next button when not last module', () => {
      render(<ModuleDetail {...defaultProps} isLast={false} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).not.toBeDisabled();
    });

    it('disables Previous button on first module', () => {
      render(<ModuleDetail {...defaultProps} isFirst={true} />);

      const previousButton = screen.getByRole('button', { name: /previous/i });
      expect(previousButton).toBeDisabled();
    });

    it('disables Next button on last module', () => {
      render(<ModuleDetail {...defaultProps} isLast={true} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('navigates to previous module on click', () => {
      const onNavigatePrevious = vi.fn();
      render(<ModuleDetail {...defaultProps} isFirst={false} onNavigatePrevious={onNavigatePrevious} />);

      const previousButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(previousButton);

      expect(onNavigatePrevious).toHaveBeenCalledTimes(1);
    });

    it('navigates to next module on click', () => {
      const onNavigateNext = vi.fn();
      render(<ModuleDetail {...defaultProps} isLast={false} onNavigateNext={onNavigateNext} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      expect(onNavigateNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mark Complete Tests', () => {
    it('calls markComplete API on button click', () => {
      const onMarkComplete = vi.fn();
      render(<ModuleDetail {...defaultProps} onMarkComplete={onMarkComplete} />);

      const markCompleteButton = screen.getByRole('button', { name: /mark as complete/i });
      fireEvent.click(markCompleteButton);

      expect(onMarkComplete).toHaveBeenCalledTimes(1);
    });

    it('updates UI state after marking complete', () => {
      const module = createMockModule({
        progress: createMockProgress({ status: 'completed' }),
      });

      render(<ModuleDetail {...defaultProps} module={module} />);

      expect(screen.getByRole('button', { name: /module completed/i })).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('shows loading state when marking complete', () => {
      render(<ModuleDetail {...defaultProps} isMarkingComplete={true} />);

      expect(screen.getByRole('button', { name: /marking complete/i })).toBeInTheDocument();
    });

    it('disables button when already completed', () => {
      const module = createMockModule({
        progress: createMockProgress({ status: 'completed' }),
      });

      render(<ModuleDetail {...defaultProps} module={module} />);

      const completedButton = screen.getByRole('button', { name: /module completed/i });
      expect(completedButton).toBeDisabled();
    });
  });

  describe('Analytics Tests', () => {
    it('tracks module view event on mount', () => {
      render(<ModuleDetail {...defaultProps} />);

      expect(track).toHaveBeenCalledWith('module_view', expect.objectContaining({
        moduleId: 'module-1',
        skillId: 'skill-1',
        skillName: 'Python Basics',
        phase: Phase.FOUNDATION,
      }));
    });

    it('includes module ID in view event', () => {
      render(<ModuleDetail {...defaultProps} />);

      expect(track).toHaveBeenCalledWith('module_view', expect.objectContaining({
        moduleId: 'module-1',
      }));
    });

    it('tracks mark complete click event', () => {
      render(<ModuleDetail {...defaultProps} />);

      const markCompleteButton = screen.getByRole('button', { name: /mark as complete/i });
      fireEvent.click(markCompleteButton);

      expect(track).toHaveBeenCalledWith('module_mark_complete_clicked', expect.objectContaining({
        moduleId: 'module-1',
        skillId: 'skill-1',
      }));
    });
  });

  describe('Resource Display', () => {
    it('displays multiple resources sorted by quality', () => {
      const module = createMockModule({
        skill: createMockSkill({
          resources: [
            createMockResource({ id: 'r1', title: 'Low Quality', quality: 2 }),
            createMockResource({ id: 'r2', title: 'High Quality', quality: 5 }),
            createMockResource({ id: 'r3', title: 'Medium Quality', quality: 3 }),
          ],
        }),
      });

      render(<ModuleDetail {...defaultProps} module={module} />);

      const resources = screen.getAllByRole('link');
      const resourceTitles = resources.map((r) => r.textContent?.replace(/.*?(\w+ Quality).*/, '$1'));

      // High quality should come first
      expect(resourceTitles[0]).toContain('High Quality');
    });

    it('shows paid badge for non-free resources', () => {
      const module = createMockModule({
        skill: createMockSkill({
          resources: [createMockResource({ isFree: false })],
        }),
      });

      render(<ModuleDetail {...defaultProps} module={module} />);

      expect(screen.getByText('Paid')).toBeInTheDocument();
    });

    it('opens resource link in new tab', () => {
      render(<ModuleDetail {...defaultProps} />);

      const resourceLink = screen.getByRole('link', { name: /python tutorial/i });
      expect(resourceLink).toHaveAttribute('target', '_blank');
      expect(resourceLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('handles module without resources gracefully', () => {
      const module = createMockModule({
        skill: createMockSkill({ resources: [] }),
      });

      render(<ModuleDetail {...defaultProps} module={module} />);

      // Should not show Learning Resources section when no resources
      expect(screen.queryByText('Learning Resources')).not.toBeInTheDocument();
    });
  });

  describe('Why This Matters Section', () => {
    it('does not render section when whyThisMatters is null', () => {
      const module = createMockModule({
        skill: createMockSkill({ whyThisMatters: null }),
      });

      render(<ModuleDetail {...defaultProps} module={module} />);

      expect(screen.queryByText('Why This Matters')).not.toBeInTheDocument();
    });

    it('renders section with correct content when whyThisMatters is present', () => {
      render(<ModuleDetail {...defaultProps} />);

      expect(screen.getByText('Why This Matters')).toBeInTheDocument();
      expect(
        screen.getByText('Python is the most popular language for ML and data science.')
      ).toBeInTheDocument();
    });
  });

  describe('Phase Context Display', () => {
    it('displays correct phase label for FOUNDATION', () => {
      render(<ModuleDetail {...defaultProps} />);

      expect(screen.getByText('Foundation')).toBeInTheDocument();
    });

    it('displays correct phase label for CORE_ML', () => {
      const module = createMockModule({
        phase: Phase.CORE_ML,
        skill: createMockSkill({ phase: Phase.CORE_ML }),
      });

      render(<ModuleDetail {...defaultProps} module={module} />);

      expect(screen.getByText('Core ML')).toBeInTheDocument();
    });

    it('displays correct phase label for DEEP_LEARNING', () => {
      const module = createMockModule({
        phase: Phase.DEEP_LEARNING,
        skill: createMockSkill({ phase: Phase.DEEP_LEARNING }),
      });

      render(<ModuleDetail {...defaultProps} module={module} />);

      expect(screen.getByText('Deep Learning')).toBeInTheDocument();
    });

    it('displays correct module index', () => {
      render(<ModuleDetail {...defaultProps} moduleIndex={2} totalModulesInPhase={5} />);

      expect(screen.getByText('Module 3 of 5')).toBeInTheDocument();
    });
  });
});
