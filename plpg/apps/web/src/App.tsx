import { Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

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
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
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
      publishableKey={clerkPubKey}
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
