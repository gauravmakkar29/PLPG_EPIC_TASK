import { SignIn as ClerkSignIn, useAuth } from '@clerk/clerk-react';
import { useEffect, useRef } from 'react';
import { track } from '../lib/analytics';

export default function SignIn() {
  const { isSignedIn } = useAuth();
  const hasTrackedLogin = useRef(false);

  // Track login completion when user successfully signs in
  useEffect(() => {
    if (isSignedIn && !hasTrackedLogin.current) {
      hasTrackedLogin.current = true;
      track('login_completed', {
        page_path: '/sign-in',
        timestamp: new Date().toISOString(),
      });
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      <div className="w-full max-w-md">
        <ClerkSignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg',
              headerTitle: 'text-2xl font-bold text-gray-900',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
              formButtonPrimary: 'bg-primary-600 hover:bg-primary-700 text-white',
              formFieldLabel: 'text-gray-700 font-medium',
              formFieldInput: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
              footerActionLink: 'text-primary-600 hover:text-primary-700',
            },
          }}
          // Clerk handles:
          // - Email/password login (available by default)
          // - "Continue with Google" for OAuth users (configured in Clerk Dashboard)
          // - Invalid credentials show generic error (security - built-in)
          // - "Forgot password?" link available (built-in) - enables password reset flow
          // - Password reset flow: email sent with reset link, password requirements enforced, redirects to sign-in after success
          // - Rate limiting for password reset handled by Clerk (built-in)
          // - "Remember me" handled by Clerk session persistence (built-in)
          // - Failed attempts: Clerk handles lockout (5 failures = 15 min) (configured in Clerk Dashboard)
          // - Success redirects to /dashboard (or /onboarding if incomplete via OnboardingGuard)
        />
      </div>
    </div>
  );
}

