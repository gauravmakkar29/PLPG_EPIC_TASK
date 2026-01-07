import { useState } from 'react';
import { CURRENT_ROLES, TARGET_ROLES, WEEKLY_HOURS_OPTIONS } from '@plpg/shared';
import { cn } from '../../lib/utils';

interface Step4SummaryProps {
  currentRole: string | null;
  customRole: string | null;
  targetRole: string | null;
  weeklyHours: number | null;
  onEdit: (step: number) => void;
  onComplete: () => void;
  isLoading?: boolean;
  isEditMode?: boolean;
}

export default function Step4Summary({
  currentRole,
  customRole,
  targetRole,
  weeklyHours,
  onEdit,
  onComplete,
  isLoading = false,
  isEditMode = false,
}: Step4SummaryProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const currentRoleData = CURRENT_ROLES.find((r) => r.value === currentRole);
  const targetRoleData = TARGET_ROLES.find((r) => r.value === targetRole);
  const weeklyHoursData = WEEKLY_HOURS_OPTIONS.find((h) => h.value === weeklyHours);

  const displayCurrentRole = currentRole === 'other' && customRole ? customRole : currentRoleData?.label || 'Not selected';
  const displayTargetRole = targetRoleData?.label || 'Not selected';
  const displayWeeklyHours = weeklyHoursData?.label || 'Not selected';

  const estimatedWeeks =
    targetRoleData?.estimatedHours && weeklyHours
      ? Math.ceil(targetRoleData.estimatedHours / weeklyHours)
      : null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900">Review Your Choices</h2>
        <p className="mt-2 text-secondary-600">
          Confirm your selections before we generate your personalized learning path
        </p>
      </div>

      <div className="space-y-4">
        {/* Current Role */}
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-secondary-500">Current Role</div>
                <div className="font-semibold text-secondary-900">{displayCurrentRole}</div>
              </div>
            </div>
            <button
              onClick={() => onEdit(1)}
              disabled={isLoading}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Target Role */}
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-secondary-500">Target Role</div>
                <div className="font-semibold text-secondary-900">{displayTargetRole}</div>
                {targetRoleData?.estimatedHours && (
                  <div className="text-xs text-secondary-400">~{targetRoleData.estimatedHours} hours of learning</div>
                )}
              </div>
            </div>
            <button
              onClick={() => onEdit(2)}
              disabled={isLoading}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Weekly Hours */}
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-secondary-500">Weekly Commitment</div>
                <div className="font-semibold text-secondary-900">{displayWeeklyHours}</div>
                {weeklyHoursData && (
                  <div className="text-xs text-secondary-400">{weeklyHoursData.description}</div>
                )}
              </div>
            </div>
            <button
              onClick={() => onEdit(3)}
              disabled={isLoading}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Estimated Completion */}
        {estimatedWeeks && (
          <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-xl border border-primary-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-secondary-500">Estimated Completion</div>
                <div className="font-semibold text-secondary-900">
                  ~{estimatedWeeks} weeks
                </div>
                <div className="text-xs text-secondary-400">
                  Based on your {weeklyHours} hours/week commitment
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills to Skip - placeholder for future implementation */}
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-secondary-500">Skills to Skip</div>
              <div className="font-semibold text-secondary-900">None</div>
              <div className="text-xs text-secondary-400">You can skip skills later during your journey</div>
            </div>
          </div>
        </div>

        {/* Warning message for edit mode */}
        {isEditMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Changing preferences will regenerate your roadmap
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Your progress on matching skills will be preserved, but you'll receive a new personalized learning path.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
          onClick={() => {
            if (isEditMode) {
              setShowConfirmDialog(true);
            } else {
              onComplete();
            }
          }}
          disabled={isLoading}
          className={cn(
            'w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all duration-200',
            !isLoading
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl'
              : 'bg-secondary-300 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {isEditMode ? 'Updating Your Path...' : 'Generating Your Path...'}
            </span>
          ) : (
            isEditMode ? 'Update My Path' : 'Generate My Path'
          )}
        </button>
        <p className="text-center text-sm text-secondary-500 mt-3">
          {isEditMode
            ? 'This will regenerate your personalized learning roadmap'
            : 'This will create your personalized learning roadmap'}
        </p>
      </div>

      {/* Confirmation Dialog for Edit Mode */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">Confirm Roadmap Regeneration</h3>
              </div>
            </div>

            <p className="text-secondary-600 mb-6">
              Are you sure you want to update your preferences? This will generate a new personalized learning path.
              <span className="block mt-2 text-sm text-green-600 font-medium">
                Your progress on matching skills will be preserved.
              </span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-3 px-4 rounded-lg border border-secondary-300 text-secondary-700 font-medium hover:bg-secondary-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  onComplete();
                }}
                className="flex-1 py-3 px-4 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
