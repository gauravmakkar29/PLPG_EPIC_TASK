import { useState } from 'react';
import { PREREQUISITE_SKILLS } from '@plpg/shared';
import { cn } from '../../lib/utils';

interface Step4ExistingSkillsProps {
  initialValue: string[];
  onNext: (data: { existingSkills: string[] }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function Step4ExistingSkills({
  initialValue,
  onNext,
  onBack,
  isLoading = false,
}: Step4ExistingSkillsProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialValue);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const handleToggleSkill = (skillValue: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillValue)
        ? prev.filter((s) => s !== skillValue)
        : [...prev, skillValue]
    );
  };

  const handleSelectAll = () => {
    setSelectedSkills(PREREQUISITE_SKILLS.map((s) => s.value));
  };

  const handleClearAll = () => {
    setSelectedSkills([]);
  };

  const handleSubmit = () => {
    onNext({ existingSkills: selectedSkills });
  };

  const allSelected = selectedSkills.length === PREREQUISITE_SKILLS.length;
  const noneSelected = selectedSkills.length === 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-secondary-900">What do you already know?</h2>
        <p className="mt-2 text-secondary-600">
          Select skills you're already comfortable with - we'll adjust your learning path accordingly
        </p>
      </div>

      {/* Select All / Clear All shortcuts */}
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={allSelected || isLoading}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            allSelected
              ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
              : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
          )}
        >
          Select All
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          disabled={noneSelected || isLoading}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            noneSelected
              ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
              : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'
          )}
        >
          Clear All
        </button>
      </div>

      {/* Skills checklist */}
      <div className="space-y-3">
        {PREREQUISITE_SKILLS.map((skill) => {
          const isSelected = selectedSkills.includes(skill.value);
          const isExpanded = expandedSkill === skill.value;

          return (
            <div
              key={skill.value}
              className={cn(
                'rounded-xl border-2 transition-all duration-200 overflow-hidden',
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-200 hover:border-primary-200 bg-white'
              )}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleSkill(skill.value)}
                    disabled={isLoading}
                    className={cn(
                      'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0',
                      isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-secondary-300 hover:border-primary-400'
                    )}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Label and description toggle */}
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSkill(skill.value)}
                      disabled={isLoading}
                      className="text-left w-full"
                    >
                      <div className="font-semibold text-secondary-900">{skill.label}</div>
                    </button>
                  </div>

                  {/* Info button for description */}
                  <button
                    type="button"
                    onClick={() => setExpandedSkill(isExpanded ? null : skill.value)}
                    className={cn(
                      'p-1.5 rounded-full transition-colors flex-shrink-0',
                      isExpanded
                        ? 'bg-primary-100 text-primary-600'
                        : 'hover:bg-secondary-100 text-secondary-400'
                    )}
                    aria-label={`${isExpanded ? 'Hide' : 'Show'} description for ${skill.label}`}
                  >
                    <svg
                      className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-180')}
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
                  </button>
                </div>
              </div>

              {/* Expandable description */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="pl-9 text-sm text-secondary-600 bg-secondary-50 rounded-lg p-3">
                    {skill.description}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* "Not sure" hint */}
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <div className="font-medium text-yellow-800">Not sure about a skill?</div>
            <div className="text-sm text-yellow-700 mt-1">
              When in doubt, leave it unchecked. It's better to review familiar content briefly than to skip something important.
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-secondary-500">
        {selectedSkills.length === 0 ? (
          <span>No skills selected - you'll start from the beginning</span>
        ) : (
          <span>
            <span className="font-semibold text-primary-600">{selectedSkills.length}</span>{' '}
            {selectedSkills.length === 1 ? 'skill' : 'skills'} selected to skip
          </span>
        )}
      </div>

      {/* Navigation buttons */}
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
          {isLoading ? 'Saving...' : 'Next'}
        </button>
      </div>
    </div>
  );
}
