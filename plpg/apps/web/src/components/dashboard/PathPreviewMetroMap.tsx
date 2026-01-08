import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import type { RoadmapModuleWithSkill, Phase, ProgressStatus } from '@plpg/shared';
import { PHASE_LABELS, PHASE_DESCRIPTIONS } from '@plpg/shared';

interface PhaseDataItem {
  phase: Phase;
  modules: RoadmapModuleWithSkill[];
  isAccessible: boolean;
  moduleCount: number;
  completedCount: number;
  totalHours: number;
}

export interface PathPreviewMetroMapProps {
  phaseData: PhaseDataItem[];
  currentModuleId?: string;
  onModuleClick?: (moduleId: string, isAccessible: boolean) => void;
  className?: string;
}

type PhaseStatus = 'completed' | 'active' | 'locked' | 'accessible';

export function PathPreviewMetroMap({
  phaseData,
  currentModuleId,
  onModuleClick,
  className,
}: PathPreviewMetroMapProps) {
  const [expandedPhases, setExpandedPhases] = useState<Record<Phase, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    phaseData.forEach((p) => {
      // Auto-expand accessible phases
      initial[p.phase] = p.isAccessible;
    });
    return initial as Record<Phase, boolean>;
  });

  const togglePhase = useCallback((phase: Phase) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phase]: !prev[phase],
    }));
  }, []);

  const getPhaseStatus = (phaseItem: PhaseDataItem): PhaseStatus => {
    if (!phaseItem.isAccessible) return 'locked';
    if (phaseItem.completedCount === phaseItem.moduleCount && phaseItem.moduleCount > 0) {
      return 'completed';
    }
    if (phaseItem.completedCount > 0 || phaseItem.modules.some((m) => m.id === currentModuleId)) {
      return 'active';
    }
    return 'accessible';
  };

  return (
    <div className={cn('bg-white rounded-xl shadow-sm p-6', className)}>
      <h2 className="text-lg font-semibold text-secondary-900 mb-4">Your Learning Journey</h2>

      <div className="space-y-4">
        {phaseData.map((phaseItem, index) => {
          const status = getPhaseStatus(phaseItem);
          const isExpanded = expandedPhases[phaseItem.phase];
          const isLast = index === phaseData.length - 1;

          return (
            <PhaseSection
              key={phaseItem.phase}
              phaseItem={phaseItem}
              status={status}
              isExpanded={isExpanded}
              isLast={isLast}
              currentModuleId={currentModuleId}
              onToggle={() => togglePhase(phaseItem.phase)}
              onModuleClick={onModuleClick}
            />
          );
        })}
      </div>
    </div>
  );
}

interface PhaseSectionProps {
  phaseItem: PhaseDataItem;
  status: PhaseStatus;
  isExpanded: boolean;
  isLast: boolean;
  currentModuleId?: string;
  onToggle: () => void;
  onModuleClick?: (moduleId: string, isAccessible: boolean) => void;
}

const phaseStatusStyles: Record<PhaseStatus, string> = {
  completed: 'border-success-200 bg-success-50',
  active: 'border-primary-200 bg-primary-50',
  accessible: 'border-secondary-200 bg-secondary-50',
  locked: 'border-secondary-200 bg-secondary-50 opacity-75',
};

const phaseIconStyles: Record<PhaseStatus, string> = {
  completed: 'bg-success-100 text-success-600',
  active: 'bg-primary-100 text-primary-600',
  accessible: 'bg-secondary-100 text-secondary-500',
  locked: 'bg-secondary-100 text-secondary-400',
};

const phaseTitleStyles: Record<PhaseStatus, string> = {
  completed: 'text-success-700',
  active: 'text-primary-700',
  accessible: 'text-secondary-700',
  locked: 'text-secondary-500',
};

