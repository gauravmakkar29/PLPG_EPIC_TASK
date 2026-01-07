import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOnboardingState } from '../hooks/useOnboarding';
import { SignOutButton } from '../components/auth/SignOutButton';
import { EmailVerificationBanner } from '../components/auth/EmailVerificationBanner';

const CURRENT_ROLES: Record<string, string> = {
  'backend-developer': 'Backend Developer',
  'devops-engineer': 'DevOps Engineer',
  'data-analyst': 'Data Analyst',
  'qa-engineer': 'QA Engineer',
  'it-professional': 'IT Professional',
  'other': 'Other',
};

const TARGET_ROLES: Record<string, string> = {
  'ml-engineer': 'ML Engineer',
  'data-scientist': 'Data Scientist',
  'ai-researcher': 'AI Researcher',
  'mlops-engineer': 'MLOps Engineer',
  'nlp-engineer': 'NLP Engineer',
  'cv-engineer': 'Computer Vision Engineer',
};

const WEEKLY_HOURS: Record<number, string> = {
  5: '5 hours/week',
  10: '10 hours/week',
  15: '15 hours/week',
  20: '20 hours/week',
  30: '30+ hours/week',
};

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: onboardingState, isLoading: isLoadingOnboarding } = useOnboardingState();

  const handleEditPreferences = () => {
    navigate('/onboarding?edit=true');
  };

  const getCurrentRoleDisplay = () => {
    if (!onboardingState?.data.currentRole) return 'Not set';
    if (onboardingState.data.currentRole === 'other' && onboardingState.data.customRole) {
      return onboardingState.data.customRole;
    }
    return CURRENT_ROLES[onboardingState.data.currentRole] || onboardingState.data.currentRole;
  };

  const getTargetRoleDisplay = () => {
    if (!onboardingState?.data.targetRole) return 'Not set';
    return TARGET_ROLES[onboardingState.data.targetRole] || onboardingState.data.targetRole;
  };

  const getWeeklyHoursDisplay = () => {
    if (!onboardingState?.data.weeklyHours) return 'Not set';
    return WEEKLY_HOURS[onboardingState.data.weeklyHours] || `${onboardingState.data.weeklyHours} hours/week`;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-secondary-600 hover:text-secondary-800 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-primary-600">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <EmailVerificationBanner />
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary-900">Profile</h2>
              <button
                onClick={() => navigate('/settings/profile')}
                className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Edit Profile
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary-600">
                  {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-secondary-900">
                  {user?.name || 'User'}
                </p>
                <p className="text-secondary-600 text-sm">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Learning Preferences Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary-900">Learning Preferences</h2>
              <button
                onClick={handleEditPreferences}
                className="inline-flex items-center gap-2 px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Edit Preferences
              </button>
            </div>

            {isLoadingOnboarding ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-secondary-600">Loading preferences...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-secondary-100">
                  <div>
                    <p className="text-sm text-secondary-500">Current Role</p>
                    <p className="font-medium text-secondary-900">{getCurrentRoleDisplay()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-secondary-100">
                  <div>
                    <p className="text-sm text-secondary-500">Target Role</p>
                    <p className="font-medium text-secondary-900">{getTargetRoleDisplay()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-secondary-500">Weekly Time Commitment</p>
                    <p className="font-medium text-secondary-900">{getWeeklyHoursDisplay()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Warning message about roadmap regeneration */}
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Changing preferences will regenerate your roadmap
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Your progress on matching skills will be preserved, but you'll receive a new personalized learning path.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Account</h2>
            <SignOutButton variant="danger" />
          </div>
        </div>
      </main>
    </div>
  );
}
