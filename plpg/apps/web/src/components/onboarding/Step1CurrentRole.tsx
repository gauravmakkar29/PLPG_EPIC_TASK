import { useState } from 'react';
import { CURRENT_ROLES } from '@plpg/shared';
import { cn } from '../../lib/utils';

interface Step1CurrentRoleProps {
  initialValue: string | null;
  onNext: (data: { currentRole: string }) => void;
  isLoading?: boolean;
}

export default function Step1CurrentRole({ initialValue, onNext, isLoading = false }: Step1CurrentRoleProps) {
  const [selectedRole, setSelectedRole] = useState<string>(initialValue || '');

  const handleSubmit = () => {
    if (selectedRole) {
      onNext({ currentRole: selectedRole });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900">What's your current role?</h2>
        <p className="mt-2 text-secondary-600">Help us understand where you're starting from</p>
      </div>

      <div className="grid gap-3">
        {CURRENT_ROLES.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => setSelectedRole(role.value)}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
              selectedRole === role.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-200 hover:border-primary-200 hover:bg-secondary-50'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-secondary-900">{role.label}</div>
                <div className="text-sm text-secondary-500">{role.description}</div>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  selectedRole === role.value ? 'border-primary-500 bg-primary-500' : 'border-secondary-300'
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

      <button
        onClick={handleSubmit}
        disabled={!selectedRole || isLoading}
        className={cn(
          'w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200',
          selectedRole && !isLoading
            ? 'bg-primary-500 hover:bg-primary-600'
            : 'bg-secondary-300 cursor-not-allowed'
        )}
      >
        {isLoading ? 'Saving...' : 'Continue'}
      </button>
    </div>
  );
}
