import { useUser } from '@clerk/clerk-react';
import { useState } from 'react';

/**
 * EmailVerificationBanner component that displays a banner prompting users
 * to verify their email address if it's not verified.
 * 
 * Features:
 * - Only shows for unverified email addresses
 * - Provides a button to resend verification email
 * - Automatically hides when email is verified
 * - Uses warning styling to draw attention
 * 
 * @example
 * ```tsx
 * <EmailVerificationBanner />
 * ```
 */
export function EmailVerificationBanner() {
  const { user } = useUser();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Get primary email address
  const primaryEmail = user?.primaryEmailAddress;

  // Don't show banner if:
  // - User is not loaded
  // - No primary email exists
  // - Email is already verified
  if (!user || !primaryEmail || primaryEmail.verification.status === 'verified') {
    return null;
  }

  const handleResend = async () => {
    if (!primaryEmail) return;

    try {
      setIsResending(true);
      setResendSuccess(false);
      
      // Prepare verification email using Clerk's API
      await primaryEmail.prepareVerification({ 
        strategy: 'email_link',
        redirectUrl: window.location.origin + '/dashboard'
      });
      
      setResendSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error('Error resending verification email:', error);
      // In a production app, you might want to show an error toast here
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-warning-50 border-l-4 border-warning-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-warning-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-warning-800">
            <strong>Please verify your email address.</strong> We sent a verification email to{' '}
            <span className="font-medium">{primaryEmail.emailAddress}</span>. Please check your inbox and click the verification link.
          </p>
          {resendSuccess && (
            <p className="mt-2 text-sm text-success-600 font-medium">
              Verification email sent! Please check your inbox.
            </p>
          )}
          <div className="mt-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-warning-800 bg-warning-100 hover:bg-warning-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-warning-800"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                'Resend verification email'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

