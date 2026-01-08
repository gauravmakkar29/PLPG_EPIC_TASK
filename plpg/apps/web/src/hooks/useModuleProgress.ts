import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { ProgressStatus } from '@plpg/shared';

interface UpdateProgressParams {
  roadmapId: string;
  moduleId: string;
  status: ProgressStatus;
  timeSpentMinutes?: number;
  notes?: string;
}

interface UpdateProgressResponse {
  success: boolean;
  data: {
    progress: {
      id: string;
      status: string;
      startedAt: string | null;
      completedAt: string | null;
      timeSpentMinutes: number;
    };
    unlockedModules: string[];
  };
}

export function useModuleProgress() {
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async ({ roadmapId, moduleId, status, timeSpentMinutes, notes }: UpdateProgressParams) => {
      const response = await api.patch<UpdateProgressResponse>(
        `/roadmap/${roadmapId}/modules/${moduleId}/progress`,
        { status, timeSpentMinutes, notes }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate roadmap queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });

  const markComplete = async (roadmapId: string, moduleId: string) => {
    return updateProgressMutation.mutateAsync({
      roadmapId,
      moduleId,
      status: 'completed',
    });
  };

  const markInProgress = async (roadmapId: string, moduleId: string) => {
    return updateProgressMutation.mutateAsync({
      roadmapId,
      moduleId,
      status: 'in_progress',
    });
  };

  const updateProgress = async (params: UpdateProgressParams) => {
    return updateProgressMutation.mutateAsync(params);
  };

  return {
    markComplete,
    markInProgress,
    updateProgress,
    isLoading: updateProgressMutation.isPending,
    isError: updateProgressMutation.isError,
    error: updateProgressMutation.error,
    reset: updateProgressMutation.reset,
  };
}
