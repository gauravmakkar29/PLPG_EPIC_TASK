import { useEffect, useCallback, useRef } from 'react';
import { cn } from '../../../lib/utils';
import { track } from '../../../lib/analytics';
import type { RoadmapModuleWithSkill, Resource, PrerequisiteSkill } from '@plpg/shared';
import { PHASE_LABELS, type Phase } from '@plpg/shared';
import { WhyThisMatters } from '../WhyThisMatters';
import { ResourceList } from '../ResourceList';

export interface ModuleDetailProps {
  module: RoadmapModuleWithSkill;
  moduleIndex: number;
  totalModulesInPhase: number;
  onMarkComplete: () => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  onNavigateToModule?: (skillId: string) => void;
  isFirst: boolean;
  isLast: boolean;
  isMarkingComplete?: boolean;
}

export function ModuleDetail({
  module,
  moduleIndex,
  totalModulesInPhase,
  onMarkComplete,
  onNavigatePrevious,
  onNavigateNext,
  onNavigateToModule,
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
        <WhyThisMatters
          content={module.skill.whyThisMatters}
          prerequisites={(module.skill as { prerequisites?: PrerequisiteSkill[] }).prerequisites}
          onPrerequisiteClick={onNavigateToModule}
        />

        {/* Resources */}
        <ResourceList
          resources={resources}
          moduleId={module.id}
          showCompletionCheckbox={true}
        />

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
