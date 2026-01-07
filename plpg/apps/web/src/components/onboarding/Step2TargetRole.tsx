import { useState } from 'react';
import { TARGET_ROLES } from '@plpg/shared';
import { cn } from '../../lib/utils';

interface Step2TargetRoleProps {
  initialValue: string | null;
  onNext: (data: { targetRole: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function Step2TargetRole({
  initialValue,
  onNext,
  onBack,
  isLoading = false,
}: Step2TargetRoleProps) {
  const [selectedRole, setSelectedRole] = useState<string>(initialValue || '');

  const handleRoleSelect = (roleValue: string, isAvailable: boolean) => {
    if (isAvailable) {
      setSelectedRole(roleValue);
    }
  };

  const handleSubmit = () => {
    if (selectedRole) {
      onNext({ targetRole: selectedRole });
    }
  };

  const selectedRoleData = TARGET_ROLES.find((r) => r.value === selectedRole);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900">What role do you want?</h2>
        <p className="mt-2 text-secondary-600">We'll create a personalized path to get you there</p>
      </div>

      <div className="grid gap-3">
        {TARGET_ROLES.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => handleRoleSelect(role.value, role.isAvailable)}
            disabled={!role.isAvailable}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
              selectedRole === role.value
                ? 'border-primary-500 bg-primary-50'
                : role.isAvailable
                  ? 'border-secondary-200 hover:border-primary-200 hover:bg-secondary-50'
                  : 'border-secondary-100 bg-secondary-50 cursor-not-allowed opacity-60'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-secondary-900">{role.label}</span>
                  {!role.isAvailable && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-secondary-200 text-secondary-600 rounded-full">
                      Coming soon
                    </span>
                  )}
                </div>
                <div className="text-sm text-secondary-500">{role.description}</div>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ml-3',
                  selectedRole === role.value
                    ? 'border-primary-500 bg-primary-500'
                    : role.isAvailable
                      ? 'border-secondary-300'
                      : 'border-secondary-200'
                )}
              >
                {selectedRole === role.value && (
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

      {/* Role Details Panel - shown when a role is selected */}
      {selectedRoleData && selectedRoleData.isAvailable && selectedRoleData.estimatedHours && (
        <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
          <h3 className="font-semibold text-primary-900 mb-3">
            {selectedRoleData.label} Learning Path
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-primary-700">
              <span className="font-medium">Estimated time:</span> ~{selectedRoleData.estimatedHours}{' '}
              hours
            </span>
          </div>

          {selectedRoleData.outcomes && (
            <div>
              <p className="text-sm font-medium text-primary-800 mb-2">What you'll learn:</p>
              <ul className="space-y-1.5">
                {selectedRoleData.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-primary-700">
                    <svg
                      className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
          disabled={!selectedRole || isLoading}
          className={cn(
            'flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200',
            selectedRole && !isLoading
              ? 'bg-primary-500 hover:bg-primary-600'
              : 'bg-secondary-300 cursor-not-allowed'
          )}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
