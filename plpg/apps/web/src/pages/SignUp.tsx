import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      <div className="w-full max-w-md">
        <ClerkSignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  );
}

