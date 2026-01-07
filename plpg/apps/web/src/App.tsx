import { Routes, Route } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import { ProfilePage } from './pages/Settings/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import OnboardingGuard from './components/OnboardingGuard';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if it's a placeholder or empty - if so, this component shouldn't be used
// (DevApp should be used instead via main.tsx)
const isPlaceholderOrEmpty = !clerkPubKey || 
                              clerkPubKey === 'pk_test_...' || 
                              clerkPubKey === 'pk_test_placeholder' ||
                              (typeof clerkPubKey === 'string' && clerkPubKey.includes('placeholder'));

// Never throw error - main.tsx handles routing to DevApp for placeholders/empty keys
// Provide a safe default to prevent Clerk errors if App.tsx is accidentally used
const safeClerkKey = isPlaceholderOrEmpty || !clerkPubKey 
  ? 'pk_test_placeholder' 
  : clerkPubKey;

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-secondary-600">Loading...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <Dashboard />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <Settings />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/profile"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfilePage />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ClerkProvider
      publishableKey={safeClerkKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
    >
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