function PhaseSection({
  phaseItem,
  status,
  isExpanded,
  isLast,
  currentModuleId,
  onToggle,
  onModuleClick,
}: PhaseSectionProps) {
  const isLocked = status === 'locked';

  return (
    <div className="relative">
      {/* Connection line to next phase */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-6 top-full h-4 w-0.5',
            status === 'completed' ? 'bg-success-300' : 'bg-secondary-200'
          )}
        />
      )}

      {/* Phase Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          'relative flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer',
          phaseStatusStyles[status],
          'hover:shadow-sm'
        )}
      >
        {/* Phase Icon */}
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
            phaseIconStyles[status]
          )}
        >
          {status === 'completed' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {status === 'active' && <div className="w-3 h-3 rounded-full bg-current" />}
          {status === 'accessible' && (
            <div className="w-3 h-3 rounded-full border-2 border-current" />
          )}
          {status === 'locked' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Phase Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className={cn('font-semibold', phaseTitleStyles[status])}>
                {PHASE_LABELS[phaseItem.phase]}
              </h3>
              {isLocked && (
                <span className="text-xs bg-secondary-200 text-secondary-600 px-2 py-0.5 rounded-full">
                  Pro
                </span>
              )}
            </div>
            <svg
              className={cn(
                'w-5 h-5 text-secondary-400 transition-transform duration-200',
                isExpanded && 'rotate-180'
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
          </div>

          <p className="text-sm text-secondary-500 mt-1">{PHASE_DESCRIPTIONS[phaseItem.phase]}</p>

          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className={phaseTitleStyles[status]}>
              {phaseItem.completedCount} of {phaseItem.moduleCount} modules
            </span>
            <span className="text-secondary-400">~{phaseItem.totalHours}h</span>
          </div>
        </div>
      </div>

      {/* Module List */}
      <ModulesList
        modules={phaseItem.modules}
        isExpanded={isExpanded}
        isPhaseAccessible={phaseItem.isAccessible}
        currentModuleId={currentModuleId}
        onModuleClick={onModuleClick}
      />
    </div>
  );
}

interface ModulesListProps {
  modules: RoadmapModuleWithSkill[];
  isExpanded: boolean;
  isPhaseAccessible: boolean;
  currentModuleId?: string;
  onModuleClick?: (moduleId: string, isAccessible: boolean) => void;
}

const moduleStatusStyles: Record<ProgressStatus | 'locked', string> = {
  completed: 'bg-success-500 border-success-500',
  in_progress: 'bg-primary-500 border-primary-500',
  not_started: 'bg-white border-secondary-300',
  skipped: 'bg-secondary-300 border-secondary-300',
  locked: 'bg-secondary-100 border-secondary-200',
};

const moduleTextStyles: Record<ProgressStatus | 'locked', string> = {
  completed: 'text-success-700',
  in_progress: 'text-primary-700 font-medium',
  not_started: 'text-secondary-700',
  skipped: 'text-secondary-400 line-through',
  locked: 'text-secondary-400',
};

function ModulesList({
  modules,
  isExpanded,
  isPhaseAccessible,
  currentModuleId,
  onModuleClick,
}: ModulesListProps) {
  if (!isExpanded) return null;

  const getModuleStatus = (module: RoadmapModuleWithSkill): ProgressStatus | 'locked' => {
    if (!isPhaseAccessible || module.isLocked) return 'locked';
    if (!module.progress) return 'not_started';
    return module.progress.status;
  };

  return (
    <div className="pl-14 pt-2 pb-1">
      <ul className="space-y-1">
        {modules.map((module, index) => {
          const status = getModuleStatus(module);
          const isCurrent = module.id === currentModuleId;
          const isAccessible = isPhaseAccessible && !module.isLocked;

          return (
            <li
              key={module.id}
              className={cn(
                'relative flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200',
                isCurrent && 'bg-primary-50 ring-1 ring-primary-200',
                isAccessible && 'cursor-pointer hover:bg-secondary-50',
                !isAccessible && 'cursor-default'
              )}
              onClick={() => onModuleClick?.(module.id, isAccessible)}
              role={isAccessible ? 'button' : undefined}
              tabIndex={isAccessible ? 0 : -1}
              onKeyDown={(e) => {
                if (isAccessible && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onModuleClick?.(module.id, true);
                }
              }}
            >
              {/* Status indicator */}
              <div
                className={cn(
                  'w-3 h-3 rounded-full border-2 shrink-0',
                  moduleStatusStyles[status],
                  isCurrent && 'ring-2 ring-primary-200 ring-offset-1'
                )}
              />

              {/* Module info */}
              <div className="flex-1 min-w-0">
                <span className={cn('text-sm truncate block', moduleTextStyles[status])}>
                  {index + 1}. {module.skill.name}
                </span>
              </div>

              {/* Time or lock indicator */}
              {isAccessible ? (
                <span className="text-xs text-secondary-400 shrink-0">
                  {module.skill.estimatedHours}h
                </span>
              ) : (
                <svg
                  className="w-4 h-4 text-secondary-400 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </li>
          );
        })}
      </ul>

      {/* Locked phase message */}
      {!isPhaseAccessible && modules.length > 0 && (
        <div className="mt-3 p-3 bg-secondary-100 rounded-lg text-center">
          <p className="text-sm text-secondary-600">
            Upgrade to Pro to unlock {modules.length} module
            {modules.length !== 1 ? 's' : ''} in this phase
          </p>
        </div>
      )}
    </div>
  );
}
