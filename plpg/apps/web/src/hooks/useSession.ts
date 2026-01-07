import { useQuery } from '@tanstack/react-query';
import type { Session } from '@plpg/shared';
import api from '../services/api';
import { authService } from '../lib/auth';

export function useSession() {
  const isAuthenticated = authService.isAuthenticated();

  return useQuery<Session>({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await api.get<Session>('/auth/me');
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    retry: false,
  });
}

