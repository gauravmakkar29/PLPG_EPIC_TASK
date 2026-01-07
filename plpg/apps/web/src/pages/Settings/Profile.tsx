import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSession } from '../../hooks/useSession';
import { EmailVerificationBanner } from '../../components/auth/EmailVerificationBanner';

export function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { data: session, isLoading: isLoadingSession } = useSession();
  const navigate = useNavigate();

  if (isLoading || isLoadingSession) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-secondary-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Auth0 doesn't provide createdAt in user object by default
  // You may need to fetch this from your backend API
  const accountCreatedDate = 'Unknown';

  const getSubscriptionBadgeVariant = () => {
    if (!session?.subscriptionStatus) return 'free';
    return session.subscriptionStatus;
  };

  const getSubscriptionLabel = () => {
    if (!session?.subscriptionStatus) return 'Free';
    const status = session.subscriptionStatus;
    if (status === 'pro') return 'Pro';
    if (status === 'trial') return 'Trial';
    return 'Free';
  };

  const getBadgeColor = () => {
    const variant = getSubscriptionBadgeVariant();
    if (variant === 'pro') return 'bg-primary-600 text-white';
    if (variant === 'trial') return 'bg-amber-500 text-white';
    return 'bg-secondary-200 text-secondary-700';
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/settings')}
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
              <h1 className="text-2xl font-bold text-primary-600">Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <EmailVerificationBanner />
          {/* Profile Information Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6">Profile Information</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-3xl font-semibold text-primary-600">
                  {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-secondary-900">
                  {user?.name || user?.email || 'User'}
                </h3>
                <p className="text-secondary-600 text-sm mt-1">
                  {user?.email}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor()}`}>
                    {getSubscriptionLabel()}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Created Date */}
            <div className="pt-6 border-t border-secondary-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500">Account Created</p>
                  <p className="font-medium text-secondary-900 mt-1">{accountCreatedDate}</p>
                </div>
              </div>
            </div>

            {/* Trial Expiration Date */}
            {session?.subscriptionStatus === 'trial' && session.trialEndsAt && (
              <div className="pt-4 border-t border-secondary-100 mt-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-amber-800 font-medium">
                      Trial ends: {new Date(session.trialEndsAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Upgrade to Pro to continue after your trial ends
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit Profile Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Edit Profile</h2>
            <p className="text-secondary-600 text-sm mb-6">
              Profile management features will be available soon. For now, you can update your name and email through the settings.
            </p>
            <div className="border border-secondary-200 rounded-lg p-4 bg-secondary-50">
              <p className="text-sm text-secondary-600">
                Profile editing functionality is coming soon.
              </p>
            </div>
          </div>

          {/* Billing Settings Link */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Subscription & Billing</h2>
            <p className="text-secondary-600 text-sm mb-4">
              Manage your subscription, billing information, and payment methods.
            </p>
            <button
              onClick={() => navigate('/settings/billing')}
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
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Go to Billing Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

