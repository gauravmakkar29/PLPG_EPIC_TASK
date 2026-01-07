import { useNavigate } from 'react-router-dom';
import { ONBOARDING_TOTAL_STEPS } from '@plpg/shared';
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import Step1CurrentRole from '../components/onboarding/Step1CurrentRole';
import Step2TargetRole from '../components/onboarding/Step2TargetRole';
import Step3WeeklyTime from '../components/onboarding/Step3WeeklyTime';
import { useOnboardingState, useSaveStep, useSkipOnboarding, useCompleteOnboarding } from '../hooks/useOnboarding';

export default function Onboarding() {
  const navigate = useNavigate();
  const { data: onboardingState, isLoading: isLoadingState } = useOnboardingState();
  const saveStep = useSaveStep();
  const skipOnboarding = useSkipOnboarding();
  const completeOnboarding = useCompleteOnboarding();

  const currentStep = onboardingState?.currentStep || 1;

  const handleSkip = () => {
    skipOnboarding.mutate(undefined, {
      onSuccess: () => {
        navigate('/dashboard');
      },
    });
  };

  const handleStep1Next = (data: { currentRole: string }) => {
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

  const handleComplete = (data: { weeklyHours: number }) => {
    saveStep.mutate(
      { step: 3, data },
      {
        onSuccess: () => {
          completeOnboarding.mutate(undefined, {
            onSuccess: () => {
              navigate('/dashboard');
            },
          });
        },
      }
    );
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

  const isStepLoading = saveStep.isPending || skipOnboarding.isPending || completeOnboarding.isPending;

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
          onComplete={handleComplete}
          onBack={handleStep3Back}
          isLoading={isStepLoading}
        />
      )}
    </OnboardingLayout>
  );
}
