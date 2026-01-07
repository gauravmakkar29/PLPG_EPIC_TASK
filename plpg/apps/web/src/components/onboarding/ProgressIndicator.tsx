import { cn } from '../../lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ['Current Role', 'Target Role', 'Time Budget'];

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {/* Connector line (before) */}
                {index > 0 && (
                  <div
                    className={cn(
                      'h-1 flex-1 transition-colors duration-200',
                      isCompleted || isCurrent ? 'bg-primary-500' : 'bg-secondary-200'
                    )}
                  />
                )}

                {/* Step circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200',
                    isCompleted && 'bg-primary-500 text-white',
                    isCurrent && 'bg-primary-500 text-white ring-4 ring-primary-100',
                    !isCompleted && !isCurrent && 'bg-secondary-200 text-secondary-500'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Connector line (after) */}
                {index < totalSteps - 1 && (
                  <div
                    className={cn(
                      'h-1 flex-1 transition-colors duration-200',
                      isCompleted ? 'bg-primary-500' : 'bg-secondary-200'
                    )}
                  />
                )}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center',
                  isCurrent ? 'text-primary-600' : 'text-secondary-500'
                )}
              >
                {STEP_LABELS[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
