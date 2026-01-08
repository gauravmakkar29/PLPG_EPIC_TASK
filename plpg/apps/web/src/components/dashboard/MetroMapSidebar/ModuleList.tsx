import { useRef, useEffect, useState } from 'react';
import { cn } from '../../../lib/utils';
import type { RoadmapModuleWithSkill, ProgressStatus } from '@plpg/shared';

export interface ModuleListProps {
  modules: RoadmapModuleWithSkill[];
  isExpanded: boolean;
  currentModuleId?: string;
  onModuleClick?: (moduleId: string) => void;
}

const moduleStatusStyles: Record<ProgressStatus | 'locked', string> = {
  completed: 'bg-success-500 border-success-500',
  in_progress: 'bg-primary-500 border-primary-500 animate-pulse',
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

export function ModuleList({
  modules,
  isExpanded,
  currentModuleId,
  onModuleClick,
}: ModuleListProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, modules]);

  const getModuleStatus = (module: RoadmapModuleWithSkill): ProgressStatus | 'locked' => {
    if (module.isLocked) return 'locked';
    if (!module.progress) return 'not_started';
    return module.progress.status;
  };

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ height: `${height}px` }}
    >
      <div ref={contentRef} className="pl-10 pt-2 pb-1">
        <ul className="space-y-1">
          {modules.map((module, index) => {
            const status = getModuleStatus(module);
            const isCurrent = module.id === currentModuleId;
            const isClickable = !module.isLocked;

            return (
              <li
                key={module.id}
                className={cn(
                  'relative flex items-center gap-2 py-1.5 px-2 rounded transition-all duration-200',
                  isCurrent && 'bg-primary-50',
                  isClickable && 'cursor-pointer hover:bg-secondary-50',
                  !isClickable && 'cursor-not-allowed'
                )}
                onClick={isClickable && onModuleClick ? () => onModuleClick(module.id) : undefined}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : -1}
                onKeyDown={(e) => {
                  if (isClickable && onModuleClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onModuleClick(module.id);
                  }
                }}
              >
                {/* Connection dot */}
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full border-2 shrink-0',
                    moduleStatusStyles[status],
                    isCurrent && 'ring-2 ring-primary-200'
                  )}
                />

                {/* Module name */}
                <span
                  className={cn(
                    'text-xs truncate',
                    moduleTextStyles[status],
                    isCurrent && 'font-semibold'
                  )}
                >
                  {index + 1}. {module.skill.name}
                </span>

                {/* Time estimate */}
                {!module.isLocked && (
                  <span className="text-xs text-secondary-400 ml-auto shrink-0">
                    {module.skill.estimatedHours}h
                  </span>
                )}

                {/* Lock icon for locked modules */}
                {module.isLocked && (
                  <svg
                    className="w-3 h-3 text-secondary-400 ml-auto shrink-0"
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
      </div>
    </div>
  );
}
