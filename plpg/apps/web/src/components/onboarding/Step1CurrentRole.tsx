import { useState } from 'react';
import { CURRENT_ROLES } from '@plpg/shared';
import { cn } from '../../lib/utils';

interface Step1CurrentRoleProps {
  initialValue: string | null;
  initialCustomRole?: string | null;
  onNext: (data: { currentRole: string; customRole?: string }) => void;
  isLoading?: boolean;
}

export default function Step1CurrentRole({
  initialValue,
  initialCustomRole,
  onNext,
  isLoading = false
}: Step1CurrentRoleProps) {
  const [selectedRole, setSelectedRole] = useState<string>(initialValue || '');
  const [customRole, setCustomRole] = useState<string>(initialCustomRole || '');

  const handleRoleSelect = (roleValue: string) => {
    setSelectedRole(roleValue);
    // Clear custom role if not selecting "other"
    if (roleValue !== 'other') {
      setCustomRole('');
    }
  };

  const handleCustomRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomRole(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedRole) {
      if (selectedRole === 'other' && customRole.trim()) {
        onNext({ currentRole: selectedRole, customRole: customRole.trim() });
      } else if (selectedRole !== 'other') {
        onNext({ currentRole: selectedRole });
      }
    }
  };

  // Validation: button should be enabled only if a valid selection is made
  const isValidSelection = selectedRole && (selectedRole !== 'other' || customRole.trim().length > 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900">What's your current role?</h2>
        <p className="mt-2 text-secondary-600">Help us understand where you're starting from</p>
      </div>

      <div className="grid gap-3">
        {CURRENT_ROLES.map((role) => (
          <div key={role.value}>
            <button
              type="button"
              onClick={() => handleRoleSelect(role.value)}
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
            {/* Show text input when "Other" is selected */}
            {role.value === 'other' && selectedRole === 'other' && (
              <div className="mt-3 ml-4">
                <input
                  type="text"
                  value={customRole}
                  onChange={handleCustomRoleChange}
                  placeholder="Please specify your role..."
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border-2 transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    'border-secondary-200 bg-white text-secondary-900 placeholder-secondary-400'
                  )}
                  autoFocus
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValidSelection || isLoading}
        className={cn(
          'w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200',
          isValidSelection && !isLoading
            ? 'bg-primary-500 hover:bg-primary-600'
            : 'bg-secondary-300 cursor-not-allowed'
        )}
      >
        {isLoading ? 'Saving...' : 'Continue'}
      </button>
    </div>
  );
}
