import { useNavigate, useSearchParams } from 'react-router-dom';
import { ONBOARDING_TOTAL_STEPS } from '@plpg/shared';
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import Step1CurrentRole from '../components/onboarding/Step1CurrentRole';
import Step2TargetRole from '../components/onboarding/Step2TargetRole';
import Step3WeeklyTime from '../components/onboarding/Step3WeeklyTime';
import Step4Summary from '../components/onboarding/Step4Summary';
import { useOnboardingState, useSaveStep, useSkipOnboarding, useCompleteOnboarding, useGotoStep, useRestartOnboarding } from '../hooks/useOnboarding';
import { track } from '../lib/analytics';

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const { data: onboardingState, isLoading: isLoadingState } = useOnboardingState();
  const saveStep = useSaveStep();
  const skipOnboarding = useSkipOnboarding();
  const completeOnboarding = useCompleteOnboarding();
  const gotoStep = useGotoStep();
  const restartOnboarding = useRestartOnboarding();

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
    // Save step 3 data and move to step 4 (summary)
    saveStep.mutate({ step: 3, data });
  };

  const handleStep4Edit = (step: number) => {
    // Navigate back to a specific step for editing
    gotoStep.mutate(step);
  };

  const handleGeneratePath = () => {
    // Track analytics event before completing
    if (isEditMode) {
      track('preferences_updated', {
        currentRole: onboardingState?.data.currentRole,
        targetRole: onboardingState?.data.targetRole,
        weeklyHours: onboardingState?.data.weeklyHours,
        isReOnboarding: true,
      });
    } else {
      track('onboarding_completed', {
        currentRole: onboardingState?.data.currentRole,
        targetRole: onboardingState?.data.targetRole,
        weeklyHours: onboardingState?.data.weeklyHours,
      });
    }

    completeOnboarding.mutate(undefined, {
      onSuccess: () => {
        track('roadmap_generated', {
          currentRole: onboardingState?.data.currentRole,
          targetRole: onboardingState?.data.targetRole,
          isReOnboarding: isEditMode,
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

  // If onboarding is complete and not in edit mode, redirect to dashboard
  // In edit mode, allow users to go through onboarding again
  if ((onboardingState?.isComplete || onboardingState?.isSkipped) && !isEditMode) {
    navigate('/dashboard');
    return null;
  }

  // In edit mode, if onboarding is complete but we just entered, restart it
  if (isEditMode && (onboardingState?.isComplete || onboardingState?.isSkipped) && currentStep === 4) {
    // Restart onboarding to step 1 for editing
    restartOnboarding.mutate();
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
        <Step4Summary
          currentRole={onboardingState?.data.currentRole || null}
          customRole={onboardingState?.data.customRole || null}
          targetRole={onboardingState?.data.targetRole || null}
          weeklyHours={onboardingState?.data.weeklyHours || null}
          onEdit={handleStep4Edit}
          onComplete={handleGeneratePath}
          isLoading={isStepLoading}
          isEditMode={isEditMode}
        />
      )}
    </OnboardingLayout>
  );
}
