import { useState, useCallback, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { track } from '../../../lib/analytics';
import type { Resource, ResourceType } from '@plpg/shared';

export interface ResourceCardProps {
  resource: Resource;
  sequenceOrder?: number;
  isCompleted?: boolean;
  onCompletionChange?: (resourceId: string, completed: boolean) => void;
  showCompletionCheckbox?: boolean;
}

// Type badge colors for distinct visual identification
const resourceTypeBadgeColors: Record<ResourceType, { bg: string; text: string; border: string }> = {
  video: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  article: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  course: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  book: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  tutorial: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  documentation: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  exercise: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  project: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

const resourceTypeIcons: Record<ResourceType, JSX.Element> = {
  video: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
    </svg>
  ),
  article: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  ),
  course: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
    </svg>
  ),
  book: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
  ),
  tutorial: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
  documentation: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
    </svg>
  ),
  exercise: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ),
  project: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
};

const resourceTypeLabels: Record<ResourceType, string> = {
  video: 'Video',
  article: 'Article',
  course: 'Course',
  book: 'Book',
  tutorial: 'Tutorial',
  documentation: 'Documentation',
  exercise: 'Exercise',
  project: 'Mini-Project',
};

/**
 * Format duration in minutes to human-readable format
 */
function formatDuration(minutes: number | null): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format date to "Last verified" display format
 */
function formatLastVerified(date: Date): string {
  const now = new Date();
  const lastVerified = new Date(date);
  const diffDays = Math.floor((now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Verified today';
  if (diffDays === 1) return 'Verified yesterday';
  if (diffDays < 7) return `Verified ${diffDays} days ago`;
  if (diffDays < 30) return `Verified ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `Verified ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `Verified ${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

/**
 * Render quality score as stars
 */
function QualityScore({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1" title={`Quality: ${score}/5`}>
      <span className="text-xs text-secondary-500">{score.toFixed(1)}</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={cn(
              'w-3 h-3',
              i < score ? 'text-amber-400' : 'text-secondary-200'
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
  );
}

export function ResourceCard({
  resource,
  isCompleted = false,
  onCompletionChange,
  showCompletionCheckbox = false,
}: ResourceCardProps) {
  const [localCompleted, setLocalCompleted] = useState(isCompleted);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalCompleted(isCompleted);
  }, [isCompleted]);

  const badgeColors = resourceTypeBadgeColors[resource.type];
  const duration = formatDuration(resource.durationMinutes);
  const lastVerified = formatLastVerified(resource.updatedAt);

  const handleClick = useCallback(() => {
    // Track resource click event
    track('resource_click', {
      resourceId: resource.id,
      resourceTitle: resource.title,
      resourceType: resource.type,
      resourceUrl: resource.url,
      provider: resource.provider,
    });
  }, [resource.id, resource.title, resource.type, resource.url, resource.provider]);

  const handleCompletionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newCompleted = e.target.checked;
    setLocalCompleted(newCompleted);

    // Track completion event
    track('resource_completion', {
      resourceId: resource.id,
      resourceTitle: resource.title,
      completed: newCompleted,
    });

    onCompletionChange?.(resource.id, newCompleted);
  }, [resource.id, resource.title, onCompletionChange]);

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border transition-all group',
        localCompleted
          ? 'bg-success-50 border-success-200'
          : 'bg-white border-secondary-200 hover:border-primary-300 hover:shadow-sm'
      )}
      data-testid="resource-card"
    >
      {/* Completion Checkbox */}
      {showCompletionCheckbox && (
        <div className="flex items-center pt-0.5">
          <input
            type="checkbox"
            checked={localCompleted}
            onChange={handleCompletionChange}
            className={cn(
              'w-4 h-4 rounded border-2 cursor-pointer transition-colors',
              localCompleted
                ? 'bg-success-500 border-success-500 text-white'
                : 'border-secondary-300 hover:border-primary-400'
            )}
            aria-label={`Mark ${resource.title} as ${localCompleted ? 'incomplete' : 'complete'}`}
            data-testid="resource-completion-checkbox"
          />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          'p-2 rounded-lg shrink-0 transition-colors',
          badgeColors.bg,
          badgeColors.text
        )}
      >
        {resourceTypeIcons[resource.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: Type badge + Title */}
        <div className="flex items-start gap-2 flex-wrap">
          {/* Type Badge */}
          <span
            className={cn(
              'shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
              badgeColors.bg,
              badgeColors.text,
              badgeColors.border
            )}
            data-testid="resource-type-badge"
          >
            {resourceTypeLabels[resource.type]}
          </span>

          {/* Paid Badge */}
          {!resource.isFree && (
            <span className="shrink-0 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
              Paid
            </span>
          )}
        </div>

        {/* Title (clickable) */}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={cn(
            'block mt-1.5 text-sm font-medium transition-colors',
            localCompleted
              ? 'text-secondary-500 line-through'
              : 'text-secondary-900 hover:text-primary-600 group-hover:text-primary-700'
          )}
          data-testid="resource-title-link"
        >
          {resource.title}
          <svg
            className="inline-block ml-1 w-3.5 h-3.5 text-secondary-400 group-hover:text-primary-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>

        {/* Meta info row */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-secondary-500">
          {/* Source/Provider */}
          {resource.provider && (
            <span className="flex items-center gap-1" data-testid="resource-provider">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
              </svg>
              {resource.provider}
            </span>
          )}

          {/* Duration */}
          {duration && (
            <span className="flex items-center gap-1" data-testid="resource-duration">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {duration}
            </span>
          )}

          {/* Last Verified */}
          <span className="flex items-center gap-1 text-secondary-400" data-testid="resource-last-verified">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {lastVerified}
          </span>
        </div>

        {/* Quality Score */}
        {resource.quality > 0 && (
          <div className="mt-2" data-testid="resource-quality">
            <QualityScore score={resource.quality} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceCard;
