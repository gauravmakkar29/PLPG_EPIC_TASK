import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboardingState } from '../hooks/useOnboarding';

interface OnboardingGuardProps {
  children: ReactNode;
}

/**
 * Guard component that redirects users to onboarding if they haven't completed it.
 * Wrap protected routes that require onboarding completion with this component.
 */
export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { data: onboardingState, isLoading, isError } = useOnboardingState();

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // On error, let them through (we don't want to block users due to API issues)
  if (isError) {
    return <>{children}</>;
  }

  // If onboarding is not complete and not skipped, redirect to onboarding
  if (onboardingState && !onboardingState.isComplete && !onboardingState.isSkipped) {
    return <Navigate to="/onboarding" replace />;
  }

  // Onboarding complete or skipped, show the protected content
  return <>{children}</>;
}
