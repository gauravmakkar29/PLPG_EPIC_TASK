import { cn } from '../../../lib/utils';
import type { Phase } from '@plpg/shared';
import { PHASE_LABELS, PHASE_DESCRIPTIONS } from '@plpg/shared';

export type PhaseStatus = 'completed' | 'active' | 'locked' | 'pending';

export interface PhaseItemProps {
  phase: Phase;
  status: PhaseStatus;
  completedModules: number;
  totalModules: number;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const statusIcons: Record<PhaseStatus, React.ReactNode> = {
  completed: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  active: (
    <div className="w-3 h-3 rounded-full bg-current" />
  ),
  locked: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  pending: (
    <div className="w-3 h-3 rounded-full border-2 border-current" />
  ),
};

const statusStyles: Record<PhaseStatus, string> = {
  completed: 'text-success-600 bg-success-50 border-success-200',
  active: 'text-primary-600 bg-primary-50 border-primary-200',
  locked: 'text-secondary-400 bg-secondary-50 border-secondary-200',
  pending: 'text-secondary-400 bg-secondary-50 border-secondary-200',
};

const iconContainerStyles: Record<PhaseStatus, string> = {
  completed: 'bg-success-100 text-success-600',
  active: 'bg-primary-100 text-primary-600',
  locked: 'bg-secondary-100 text-secondary-400',
  pending: 'bg-secondary-100 text-secondary-400',
};

export function PhaseItem({
  phase,
  status,
  completedModules,
  totalModules,
  isExpanded,
  onToggle,
  children,
}: PhaseItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  const isClickable = status !== 'locked';

  return (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-secondary-200" />

      <div
        role="button"
        tabIndex={isClickable ? 0 : -1}
        aria-expanded={isExpanded}
        aria-disabled={!isClickable}
        onClick={isClickable ? onToggle : undefined}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        className={cn(
          'relative flex items-start gap-3 p-3 rounded-lg border transition-all duration-200',
          statusStyles[status],
          isClickable && 'cursor-pointer hover:shadow-sm',
          !isClickable && 'cursor-not-allowed opacity-75'
        )}
      >
        {/* Status Icon */}
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full shrink-0 z-10',
            iconContainerStyles[status]
          )}
        >
          {statusIcons[status]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              'font-semibold text-sm',
              status === 'completed' && 'text-success-700',
              status === 'active' && 'text-primary-700',
              (status === 'locked' || status === 'pending') && 'text-secondary-500'
            )}>
              {PHASE_LABELS[phase]}
            </h3>
            {/* Expand/collapse chevron */}
            {isClickable && (
              <svg
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
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
            )}
          </div>

          <p className={cn(
            'text-xs mt-0.5',
            status === 'completed' && 'text-success-600',
            status === 'active' && 'text-primary-600',
            (status === 'locked' || status === 'pending') && 'text-secondary-400'
          )}>
            {PHASE_DESCRIPTIONS[phase]}
          </p>

          {/* Progress count */}
          <p className={cn(
            'text-xs font-medium mt-2',
            status === 'completed' && 'text-success-600',
            status === 'active' && 'text-primary-600',
            (status === 'locked' || status === 'pending') && 'text-secondary-400'
          )}>
            {completedModules} of {totalModules} modules complete
          </p>
        </div>
      </div>

      {/* Module list (children) */}
      {children}
    </div>
  );
}
