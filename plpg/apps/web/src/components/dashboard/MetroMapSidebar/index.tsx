import { useState, useEffect, useCallback } from 'react';
import { cn } from '../../../lib/utils';
import { PhaseItem, type PhaseStatus } from './PhaseItem';
import { ModuleList } from './ModuleList';
import type { RoadmapWithModules, RoadmapModuleWithSkill } from '@plpg/shared';
import { Phase, PHASE_ORDER } from '@plpg/shared';

const STORAGE_KEY = 'metro-map-expanded-phases';

export interface MetroMapSidebarProps {
  roadmap: RoadmapWithModules | null;
  currentModuleId?: string;
  onModuleClick?: (moduleId: string) => void;
  className?: string;
}

interface PhaseData {
  phase: Phase;
  modules: RoadmapModuleWithSkill[];
  status: PhaseStatus;
  completedModules: number;
  totalModules: number;
}

function getExpandedPhasesFromStorage(): Record<Phase, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  // Default: expand the active phase, collapse others
  return {
    [Phase.FOUNDATION]: false,
    [Phase.CORE_ML]: false,
    [Phase.DEEP_LEARNING]: false,
  };
}

function saveExpandedPhasesToStorage(expanded: Record<Phase, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
  } catch {
    // Ignore storage errors
  }
}

function calculatePhaseStatus(
  modules: RoadmapModuleWithSkill[],
  isFirstIncompletePhase: boolean
): PhaseStatus {
  if (modules.length === 0) return 'pending';

  const allLocked = modules.every((m) => m.isLocked);
  if (allLocked) return 'locked';

  const completedCount = modules.filter(
    (m) => m.progress?.status === 'completed'
  ).length;

  if (completedCount === modules.length) return 'completed';
  if (isFirstIncompletePhase) return 'active';
  return 'pending';
}

function organizeByPhase(roadmap: RoadmapWithModules | null): PhaseData[] {
  if (!roadmap) {
    return PHASE_ORDER.map((phase) => ({
      phase,
      modules: [],
      status: 'pending' as PhaseStatus,
      completedModules: 0,
      totalModules: 0,
    }));
  }

  let foundFirstIncomplete = false;

  return PHASE_ORDER.map((phase) => {
    const modules = roadmap.modules
      .filter((m) => m.phase === phase)
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    const completedModules = modules.filter(
      (m) => m.progress?.status === 'completed'
    ).length;

    const isComplete = completedModules === modules.length && modules.length > 0;
    const isFirstIncomplete = !foundFirstIncomplete && !isComplete;

    if (isFirstIncomplete) {
      foundFirstIncomplete = true;
    }

    const status = calculatePhaseStatus(modules, isFirstIncomplete);

    return {
      phase,
      modules,
      status,
      completedModules,
      totalModules: modules.length,
    };
  });
}

export function MetroMapSidebar({
  roadmap,
  currentModuleId,
  onModuleClick,
  className,
}: MetroMapSidebarProps) {
  const [expandedPhases, setExpandedPhases] = useState<Record<Phase, boolean>>(
    getExpandedPhasesFromStorage
  );

  const phases = organizeByPhase(roadmap);

  // Auto-expand active phase on initial load
  useEffect(() => {
    const activePhase = phases.find((p) => p.status === 'active');
    if (activePhase && !expandedPhases[activePhase.phase]) {
      const stored = getExpandedPhasesFromStorage();
      // Only auto-expand if no phases were previously expanded
      const anyExpanded = Object.values(stored).some(Boolean);
      if (!anyExpanded) {
        setExpandedPhases((prev) => ({
          ...prev,
          [activePhase.phase]: true,
        }));
      }
    }
  }, [roadmap]); // Only run when roadmap changes

  const togglePhase = useCallback((phase: Phase) => {
    setExpandedPhases((prev) => {
      const updated = { ...prev, [phase]: !prev[phase] };
      saveExpandedPhasesToStorage(updated);
      return updated;
    });
  }, []);

  const totalModules = phases.reduce((sum, p) => sum + p.totalModules, 0);
  const completedModules = phases.reduce((sum, p) => sum + p.completedModules, 0);
  const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <aside
      className={cn(
        'bg-white rounded-xl shadow-sm p-4 w-full',
        className
      )}
      aria-label="Learning journey progress"
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-secondary-900">Your Journey</h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-secondary-600">
            {progressPercent}%
          </span>
        </div>
        <p className="text-xs text-secondary-500 mt-1">
          {completedModules} of {totalModules} modules complete
        </p>
      </div>

      {/* Phase list */}
      <div className="space-y-3">
        {phases.map((phaseData) => (
          <PhaseItem
            key={phaseData.phase}
            phase={phaseData.phase}
            status={phaseData.status}
            completedModules={phaseData.completedModules}
            totalModules={phaseData.totalModules}
            isExpanded={expandedPhases[phaseData.phase]}
            onToggle={() => togglePhase(phaseData.phase)}
          >
            <ModuleList
              modules={phaseData.modules}
              isExpanded={expandedPhases[phaseData.phase]}
              currentModuleId={currentModuleId}
              onModuleClick={onModuleClick}
            />
          </PhaseItem>
        ))}
      </div>

      {/* Empty state */}
      {!roadmap && (
        <div className="text-center py-6 text-secondary-500">
          <svg
            className="w-12 h-12 mx-auto text-secondary-300 mb-3"
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
          <p className="text-sm">Your learning path will appear here</p>
        </div>
      )}
    </aside>
  );
}

export { PhaseItem } from './PhaseItem';
export { ModuleList } from './ModuleList';
export type { PhaseStatus } from './PhaseItem';
