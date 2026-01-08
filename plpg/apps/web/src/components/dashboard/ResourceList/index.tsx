import { useMemo, useCallback, useState, useEffect } from 'react';
import { ResourceCard } from '../ResourceCard';
import type { Resource } from '@plpg/shared';

export interface ResourceListProps {
  resources: Resource[];
  moduleId: string;
  onResourceCompletion?: (resourceId: string, completed: boolean) => void;
  showCompletionCheckbox?: boolean;
  sortBy?: 'sequence' | 'quality';
  completedResourceIds?: string[];
}

/**
 * Get storage key for resource completion state
 */
function getStorageKey(moduleId: string): string {
  return `resource-completion-${moduleId}`;
}

/**
 * ResourceList component displays a list of learning resources for a module
 *
 * Features:
 * - Orders resources by recommended sequence (quality by default)
 * - Handles empty resource list gracefully
 * - Tracks resource completion state locally (persisted to localStorage)
 */
export function ResourceList({
  resources,
  moduleId,
  onResourceCompletion,
  showCompletionCheckbox = true,
  sortBy = 'quality',
  completedResourceIds: externalCompletedIds,
}: ResourceListProps) {
  // Local state for completed resources (persisted to localStorage)
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    if (externalCompletedIds) {
      return new Set(externalCompletedIds);
    }
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(getStorageKey(moduleId));
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
    return new Set();
  });

  // Sync with external completed IDs if provided
  // Use JSON.stringify to detect content changes in the array
  const externalIdsString = externalCompletedIds ? JSON.stringify(externalCompletedIds.slice().sort()) : null;
  useEffect(() => {
    if (externalIdsString !== null) {
      const ids: string[] = JSON.parse(externalIdsString);
      setCompletedIds(new Set(ids));
    }
  }, [externalIdsString]);

  // Persist to localStorage when completedIds changes
  useEffect(() => {
    if (!externalCompletedIds) {
      try {
        localStorage.setItem(
          getStorageKey(moduleId),
          JSON.stringify(Array.from(completedIds))
        );
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [completedIds, moduleId, externalCompletedIds]);

  // Sort resources by specified criteria
  const sortedResources = useMemo(() => {
    if (!resources || resources.length === 0) return [];

    return [...resources].sort((a, b) => {
      if (sortBy === 'quality') {
        // Sort by quality descending (highest first)
        return b.quality - a.quality;
      }
      // For sequence sorting, use quality as proxy since resources don't have sequence
      // Higher quality resources are recommended first
      return b.quality - a.quality;
    });
  }, [resources, sortBy]);

  // Handle completion change
  const handleCompletionChange = useCallback((resourceId: string, completed: boolean) => {
    setCompletedIds((prev) => {
      const newSet = new Set(prev);
      if (completed) {
        newSet.add(resourceId);
      } else {
        newSet.delete(resourceId);
      }
      return newSet;
    });

    onResourceCompletion?.(resourceId, completed);
  }, [onResourceCompletion]);

  // Calculate completion stats
  const completionStats = useMemo(() => {
    const total = resources.length;
    const completed = resources.filter((r) => completedIds.has(r.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [resources, completedIds]);

  // Handle empty resource list
  if (!resources || resources.length === 0) {
    return (
      <div
        className="text-center py-8 px-4 bg-secondary-50 rounded-lg border border-secondary-200"
        data-testid="resource-list-empty"
      >
        <svg
          className="mx-auto h-12 w-12 text-secondary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="mt-2 text-sm text-secondary-600">
          No resources available for this module yet.
        </p>
        <p className="mt-1 text-xs text-secondary-500">
          Resources will be added soon to help you learn this skill.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="resource-list">
      {/* Header with completion stats */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          Learning Resources
        </h3>

        {showCompletionCheckbox && completionStats.total > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-secondary-500">
              {completionStats.completed}/{completionStats.total} completed
            </span>
            <div className="w-20 h-2 bg-secondary-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-success-500 rounded-full transition-all duration-300"
                style={{ width: `${completionStats.percentage}%` }}
                data-testid="resource-completion-progress"
              />
            </div>
          </div>
        )}
      </div>

      {/* Resource cards */}
      <div className="space-y-3" data-testid="resource-list-items">
        {sortedResources.map((resource, index) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            sequenceOrder={index + 1}
            isCompleted={completedIds.has(resource.id)}
            onCompletionChange={handleCompletionChange}
            showCompletionCheckbox={showCompletionCheckbox}
          />
        ))}
      </div>
    </div>
  );
}

export default ResourceList;
