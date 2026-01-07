import { useState, useMemo } from 'react';
import { TARGET_ROLES } from '@plpg/shared';
import { cn } from '../../lib/utils';

interface Step3WeeklyTimeProps {
  initialValue: number | null;
  onComplete: (data: { weeklyHours: number }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const MIN_HOURS = 5;
const MAX_HOURS = 20;
const DEFAULT_HOURS = 10;
const RECOMMENDED_MIN = 10;
const RECOMMENDED_MAX = 15;

// Get ML Engineer estimated hours from TARGET_ROLES
const ML_ENGINEER_TOTAL_HOURS = TARGET_ROLES.find(r => r.value === 'ml_engineer')?.estimatedHours ?? 200;

export default function Step3WeeklyTime({
  initialValue,
  onComplete,
  onBack,
  isLoading = false,
}: Step3WeeklyTimeProps) {
  const [weeklyHours, setWeeklyHours] = useState<number>(initialValue ?? DEFAULT_HOURS);
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate estimated weeks to completion
  const estimatedWeeks = useMemo(() => {
    return Math.ceil(ML_ENGINEER_TOTAL_HOURS / weeklyHours);
  }, [weeklyHours]);

  // Calculate estimated completion date
  const estimatedCompletionDate = useMemo(() => {
    const today = new Date();
    const completionDate = new Date(today.getTime() + estimatedWeeks * 7 * 24 * 60 * 60 * 1000);
    return completionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [estimatedWeeks]);

  // Check if current value is in recommended range
  const isInRecommendedRange = weeklyHours >= RECOMMENDED_MIN && weeklyHours <= RECOMMENDED_MAX;

  // Calculate slider position percentage for visual indicators
  const sliderPosition = ((weeklyHours - MIN_HOURS) / (MAX_HOURS - MIN_HOURS)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeeklyHours(parseInt(e.target.value, 10));
  };

  const handleSubmit = () => {
    onComplete({ weeklyHours });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900">How much time can you commit?</h2>
        <p className="mt-2 text-secondary-600">We'll adjust your learning pace accordingly</p>
      </div>

      {/* Current Hours Display */}
      <div className="text-center">
        <div className="text-5xl font-bold text-primary-600">{weeklyHours}</div>
        <div className="text-lg text-secondary-600">hours per week</div>
      </div>

      {/* Slider Container */}
      <div className="px-2">
        {/* Recommended Range Indicator */}
        <div className="relative h-2 mb-2">
          <div className="absolute inset-0 bg-secondary-100 rounded-full" />
          {/* Recommended range highlight */}
          <div
            className="absolute h-full bg-green-200 rounded-full"
            style={{
              left: `${((RECOMMENDED_MIN - MIN_HOURS) / (MAX_HOURS - MIN_HOURS)) * 100}%`,
              width: `${((RECOMMENDED_MAX - RECOMMENDED_MIN) / (MAX_HOURS - MIN_HOURS)) * 100}%`,
            }}
          />
        </div>

        {/* Slider Input */}
        <input
          type="range"
          min={MIN_HOURS}
          max={MAX_HOURS}
          step={1}
          value={weeklyHours}
          onChange={handleSliderChange}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${sliderPosition}%, #e5e7eb ${sliderPosition}%, #e5e7eb 100%)`,
          }}
        />

        {/* Min/Max Labels */}
        <div className="flex justify-between mt-2 text-sm text-secondary-500">
          <span>{MIN_HOURS} hrs</span>
          <span>{MAX_HOURS} hrs</span>
        </div>

        {/* Recommended Range Label */}
        <div className="text-center mt-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
              isInRecommendedRange
                ? 'bg-green-100 text-green-700'
                : 'bg-secondary-100 text-secondary-600'
            )}
          >
            {isInRecommendedRange ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Recommended range
              </>
            ) : (
              'Recommended: 10-15 hours/week'
            )}
          </span>
        </div>
      </div>

      {/* Estimated Completion Display */}
      <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-primary-600 font-medium">Estimated completion</div>
            <div className="text-lg font-semibold text-primary-900">
              ~{estimatedWeeks} weeks ({estimatedCompletionDate})
            </div>
          </div>
          {/* Tooltip Trigger */}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="p-1 rounded-full hover:bg-primary-100 transition-colors"
              aria-label="More information about timeline"
            >
              <svg
                className="w-5 h-5 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-secondary-900 text-white text-sm rounded-lg shadow-lg z-10">
                <p>This affects your completion timeline. More hours per week means faster progress!</p>
                <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-secondary-900" />
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-primary-600">
          At {weeklyHours} hours/week, you'll complete in approximately {estimatedWeeks} weeks
        </p>
      </div>

      {/* Navigation Buttons */}
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
          disabled={isLoading}
          className={cn(
            'flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200',
            !isLoading
              ? 'bg-primary-500 hover:bg-primary-600'
              : 'bg-secondary-300 cursor-not-allowed'
          )}
        >
          {isLoading ? 'Finishing...' : 'Complete Setup'}
        </button>
      </div>

      {/* Custom Slider Styles */}
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          margin-top: -8px;
        }

        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 4px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
        }

        .slider-thumb::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
