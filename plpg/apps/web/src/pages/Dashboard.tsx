import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { SignOutButton } from '../components/auth/SignOutButton';
import { EmailVerificationBanner } from '../components/auth/EmailVerificationBanner';
import { MetroMapSidebar } from '../components/dashboard/MetroMapSidebar';
import { MobileDrawer } from '../components/dashboard/MetroMapSidebar/MobileDrawer';
import { useRoadmap, useCurrentModule } from '../hooks/useRoadmap';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Roadmap data
  const { data: roadmap, isLoading: roadmapLoading } = useRoadmap();
  const currentModule = useCurrentModule();

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

  const handleModuleClick = (moduleId: string) => {
    // TODO: Navigate to module detail or update current module
    console.log('Module clicked:', moduleId);
    setIsMobileMenuOpen(false);
  };

  // Calculate stats from roadmap
  const totalModules = roadmap?.modules?.length ?? 0;
  const completedModules = roadmap?.modules?.filter(
    (m) => m.progress?.status === 'completed'
  ).length ?? 0;
  const progressPercent = totalModules > 0
    ? Math.round((completedModules / totalModules) * 100)
    : 0;
  const totalHours = roadmap?.modules?.reduce(
    (sum, m) => sum + (m.progress?.status === 'completed' ? m.skill.estimatedHours : 0),
    0
  ) ?? 0;

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100 rounded-lg transition-colors md:hidden"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <h1 className="text-2xl font-bold text-primary-600">PLPG Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-secondary-600 hidden sm:inline">
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

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
        <MetroMapSidebar
          roadmap={roadmap ?? null}
          currentModuleId={currentModule?.id}
          onModuleClick={handleModuleClick}
          className="shadow-none"
        />
      </MobileDrawer>

      <div className="container mx-auto px-4 py-8">
        <EmailVerificationBanner />

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-80 shrink-0">
            <div className="sticky top-24">
              {roadmapLoading ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-secondary-200 rounded w-3/4" />
                    <div className="h-2 bg-secondary-200 rounded" />
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-secondary-100 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <MetroMapSidebar
                  roadmap={roadmap ?? null}
                  currentModuleId={currentModule?.id}
                  onModuleClick={handleModuleClick}
                />
              )}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
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

              {/* Current Module Card */}
              {currentModule && (
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                        Current Module
                      </span>
                      <h2 className="text-xl font-semibold text-secondary-900 mt-1">
                        {currentModule.skill.name}
                      </h2>
                      <p className="text-secondary-600 mt-2">
                        {currentModule.skill.description}
                      </p>
                    </div>
                    <span className="text-sm text-secondary-500 whitespace-nowrap ml-4">
                      ~{currentModule.skill.estimatedHours}h
                    </span>
                  </div>
                  <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Continue Learning
                  </button>
                </div>
              )}

              {/* Empty state when no roadmap */}
              {!roadmapLoading && !roadmap && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">Your Learning Path</h2>
                  <p className="text-secondary-600">
                    Your personalized roadmap will appear here once you complete the onboarding process.
                  </p>
                  <Link
                    to="/onboarding"
                    className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Start Onboarding
                  </Link>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">Progress</h3>
                  <div className="text-3xl font-bold text-primary-600">{progressPercent}%</div>
                  <p className="text-secondary-500 text-sm">
                    {completedModules > 0
                      ? `${completedModules} modules completed`
                      : 'Complete your first module'}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">Time Invested</h3>
                  <div className="text-3xl font-bold text-primary-600">{totalHours}h</div>
                  <p className="text-secondary-500 text-sm">
                    {totalHours > 0 ? 'Keep it up!' : 'Start learning today'}
                  </p>
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
      </div>
    </div>
  );
}
