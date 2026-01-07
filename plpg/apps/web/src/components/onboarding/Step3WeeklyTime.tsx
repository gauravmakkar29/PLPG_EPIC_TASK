import { useState } from 'react';
import { WEEKLY_HOURS_OPTIONS } from '@plpg/shared';
import { cn } from '../../lib/utils';

interface Step3WeeklyTimeProps {
  initialValue: number | null;
  onComplete: (data: { weeklyHours: number }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function Step3WeeklyTime({
  initialValue,
  onComplete,
  onBack,
  isLoading = false,
}: Step3WeeklyTimeProps) {
  const [selectedHours, setSelectedHours] = useState<number | null>(initialValue);

  const handleSubmit = () => {
    if (selectedHours !== null) {
      onComplete({ weeklyHours: selectedHours });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900">How much time can you commit?</h2>
        <p className="mt-2 text-secondary-600">We'll adjust your learning pace accordingly</p>
      </div>

      <div className="grid gap-3">
        {WEEKLY_HOURS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelectedHours(option.value)}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
              selectedHours === option.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 hover:border-primary-200 hover:bg-secondary-50'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-secondary-900">{option.label}</div>
                <div className="text-sm text-secondary-500">{option.description}</div>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  selectedHours === option.value ? 'border-primary-500 bg-primary-500' : 'border-secondary-300'
                )}
              >
                {selectedHours === option.value && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-3 px-6 rounded-xl font-semibold border-2 border-secondary-200 text-secondary-700 hover:bg-secondary-50 transition-all duration-200 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedHours === null || isLoading}
          className={cn(
            'flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200',
            selectedHours !== null && !isLoading
              ? 'bg-primary-500 hover:bg-primary-600'
              : 'bg-secondary-300 cursor-not-allowed'
          )}
        >
          {isLoading ? 'Finishing...' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
}
