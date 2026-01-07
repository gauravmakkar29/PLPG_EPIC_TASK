import { ReactNode } from 'react';
import ProgressIndicator from './ProgressIndicator';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onSkip: () => void;
  isSkipping?: boolean;
}

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  onSkip,
  isSkipping = false,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600">PLPG</h1>
          <button
            onClick={onSkip}
            disabled={isSkipping}
            className="text-secondary-500 hover:text-secondary-700 text-sm font-medium disabled:opacity-50"
          >
            {isSkipping ? 'Skipping...' : 'Skip for now'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Progress indicator */}
        <div className="w-full mb-8">
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* Step content */}
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-secondary-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-secondary-500">
          Your progress is automatically saved
        </div>
      </footer>
    </div>
  );
}
