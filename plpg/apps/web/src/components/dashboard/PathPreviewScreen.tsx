import { useMemo, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { useSubscription, calculateCompletionWeeks } from '../../hooks/useSubscription';
import { useRoadmap, useCurrentModule } from '../../hooks/useRoadmap';
import { UpgradeCTA } from './UpgradeCTA';
import { PathPreviewMetroMap } from './PathPreviewMetroMap';
import type { RoadmapModuleWithSkill } from '@plpg/shared';
import { PHASE_ORDER } from '@plpg/shared';

export interface PathPreviewScreenProps {
  className?: string;
  onModuleClick?: (moduleId: string) => void;
  onUpgradeClick?: () => void;
  weeklyHours?: number;
}

/**
 * Path Preview Screen for free tier users
 * Shows full roadmap with Phase 1 accessible and Phases 2-3 locked
 */
export function PathPreviewScreen({
  className,
  onModuleClick,
  onUpgradeClick,
  weeklyHours = 10,
}: PathPreviewScreenProps) {
  const subscription = useSubscription();
  const { data: roadmap, isLoading: isRoadmapLoading } = useRoadmap();
  const currentModule = useCurrentModule();

  // Calculate total estimated hours from roadmap
  const totalHours = useMemo(() => {
    if (!roadmap?.modules) return 0;
    return roadmap.modules.reduce((sum, m) => sum + m.skill.estimatedHours, 0);
  }, [roadmap]);

  // Calculate completion timeline
  const completionWeeks = useMemo(() => {
    return calculateCompletionWeeks(totalHours, weeklyHours);
  }, [totalHours, weeklyHours]);

  // Organize modules by phase with access control
  const phaseData = useMemo(() => {
    if (!roadmap?.modules) {
      return PHASE_ORDER.map((phase) => ({
        phase,
        modules: [] as RoadmapModuleWithSkill[],
        isAccessible: subscription.hasPhaseAccess(phase),
        moduleCount: 0,
        completedCount: 0,
        totalHours: 0,
      }));
    }

    return PHASE_ORDER.map((phase) => {
      const modules = roadmap.modules
        .filter((m) => m.phase === phase)
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

      const completedCount = modules.filter(
        (m) => m.progress?.status === 'completed'
      ).length;

      const phaseHours = modules.reduce((sum, m) => sum + m.skill.estimatedHours, 0);

      return {
        phase,
        modules,
        isAccessible: subscription.hasPhaseAccess(phase),
        moduleCount: modules.length,
        completedCount,
        totalHours: phaseHours,
      };
    });
  }, [roadmap, subscription]);

  // Calculate overall stats
  const stats = useMemo(() => {
    const totalModules = phaseData.reduce((sum, p) => sum + p.moduleCount, 0);
    const completedModules = phaseData.reduce((sum, p) => sum + p.completedCount, 0);
    const accessibleModules = phaseData
      .filter((p) => p.isAccessible)
      .reduce((sum, p) => sum + p.moduleCount, 0);
    const lockedModules = totalModules - accessibleModules;

    return {
      totalModules,
      completedModules,
      accessibleModules,
      lockedModules,
      progressPercent: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
    };
  }, [phaseData]);

  const handleModuleClick = useCallback(
    (moduleId: string, isAccessible: boolean) => {
      if (isAccessible && onModuleClick) {
        onModuleClick(moduleId);
      }
    },
    [onModuleClick]
  );

  if (isRoadmapLoading) {
    return <PathPreviewSkeleton className={className} />;
  }

  if (!roadmap) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm p-6 text-center', className)}>
        <svg
          className="w-16 h-16 mx-auto text-secondary-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">No Learning Path Yet</h2>
        <p className="text-secondary-600">
          Complete onboarding to generate your personalized learning path.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{roadmap.title}</h1>
            <p className="text-secondary-600 mt-1">
              From {roadmap.sourceRole} to {roadmap.targetRole}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-secondary-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">
                Complete in {completionWeeks} week{completionWeeks !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-sm text-secondary-500 mt-1">
              at {weeklyHours}h/week ({totalHours} total hours)
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-secondary-600">Overall Progress</span>
            <span className="font-medium text-secondary-900">{stats.progressPercent}%</span>
          </div>
          <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-secondary-500 mt-2">
            <span>
              {stats.completedModules} of {stats.totalModules} modules complete
            </span>
            {stats.lockedModules > 0 && !subscription.isPro && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {stats.lockedModules} modules locked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade CTA for non-Pro users */}
      {!subscription.isPro && (
        <UpgradeCTA
          monthlyPrice={subscription.proMonthlyPrice}
          trialDaysRemaining={subscription.trialDaysRemaining}
          onUpgradeClick={onUpgradeClick}
          variant="banner"
        />
      )}

      {/* Metro Map */}
      <PathPreviewMetroMap
        phaseData={phaseData}
        currentModuleId={currentModule?.id}
        onModuleClick={handleModuleClick}
      />

      {/* Detailed Upgrade CTA Card for non-Pro users */}
      {!subscription.isPro && (
        <UpgradeCTA
          monthlyPrice={subscription.proMonthlyPrice}
          trialDaysRemaining={subscription.trialDaysRemaining}
          onUpgradeClick={onUpgradeClick}
          variant="card"
        />
      )}
    </div>
  );
}

function PathPreviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary-200 rounded w-2/3" />
          <div className="h-4 bg-secondary-100 rounded w-1/3" />
          <div className="h-3 bg-secondary-100 rounded-full" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-secondary-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
