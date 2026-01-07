import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { SignOutButton } from '../components/auth/SignOutButton';
import { EmailVerificationBanner } from '../components/auth/EmailVerificationBanner';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const response = await api.get('/health');
        setHealth(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to connect to API');
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-600">PLPG Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-secondary-600">
                Welcome, {user?.name || user?.email || 'User'}
              </span>
              <Link
                to="/settings"
                className="p-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100 rounded-lg transition-colors"
                title="Settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
              <SignOutButton variant="ghost" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <EmailVerificationBanner />
        <div className="grid gap-6">
          {/* System Health Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">System Status</h2>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-secondary-600">Checking connection...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-red-600">{error}</span>
              </div>
            ) : health ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${health.database === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-secondary-700">
                    Database: <span className={health.database === 'connected' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {health.database}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-secondary-700">
                    API Status: <span className={health.status === 'healthy' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {health.status}
                    </span>
                  </span>
                </div>
                <p className="text-secondary-500 text-sm">
                  Uptime: {Math.floor(health.uptime / 60)} minutes
                </p>
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Your Learning Path</h2>
            <p className="text-secondary-600">
              Your personalized roadmap will appear here once you complete the onboarding process.
            </p>
            <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Start Onboarding
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Progress</h3>
              <div className="text-3xl font-bold text-primary-600">0%</div>
              <p className="text-secondary-500 text-sm">Complete your first module</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Time Invested</h3>
              <div className="text-3xl font-bold text-primary-600">0h</div>
              <p className="text-secondary-500 text-sm">Start learning today</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Streak</h3>
              <div className="text-3xl font-bold text-primary-600">0 days</div>
              <p className="text-secondary-500 text-sm">Build your streak</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
