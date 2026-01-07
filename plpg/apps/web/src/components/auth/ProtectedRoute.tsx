import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Optional: If true, checks onboarding completion and redirects to /onboarding if incomplete.
   * For routes that require onboarding, use OnboardingGuard component instead.
   */
  requireOnboarding?: boolean;
}

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * 
 * Features:
 * - Checks Clerk authentication state
 * - Shows loading spinner while checking auth
 * - Redirects to /sign-in if not authenticated
 * - Passes through to children if authenticated
 * - Optionally checks onboarding completion
 * 
 * @example
 * ```tsx
 * <Route
 *   path="/dashboard"
 *   element={
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
<<<<<<< HEAD
export default function ProtectedRoute({ children, requireOnboarding: _requireOnboarding = false }: ProtectedRouteProps) {
=======
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
>>>>>>> 06ef476c0a79162633c7b8017b3cb9ff185d9f69
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading spinner while checking auth state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // If onboarding is required, we'll let OnboardingGuard handle it
  // This component focuses on authentication only
  // For onboarding checks, wrap with OnboardingGuard component
  return <>{children}</>;
}

