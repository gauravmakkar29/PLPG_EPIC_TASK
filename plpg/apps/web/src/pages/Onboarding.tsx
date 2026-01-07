import { useNavigate } from 'react-router-dom';
import { ONBOARDING_TOTAL_STEPS } from '@plpg/shared';
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import Step1CurrentRole from '../components/onboarding/Step1CurrentRole';
import Step2TargetRole from '../components/onboarding/Step2TargetRole';
import Step3WeeklyTime from '../components/onboarding/Step3WeeklyTime';
import Step4ExistingSkills from '../components/onboarding/Step4ExistingSkills';
import Step5Summary from '../components/onboarding/Step5Summary';
import { useOnboardingState, useSaveStep, useSkipOnboarding, useCompleteOnboarding, useGotoStep } from '../hooks/useOnboarding';
import { track } from '../lib/analytics';

export default function Onboarding() {
  const navigate = useNavigate();
  const { data: onboardingState, isLoading: isLoadingState } = useOnboardingState();
  const saveStep = useSaveStep();
  const skipOnboarding = useSkipOnboarding();
  const completeOnboarding = useCompleteOnboarding();
  const gotoStep = useGotoStep();

  const currentStep = onboardingState?.currentStep || 1;

  const handleSkip = () => {
    skipOnboarding.mutate(undefined, {
      onSuccess: () => {
        navigate('/dashboard');
      },
    });
  };

  const handleStep1Next = (data: { currentRole: string; customRole?: string }) => {
    saveStep.mutate({ step: 1, data });
  };

  const handleStep2Next = (data: { targetRole: string }) => {
    saveStep.mutate({ step: 2, data });
  };

  const handleStep2Back = () => {
    // Navigate back to step 1 - the state already has the data
    saveStep.mutate({ step: 1, data: { currentRole: onboardingState?.data.currentRole || '' } });
  };

  const handleStep3Back = () => {
    // Navigate back to step 2 - the state already has the data
    saveStep.mutate({ step: 2, data: { targetRole: onboardingState?.data.targetRole || '' } });
  };

  const handleStep3Next = (data: { weeklyHours: number }) => {
    // Save step 3 data and move to step 4 (existing skills)
    saveStep.mutate({ step: 3, data });
  };

  const handleStep4Back = () => {
    // Navigate back to step 3 - the state already has the data
    saveStep.mutate({ step: 3, data: { weeklyHours: onboardingState?.data.weeklyHours || 10 } });
  };

  const handleStep4Next = (data: { existingSkills: string[] }) => {
    // Save step 4 data and move to step 5 (summary)
    saveStep.mutate({ step: 4, data });
  };

  const handleStep5Edit = (step: number) => {
    // Navigate back to a specific step for editing
    gotoStep.mutate(step);
  };

  const handleGeneratePath = () => {
    // Track analytics event before completing
    track('onboarding_completed', {
      currentRole: onboardingState?.data.currentRole,
      targetRole: onboardingState?.data.targetRole,
      weeklyHours: onboardingState?.data.weeklyHours,
      existingSkillsCount: onboardingState?.data.existingSkills?.length || 0,
    });

    completeOnboarding.mutate(undefined, {
      onSuccess: () => {
        track('roadmap_generated', {
          currentRole: onboardingState?.data.currentRole,
          targetRole: onboardingState?.data.targetRole,
        });
        navigate('/dashboard');
      },
    });
  };

  if (isLoadingState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If onboarding is complete, redirect to dashboard
  if (onboardingState?.isComplete || onboardingState?.isSkipped) {
    navigate('/dashboard');
    return null;
  }

  const isStepLoading = saveStep.isPending || skipOnboarding.isPending || completeOnboarding.isPending || gotoStep.isPending;

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onSkip={handleSkip}
      isSkipping={skipOnboarding.isPending}
    >
      {currentStep === 1 && (
        <Step1CurrentRole
          initialValue={onboardingState?.data.currentRole || null}
          initialCustomRole={onboardingState?.data.customRole || null}
          onNext={handleStep1Next}
          isLoading={isStepLoading}
        />
      )}

      {currentStep === 2 && (
        <Step2TargetRole
          initialValue={onboardingState?.data.targetRole || null}
          onNext={handleStep2Next}
          onBack={handleStep2Back}
          isLoading={isStepLoading}
        />
      )}

      {currentStep === 3 && (
        <Step3WeeklyTime
          initialValue={onboardingState?.data.weeklyHours || null}
          onComplete={handleStep3Next}
          onBack={handleStep3Back}
          isLoading={isStepLoading}
        />
      )}

      {currentStep === 4 && (
        <Step4ExistingSkills
          initialValue={onboardingState?.data.existingSkills || []}
          onNext={handleStep4Next}
          onBack={handleStep4Back}
          isLoading={isStepLoading}
        />
      )}

      {currentStep === 5 && (
        <Step5Summary
          currentRole={onboardingState?.data.currentRole || null}
          customRole={onboardingState?.data.customRole || null}
          targetRole={onboardingState?.data.targetRole || null}
          weeklyHours={onboardingState?.data.weeklyHours || null}
          existingSkills={onboardingState?.data.existingSkills || []}
          onEdit={handleStep5Edit}
          onComplete={handleGeneratePath}
          isLoading={isStepLoading}
        />
      )}
    </OnboardingLayout>
  );
}
