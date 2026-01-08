import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { RoadmapWithModules, RoadmapSummary } from '@plpg/shared';

const ROADMAP_QUERY_KEY = ['roadmap'];
const ROADMAP_SUMMARY_QUERY_KEY = ['roadmap', 'summary'];

interface UseRoadmapOptions {
  enabled?: boolean;
}

export function useRoadmap(options: UseRoadmapOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ROADMAP_QUERY_KEY,
    queryFn: async (): Promise<RoadmapWithModules | null> => {
      try {
        const response = await api.get<{ roadmap: RoadmapWithModules }>('/roadmap/current');
        return response.data.roadmap;
      } catch (error: unknown) {
        // Return null if no roadmap exists yet (404)
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            return null;
          }
        }
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRoadmapSummary(options: UseRoadmapOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ROADMAP_SUMMARY_QUERY_KEY,
    queryFn: async (): Promise<RoadmapSummary | null> => {
      try {
        const response = await api.get<{ summary: RoadmapSummary }>('/roadmap/summary');
        return response.data.summary;
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            return null;
          }
        }
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrentModule() {
  const { data: roadmap } = useRoadmap();

  if (!roadmap?.modules) return null;

  // Find first non-completed, non-locked module
  const currentModule = roadmap.modules
    .sort((a, b) => {
      // Sort by phase order then sequence
      const phaseOrder = ['foundation', 'core_ml', 'deep_learning'];
      const aPhaseIdx = phaseOrder.indexOf(a.phase);
      const bPhaseIdx = phaseOrder.indexOf(b.phase);
      if (aPhaseIdx !== bPhaseIdx) return aPhaseIdx - bPhaseIdx;
      return a.sequenceOrder - b.sequenceOrder;
    })
    .find(
      (m) =>
        !m.isLocked &&
        m.progress?.status !== 'completed' &&
        m.progress?.status !== 'skipped'
    );

  return currentModule ?? null;
}

export function useInvalidateRoadmap() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ROADMAP_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ROADMAP_SUMMARY_QUERY_KEY });
  };
}
