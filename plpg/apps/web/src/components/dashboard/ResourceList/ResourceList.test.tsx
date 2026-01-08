import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ResourceList } from './index';
import type { Resource } from '@plpg/shared';

// Mock analytics module
vi.mock('../../../lib/analytics', () => ({
  track: vi.fn(),
}));

import { track } from '../../../lib/analytics';

// Helper to create mock resource
const createMockResource = (overrides: Partial<Resource> = {}): Resource => ({
  id: `resource-${Math.random().toString(36).slice(2)}`,
  skillId: 'skill-1',
  title: 'Test Resource',
  url: 'https://example.com/resource',
  type: 'video',
  provider: 'YouTube',
  durationMinutes: 60,
  isFree: true,
  quality: 3,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-12-01'),
  ...overrides,
});

describe('ResourceList', () => {
  const moduleId = 'test-module-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe('ResourceList Component Tests', () => {
    it('renders list of resource cards', () => {
      const resources = [
        createMockResource({ id: 'r1', title: 'Resource 1' }),
        createMockResource({ id: 'r2', title: 'Resource 2' }),
        createMockResource({ id: 'r3', title: 'Resource 3' }),
      ];

      render(<ResourceList resources={resources} moduleId={moduleId} />);

      expect(screen.getByText('Resource 1')).toBeInTheDocument();
      expect(screen.getByText('Resource 2')).toBeInTheDocument();
      expect(screen.getByText('Resource 3')).toBeInTheDocument();
    });

    it('orders resources by recommended sequence (quality)', () => {
      const resources = [
        createMockResource({ id: 'r1', title: 'Low Quality', quality: 2 }),
        createMockResource({ id: 'r2', title: 'High Quality', quality: 5 }),
        createMockResource({ id: 'r3', title: 'Medium Quality', quality: 3 }),
      ];

      render(<ResourceList resources={resources} moduleId={moduleId} />);

      const items = screen.getByTestId('resource-list-items');
      const resourceCards = items.querySelectorAll('[data-testid="resource-card"]');

      // High quality should come first
      expect(resourceCards[0]).toHaveTextContent('High Quality');
      expect(resourceCards[1]).toHaveTextContent('Medium Quality');
      expect(resourceCards[2]).toHaveTextContent('Low Quality');
    });

    it('handles empty resource list gracefully', () => {
      render(<ResourceList resources={[]} moduleId={moduleId} />);

      expect(screen.getByTestId('resource-list-empty')).toBeInTheDocument();
      expect(screen.getByText('No resources available for this module yet.')).toBeInTheDocument();
    });

    it('displays Learning Resources header', () => {
      const resources = [createMockResource()];

      render(<ResourceList resources={resources} moduleId={moduleId} />);

      expect(screen.getByText('Learning Resources')).toBeInTheDocument();
    });

    it('displays completion progress bar', () => {
      const resources = [
        createMockResource({ id: 'r1' }),
        createMockResource({ id: 'r2' }),
      ];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
        />
      );

      expect(screen.getByTestId('resource-completion-progress')).toBeInTheDocument();
    });

    it('displays completion count', () => {
      const resources = [
        createMockResource({ id: 'r1' }),
        createMockResource({ id: 'r2' }),
        createMockResource({ id: 'r3' }),
      ];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
        />
      );

      expect(screen.getByText('0/3 completed')).toBeInTheDocument();
    });
  });

  describe('Resource Completion Tests', () => {
    it('renders completion checkbox for each resource', () => {
      const resources = [
        createMockResource({ id: 'r1' }),
        createMockResource({ id: 'r2' }),
      ];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
        />
      );

      const checkboxes = screen.getAllByTestId('resource-completion-checkbox');
      expect(checkboxes).toHaveLength(2);
    });

    it('marks resource as complete on check', () => {
      const resources = [createMockResource({ id: 'r1' })];
      const onResourceCompletion = vi.fn();

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
          onResourceCompletion={onResourceCompletion}
        />
      );

      const checkbox = screen.getByTestId('resource-completion-checkbox');
      fireEvent.click(checkbox);

      expect(onResourceCompletion).toHaveBeenCalledWith('r1', true);
    });

    it('persists completion state to localStorage', () => {
      const resources = [createMockResource({ id: 'r1' })];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
        />
      );

      const checkbox = screen.getByTestId('resource-completion-checkbox');
      fireEvent.click(checkbox);

      // Check localStorage
      const stored = localStorage.getItem(`resource-completion-${moduleId}`);
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!)).toContain('r1');
    });

    it('loads completion state from localStorage on mount', () => {
      const resources = [createMockResource({ id: 'r1' })];

      // Pre-set localStorage
      localStorage.setItem(`resource-completion-${moduleId}`, JSON.stringify(['r1']));

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
        />
      );

      const checkbox = screen.getByTestId('resource-completion-checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('updates visual state when completed', () => {
      const resources = [createMockResource({ id: 'r1' })];

      // Pre-set completion
      localStorage.setItem(`resource-completion-${moduleId}`, JSON.stringify(['r1']));

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
        />
      );

      const card = screen.getByTestId('resource-card');
      expect(card.className).toContain('bg-success-50');
    });

    it('updates progress bar when resource is completed', () => {
      const resources = [
        createMockResource({ id: 'r1' }),
        createMockResource({ id: 'r2' }),
      ];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
        />
      );

      // Initially 0% complete
      let progressBar = screen.getByTestId('resource-completion-progress');
      expect(progressBar.style.width).toBe('0%');

      // Mark one resource complete
      const checkboxes = screen.getAllByTestId('resource-completion-checkbox');
      fireEvent.click(checkboxes[0]);

      // Now 50% complete
      progressBar = screen.getByTestId('resource-completion-progress');
      expect(progressBar.style.width).toBe('50%');
    });

    it('updates completion count when resource is completed', () => {
      const resources = [
        createMockResource({ id: 'r1' }),
        createMockResource({ id: 'r2' }),
      ];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
        />
      );

      // Initially 0/2 completed
      expect(screen.getByText('0/2 completed')).toBeInTheDocument();

      // Mark one resource complete
      const checkboxes = screen.getAllByTestId('resource-completion-checkbox');
      fireEvent.click(checkboxes[0]);

      // Now 1/2 completed
      expect(screen.getByText('1/2 completed')).toBeInTheDocument();
    });
  });

  describe('Analytics Tests', () => {
    it('tracks resource click events through ResourceCard', () => {
      const resources = [createMockResource({ id: 'r1', title: 'Test Resource' })];

      render(<ResourceList resources={resources} moduleId={moduleId} />);

      const link = screen.getByTestId('resource-title-link');
      fireEvent.click(link);

      expect(track).toHaveBeenCalledWith('resource_click', expect.objectContaining({
        resourceId: 'r1',
      }));
    });

    it('tracks resource completion events through ResourceCard', () => {
      const resources = [createMockResource({ id: 'r1' })];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
        />
      );

      const checkbox = screen.getByTestId('resource-completion-checkbox');
      fireEvent.click(checkbox);

      expect(track).toHaveBeenCalledWith('resource_completion', expect.objectContaining({
        resourceId: 'r1',
        completed: true,
      }));
    });
  });

  describe('External Completed IDs', () => {
    it('uses external completedResourceIds when provided', () => {
      const resources = [
        createMockResource({ id: 'r1' }),
        createMockResource({ id: 'r2' }),
      ];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
          completedResourceIds={['r1']}
        />
      );

      const checkboxes = screen.getAllByTestId('resource-completion-checkbox') as HTMLInputElement[];
      expect(checkboxes[0].checked).toBe(true);
      expect(checkboxes[1].checked).toBe(false);
    });

    it('syncs with external completedResourceIds changes', async () => {
      const resources = [createMockResource({ id: 'r1' })];

      const { rerender } = render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
          completedResourceIds={[]}
        />
      );

      let checkbox = screen.getByTestId('resource-completion-checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      // Update external completed IDs
      rerender(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={true}
          completedResourceIds={['r1']}
        />
      );

      // Wait for the useEffect to trigger and update state
      await waitFor(() => {
        checkbox = screen.getByTestId('resource-completion-checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
      });
    });
  });

  describe('Sorting Options', () => {
    it('sorts by quality when sortBy is "quality"', () => {
      const resources = [
        createMockResource({ id: 'r1', title: 'Quality 2', quality: 2 }),
        createMockResource({ id: 'r2', title: 'Quality 5', quality: 5 }),
      ];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          sortBy="quality"
        />
      );

      const items = screen.getByTestId('resource-list-items');
      const resourceCards = items.querySelectorAll('[data-testid="resource-card"]');

      expect(resourceCards[0]).toHaveTextContent('Quality 5');
      expect(resourceCards[1]).toHaveTextContent('Quality 2');
    });
  });

  describe('Completion Checkbox Visibility', () => {
    it('hides completion checkboxes when showCompletionCheckbox is false', () => {
      const resources = [createMockResource({ id: 'r1' })];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={false}
        />
      );

      expect(screen.queryByTestId('resource-completion-checkbox')).not.toBeInTheDocument();
    });

    it('hides progress bar when showCompletionCheckbox is false', () => {
      const resources = [createMockResource({ id: 'r1' })];

      render(
        <ResourceList
          resources={resources}
          moduleId={moduleId}
          showCompletionCheckbox={false}
        />
      );

      expect(screen.queryByTestId('resource-completion-progress')).not.toBeInTheDocument();
    });
  });
});
