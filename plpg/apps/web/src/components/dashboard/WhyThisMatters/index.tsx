import { useState, useCallback } from 'react';
import { cn } from '../../../lib/utils';
import type { PrerequisiteSkill } from '@plpg/shared';

export interface WhyThisMattersProps {
  content: string | null;
  prerequisites?: PrerequisiteSkill[];
  onPrerequisiteClick?: (skillId: string) => void;
  defaultExpanded?: boolean;
}

const MAX_CONTENT_LENGTH = 500; // Maximum characters before truncation

/**
 * WhyThisMatters component displays contextual information about why a skill matters
 * for the user's learning journey. It's collapsible but expanded by default.
 */
export function WhyThisMatters({
  content,
  prerequisites = [],
  onPrerequisiteClick,
  defaultExpanded = true,
}: WhyThisMattersProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleExpanded();
      }
    },
    [toggleExpanded]
  );

  const handlePrerequisiteClick = useCallback(
    (skillId: string) => {
      if (onPrerequisiteClick) {
        onPrerequisiteClick(skillId);
      }
    },
    [onPrerequisiteClick]
  );

  // Handle empty content gracefully
  if (!content || content.trim() === '') {
    return null;
  }

  // Sanitize and truncate content if too long
  const sanitizedContent = content.replace(/<[^>]*>/g, ''); // Basic HTML stripping
  const displayContent =
    sanitizedContent.length > MAX_CONTENT_LENGTH
      ? sanitizedContent.substring(0, MAX_CONTENT_LENGTH) + '...'
      : sanitizedContent;

  return (
    <div
      className="bg-primary-50 border border-primary-100 rounded-lg overflow-hidden"
      data-testid="why-this-matters"
    >
      {/* Collapsible Header */}
      <button
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls="why-this-matters-content"
        className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-100/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary-100 rounded-lg text-primary-600 shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-primary-800">Why This Matters</h3>
        </div>
        <svg
          className={cn(
            'w-5 h-5 text-primary-600 transition-transform duration-200',
            isExpanded ? 'rotate-180' : 'rotate-0'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Collapsible Content */}
      <div
        id="why-this-matters-content"
        className={cn(
          'transition-all duration-200 ease-in-out',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        )}
      >
        <div className="px-4 pb-4">
          <p
            className="text-sm text-primary-700 leading-relaxed"
            data-testid="why-this-matters-content"
          >
            {displayContent}
          </p>

          {/* Prerequisite Links */}
          {prerequisites.length > 0 && (
            <div className="mt-4 pt-3 border-t border-primary-200">
              <p className="text-xs font-medium text-primary-600 mb-2">
                Builds on:
              </p>
              <div className="flex flex-wrap gap-2">
                {prerequisites.map((prereq) => (
                  <button
                    key={prereq.id}
                    onClick={() => handlePrerequisiteClick(prereq.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full hover:bg-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                    data-testid={`prerequisite-link-${prereq.id}`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    {prereq.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WhyThisMatters;
