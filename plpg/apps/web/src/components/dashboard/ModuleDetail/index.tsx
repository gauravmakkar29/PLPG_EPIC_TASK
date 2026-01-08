import { useEffect, useCallback, useRef } from 'react';
import { cn } from '../../../lib/utils';
import { track } from '../../../lib/analytics';
import type { RoadmapModuleWithSkill, Resource, ResourceType } from '@plpg/shared';
import { PHASE_LABELS, type Phase } from '@plpg/shared';

export interface ModuleDetailProps {
  module: RoadmapModuleWithSkill;
  moduleIndex: number;
  totalModulesInPhase: number;
  onMarkComplete: () => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  isFirst: boolean;
  isLast: boolean;
  isMarkingComplete?: boolean;
}

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
  documentation: 'Docs',
  exercise: 'Exercise',
  project: 'Project',
};

function ResourceItem({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
    >
      <div className="p-2 rounded-lg bg-secondary-100 text-secondary-600 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
        {resourceTypeIcons[resource.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-secondary-900 truncate group-hover:text-primary-700">
            {resource.title}
          </h4>
          {!resource.isFree && (
            <span className="shrink-0 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
              Paid
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-secondary-500">
          <span className="px-1.5 py-0.5 bg-secondary-100 rounded">
            {resourceTypeLabels[resource.type]}
          </span>
          {resource.provider && <span>{resource.provider}</span>}
          {resource.durationMinutes && (
            <span>{Math.round(resource.durationMinutes / 60)}h</span>
          )}
          <div className="flex items-center gap-0.5 ml-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={cn(
                  'w-3 h-3',
                  i < resource.quality ? 'text-amber-400' : 'text-secondary-200'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <svg
        className="w-4 h-4 text-secondary-400 group-hover:text-primary-500 shrink-0 mt-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}

export function ModuleDetail({
  module,
  moduleIndex,
  totalModulesInPhase,
  onMarkComplete,
  onNavigatePrevious,
  onNavigateNext,
  isFirst,
  isLast,
  isMarkingComplete = false,
}: ModuleDetailProps) {
  const viewStartTime = useRef<number>(Date.now());
  const hasTrackedView = useRef<boolean>(false);

  // Track module view event on mount
  useEffect(() => {
    if (!hasTrackedView.current) {
      track('module_view', {
        moduleId: module.id,
        skillId: module.skillId,
        skillName: module.skill.name,
        phase: module.phase,
        sequenceOrder: module.sequenceOrder,
      });
      hasTrackedView.current = true;
      viewStartTime.current = Date.now();
    }

    // Track time spent on unmount
    return () => {
      const timeSpent = Math.round((Date.now() - viewStartTime.current) / 1000);
      track('module_view_duration', {
        moduleId: module.id,
        skillId: module.skillId,
        timeSpentSeconds: timeSpent,
      });
    };
  }, [module.id, module.skillId, module.skill.name, module.phase, module.sequenceOrder]);

  // Reset tracking when module changes
  useEffect(() => {
    hasTrackedView.current = false;
    viewStartTime.current = Date.now();
    track('module_view', {
      moduleId: module.id,
      skillId: module.skillId,
      skillName: module.skill.name,
      phase: module.phase,
      sequenceOrder: module.sequenceOrder,
    });
    hasTrackedView.current = true;
  }, [module.id, module.skillId, module.skill.name, module.phase, module.sequenceOrder]);

  const handleMarkComplete = useCallback(() => {
    track('module_mark_complete_clicked', {
      moduleId: module.id,
      skillId: module.skillId,
    });
    onMarkComplete();
  }, [module.id, module.skillId, onMarkComplete]);

  const isCompleted = module.progress?.status === 'completed';
  const phaseName = PHASE_LABELS[module.phase as Phase] || module.phase;
  const resources = (module.skill as { resources?: Resource[] }).resources || [];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header with phase context */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white">
        <div className="flex items-center gap-2 text-primary-100 text-sm mb-2">
          <span>{phaseName}</span>
          <span>•</span>
          <span>Module {moduleIndex + 1} of {totalModulesInPhase}</span>
        </div>
        <h1 className="text-2xl font-bold">{module.skill.name}</h1>
        <div className="flex items-center gap-4 mt-2 text-primary-100">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{module.skill.estimatedHours} hours</span>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1 text-success-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <p className="text-secondary-700 leading-relaxed">{module.skill.description}</p>
        </div>

        {/* Why This Matters */}
        {module.skill.whyThisMatters && (
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-primary-100 rounded-lg text-primary-600 shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-primary-800 mb-1">Why This Matters</h3>
                <p className="text-sm text-primary-700 leading-relaxed">
                  {module.skill.whyThisMatters}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div>
            <h3 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Learning Resources
            </h3>
            <div className="space-y-3">
              {resources
                .sort((a, b) => b.quality - a.quality)
                .map((resource) => (
                  <ResourceItem key={resource.id} resource={resource} />
                ))}
            </div>
          </div>
        )}

        {/* Mark Complete Button */}
        <div className="pt-4 border-t border-secondary-100">
          <button
            onClick={handleMarkComplete}
            disabled={isCompleted || isMarkingComplete}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
              isCompleted
                ? 'bg-success-100 text-success-700 cursor-default'
                : isMarkingComplete
                ? 'bg-primary-400 text-white cursor-wait'
                : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]'
            )}
          >
            {isCompleted ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Module Completed
              </>
            ) : isMarkingComplete ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Marking Complete...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Complete
              </>
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
          <button
            onClick={onNavigatePrevious}
            disabled={isFirst}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              isFirst
                ? 'text-secondary-300 cursor-not-allowed'
                : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <button
            onClick={onNavigateNext}
            disabled={isLast}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              isLast
                ? 'text-secondary-300 cursor-not-allowed'
                : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
            )}
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModuleDetail;
