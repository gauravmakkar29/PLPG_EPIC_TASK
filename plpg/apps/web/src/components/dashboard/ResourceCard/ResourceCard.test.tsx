import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ResourceCard } from './index';
import type { Resource, ResourceType } from '@plpg/shared';

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
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-12-01'),
  ...overrides,
});

describe('ResourceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe('ResourceCard Component Tests', () => {
    it('displays type badge with correct color', () => {
      render(<ResourceCard resource={createMockResource({ type: 'video' })} />);

      const badge = screen.getByTestId('resource-type-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Video');
      // Red color for video
      expect(badge.className).toContain('bg-red-50');
      expect(badge.className).toContain('text-red-700');
    });

    it('displays type badge with correct color for different types', () => {
      const typeColors: Record<ResourceType, string> = {
        video: 'red',
        article: 'blue',
        course: 'purple',
        book: 'amber',
        tutorial: 'green',
        documentation: 'cyan',
        exercise: 'orange',
        project: 'indigo',
      };

      Object.entries(typeColors).forEach(([type, color]) => {
        cleanup();
        render(<ResourceCard resource={createMockResource({ type: type as ResourceType })} />);

        const badge = screen.getByTestId('resource-type-badge');
        expect(badge.className).toContain(`bg-${color}-50`);
      });
    });

    it('renders resource title', () => {
      render(<ResourceCard resource={createMockResource()} />);

      expect(screen.getByText('Python Tutorial')).toBeInTheDocument();
    });

    it('shows source attribution', () => {
      render(<ResourceCard resource={createMockResource({ provider: 'Coursera' })} />);

      expect(screen.getByTestId('resource-provider')).toHaveTextContent('Coursera');
    });

    it('displays estimated time', () => {
      render(<ResourceCard resource={createMockResource({ durationMinutes: 90 })} />);

      expect(screen.getByTestId('resource-duration')).toHaveTextContent('1h 30m');
    });

    it('displays estimated time in minutes when less than 1 hour', () => {
      render(<ResourceCard resource={createMockResource({ durationMinutes: 30 })} />);

      expect(screen.getByTestId('resource-duration')).toHaveTextContent('30m');
    });

    it('shows quality score when available', () => {
      render(<ResourceCard resource={createMockResource({ quality: 4.5 })} />);

      const quality = screen.getByTestId('resource-quality');
      expect(quality).toBeInTheDocument();
    });

    it('opens link in new tab on click', () => {
      render(<ResourceCard resource={createMockResource()} />);

      const link = screen.getByTestId('resource-title-link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('displays "Last verified" date', () => {
      render(<ResourceCard resource={createMockResource()} />);

      const lastVerified = screen.getByTestId('resource-last-verified');
      expect(lastVerified).toBeInTheDocument();
      // Should contain "Verified" text
      expect(lastVerified.textContent).toContain('Verified');
    });

    it('shows "Paid" badge for non-free resources', () => {
      render(<ResourceCard resource={createMockResource({ isFree: false })} />);

      expect(screen.getByText('Paid')).toBeInTheDocument();
    });

    it('does not show "Paid" badge for free resources', () => {
      render(<ResourceCard resource={createMockResource({ isFree: true })} />);

      expect(screen.queryByText('Paid')).not.toBeInTheDocument();
    });
  });

  describe('Resource Completion Tests', () => {
    it('renders completion checkbox when showCompletionCheckbox is true', () => {
      render(
        <ResourceCard
          resource={createMockResource()}
          showCompletionCheckbox={true}
        />
      );

      expect(screen.getByTestId('resource-completion-checkbox')).toBeInTheDocument();
    });

    it('does not render completion checkbox when showCompletionCheckbox is false', () => {
      render(
        <ResourceCard
          resource={createMockResource()}
          showCompletionCheckbox={false}
        />
      );

      expect(screen.queryByTestId('resource-completion-checkbox')).not.toBeInTheDocument();
    });

    it('marks resource as complete on check', () => {
      const onCompletionChange = vi.fn();
      render(
        <ResourceCard
          resource={createMockResource()}
          showCompletionCheckbox={true}
          onCompletionChange={onCompletionChange}
        />
      );

      const checkbox = screen.getByTestId('resource-completion-checkbox');
      fireEvent.click(checkbox);

      expect(onCompletionChange).toHaveBeenCalledWith('resource-1', true);
    });

    it('updates visual state when completed', () => {
      render(
        <ResourceCard
          resource={createMockResource()}
          isCompleted={true}
          showCompletionCheckbox={true}
        />
      );

      const card = screen.getByTestId('resource-card');
      expect(card.className).toContain('bg-success-50');
    });

    it('shows strikethrough on title when completed', () => {
      render(
        <ResourceCard
          resource={createMockResource()}
          isCompleted={true}
          showCompletionCheckbox={true}
        />
      );

      const titleLink = screen.getByTestId('resource-title-link');
      expect(titleLink.className).toContain('line-through');
    });
  });

  describe('Analytics Tests', () => {
    it('tracks resource click events', () => {
      render(<ResourceCard resource={createMockResource()} />);

      const link = screen.getByTestId('resource-title-link');
      fireEvent.click(link);

      expect(track).toHaveBeenCalledWith('resource_click', expect.objectContaining({
        resourceId: 'resource-1',
        resourceTitle: 'Python Tutorial',
      }));
    });

    it('includes resource ID in click event', () => {
      render(<ResourceCard resource={createMockResource({ id: 'test-resource-123' })} />);

      const link = screen.getByTestId('resource-title-link');
      fireEvent.click(link);

      expect(track).toHaveBeenCalledWith('resource_click', expect.objectContaining({
        resourceId: 'test-resource-123',
      }));
    });

    it('tracks resource completion events', () => {
      render(
        <ResourceCard
          resource={createMockResource()}
          showCompletionCheckbox={true}
        />
      );

      const checkbox = screen.getByTestId('resource-completion-checkbox');
      fireEvent.click(checkbox);

      expect(track).toHaveBeenCalledWith('resource_completion', expect.objectContaining({
        resourceId: 'resource-1',
        completed: true,
      }));
    });

    it('tracks uncomplete event when unchecking', () => {
      render(
        <ResourceCard
          resource={createMockResource()}
          isCompleted={true}
          showCompletionCheckbox={true}
        />
      );

      const checkbox = screen.getByTestId('resource-completion-checkbox');
      fireEvent.click(checkbox);

      expect(track).toHaveBeenCalledWith('resource_completion', expect.objectContaining({
        resourceId: 'resource-1',
        completed: false,
      }));
    });
  });

  describe('Type Badge Display', () => {
    it('displays "Mini-Project" for project type', () => {
      render(<ResourceCard resource={createMockResource({ type: 'project' })} />);

      expect(screen.getByTestId('resource-type-badge')).toHaveTextContent('Mini-Project');
    });

    it('displays "Documentation" for documentation type', () => {
      render(<ResourceCard resource={createMockResource({ type: 'documentation' })} />);

      expect(screen.getByTestId('resource-type-badge')).toHaveTextContent('Documentation');
    });

    it('displays "Tutorial" for tutorial type', () => {
      render(<ResourceCard resource={createMockResource({ type: 'tutorial' })} />);

      expect(screen.getByTestId('resource-type-badge')).toHaveTextContent('Tutorial');
    });
  });

  describe('Quality Score Display', () => {
    it('renders 5 stars for quality display', () => {
      render(<ResourceCard resource={createMockResource({ quality: 3 })} />);

      const qualitySection = screen.getByTestId('resource-quality');
      const stars = qualitySection.querySelectorAll('svg');
      expect(stars.length).toBe(5);
    });

    it('displays numeric quality score', () => {
      render(<ResourceCard resource={createMockResource({ quality: 4 })} />);

      const qualitySection = screen.getByTestId('resource-quality');
      expect(qualitySection.textContent).toContain('4.0');
    });
  });

  describe('Duration Formatting', () => {
    it('formats duration in hours only when no remaining minutes', () => {
      render(<ResourceCard resource={createMockResource({ durationMinutes: 120 })} />);

      expect(screen.getByTestId('resource-duration')).toHaveTextContent('2h');
    });

    it('formats duration with hours and minutes', () => {
      render(<ResourceCard resource={createMockResource({ durationMinutes: 150 })} />);

      expect(screen.getByTestId('resource-duration')).toHaveTextContent('2h 30m');
    });

    it('does not display duration when null', () => {
      render(<ResourceCard resource={createMockResource({ durationMinutes: null })} />);

      expect(screen.queryByTestId('resource-duration')).not.toBeInTheDocument();
    });
  });

  describe('Provider Display', () => {
    it('does not display provider when null', () => {
      render(<ResourceCard resource={createMockResource({ provider: null })} />);

      expect(screen.queryByTestId('resource-provider')).not.toBeInTheDocument();
    });

    it('displays provider when present', () => {
      render(<ResourceCard resource={createMockResource({ provider: 'Official Docs' })} />);

      expect(screen.getByTestId('resource-provider')).toHaveTextContent('Official Docs');
    });
  });
});
