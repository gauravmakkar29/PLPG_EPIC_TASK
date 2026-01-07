import { SignUp as ClerkSignUp, useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { track } from '../lib/analytics';

export default function SignUp() {
  const { isSignedIn } = useAuth();

  // Track signup_started when component mounts (user views signup form)
  useEffect(() => {
    if (!isSignedIn) {
      track('signup_started', {
        page_path: '/sign-up',
        timestamp: new Date().toISOString(),
      });
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      <div className="w-full max-w-md">
        <ClerkSignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/onboarding"
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
          // - Email/password registration (available by default)
          // - "Continue with Google" OAuth button (configured in Clerk Dashboard)
          // - Password requirements (8+ chars, 1 uppercase, 1 number) - configured in Clerk Dashboard
          // - Email format validation (built-in)
          // - Duplicate email error messages (built-in)
          // The registerSchema from @plpg/shared/validation is used for backend validation
        />
      </div>
    </div>
  );
}

