import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SignOutButton } from '../components/auth/SignOutButton';
import { EmailVerificationBanner } from '../components/auth/EmailVerificationBanner';
import { MetroMapSidebar } from '../components/dashboard/MetroMapSidebar';
import { MobileDrawer } from '../components/dashboard/MetroMapSidebar/MobileDrawer';
import { PathPreviewScreen } from '../components/dashboard/PathPreviewScreen';
import { ModuleDetail } from '../components/dashboard/ModuleDetail';
import { useRoadmap, useCurrentModule } from '../hooks/useRoadmap';
import { useSubscription } from '../hooks/useSubscription';
import { useModuleProgress } from '../hooks/useModuleProgress';
import { PHASE_ORDER } from '@plpg/shared';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Roadmap data
  const { data: roadmap, isLoading: roadmapLoading } = useRoadmap();
  const currentModule = useCurrentModule();

  // Subscription status
  const subscription = useSubscription();

  // Module progress hook
  const { markComplete, isLoading: isMarkingComplete } = useModuleProgress();

  // Sort modules by phase and sequence order
  const sortedModules = useMemo(() => {
    if (!roadmap?.modules) return [];
    return [...roadmap.modules].sort((a, b) => {
      const aPhaseIdx = PHASE_ORDER.indexOf(a.phase);
      const bPhaseIdx = PHASE_ORDER.indexOf(b.phase);
      if (aPhaseIdx !== bPhaseIdx) return aPhaseIdx - bPhaseIdx;
      return a.sequenceOrder - b.sequenceOrder;
    });
  }, [roadmap?.modules]);

  // Get the selected module
  const selectedModule = useMemo(() => {
    if (!selectedModuleId) return null;
    return sortedModules.find((m) => m.id === selectedModuleId) || null;
  }, [selectedModuleId, sortedModules]);

  // Get module index in sorted list
  const selectedModuleIndex = useMemo(() => {
    if (!selectedModule) return -1;
    return sortedModules.findIndex((m) => m.id === selectedModule.id);
  }, [selectedModule, sortedModules]);

  // Get total modules in the current phase
  const modulesInCurrentPhase = useMemo(() => {
    if (!selectedModule) return [];
    return sortedModules.filter((m) => m.phase === selectedModule.phase);
  }, [selectedModule, sortedModules]);

  // Get module index within its phase
  const moduleIndexInPhase = useMemo(() => {
    if (!selectedModule) return -1;
    return modulesInCurrentPhase.findIndex((m) => m.id === selectedModule.id);
  }, [selectedModule, modulesInCurrentPhase]);

  // Auto-select current module if none selected
  useEffect(() => {
    if (!selectedModuleId && currentModule && subscription.isPro) {
      setSelectedModuleId(currentModule.id);
    }
  }, [selectedModuleId, currentModule, subscription.isPro]);

  const handleModuleClick = useCallback((moduleId: string) => {
    setSelectedModuleId(moduleId);
    setIsMobileMenuOpen(false);
  }, []);

  const handleUpgradeClick = useCallback(() => {
    navigate('/pricing');
  }, [navigate]);

  const handleMarkComplete = useCallback(async () => {
    if (!roadmap?.id || !selectedModuleId) return;

    try {
      await markComplete(roadmap.id, selectedModuleId);
      // After marking complete, move to next module if available
      if (selectedModuleIndex < sortedModules.length - 1) {
        const nextModule = sortedModules[selectedModuleIndex + 1];
        if (!nextModule.isLocked) {
          setSelectedModuleId(nextModule.id);
        }
      }
    } catch (err) {
      console.error('Failed to mark module as complete:', err);
    }
  }, [roadmap?.id, selectedModuleId, markComplete, selectedModuleIndex, sortedModules]);

  const handleNavigatePrevious = useCallback(() => {
    if (selectedModuleIndex > 0) {
      setSelectedModuleId(sortedModules[selectedModuleIndex - 1].id);
    }
  }, [selectedModuleIndex, sortedModules]);

  const handleNavigateNext = useCallback(() => {
    if (selectedModuleIndex < sortedModules.length - 1) {
      const nextModule = sortedModules[selectedModuleIndex + 1];
      if (!nextModule.isLocked) {
        setSelectedModuleId(nextModule.id);
      }
    }
  }, [selectedModuleIndex, sortedModules]);

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
          currentModuleId={selectedModuleId || currentModule?.id}
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
                  currentModuleId={selectedModuleId || currentModule?.id}
                  onModuleClick={handleModuleClick}
                />
              )}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Show PathPreviewScreen for free/trial users with roadmap */}
            {!subscription.isPro && roadmap ? (
              <PathPreviewScreen
                onModuleClick={handleModuleClick}
                onUpgradeClick={handleUpgradeClick}
              />
            ) : (
              <div className="grid gap-6">
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

                {/* Module Detail - Main content area when module is selected */}
                {selectedModule && (
                  <ModuleDetail
                    module={selectedModule}
                    moduleIndex={moduleIndexInPhase}
                    totalModulesInPhase={modulesInCurrentPhase.length}
                    onMarkComplete={handleMarkComplete}
                    onNavigatePrevious={handleNavigatePrevious}
                    onNavigateNext={handleNavigateNext}
                    isFirst={selectedModuleIndex === 0}
                    isLast={selectedModuleIndex === sortedModules.length - 1 || (selectedModuleIndex < sortedModules.length - 1 && sortedModules[selectedModuleIndex + 1].isLocked)}
                    isMarkingComplete={isMarkingComplete}
                  />
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
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
