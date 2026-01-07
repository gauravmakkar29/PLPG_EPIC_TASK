import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import type { Session } from '@plpg/shared';
import api from '../services/api';

export function useSession() {
  const { isSignedIn, getToken } = useAuth();

  return useQuery<Session>({
    queryKey: ['session'],
    queryFn: async () => {
      const token = await getToken();
      const response = await api.get<Session>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

