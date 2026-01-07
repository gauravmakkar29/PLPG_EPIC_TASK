import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import type { OnboardingStateResponse, Step1Data, Step2Data, Step3Data } from '@plpg/shared';
import api from '../services/api';

// Query keys
const ONBOARDING_KEY = ['onboarding'];

// API functions
async function fetchOnboardingState(getToken: () => Promise<string | null>): Promise<OnboardingStateResponse> {
  const token = await getToken();
  const response = await api.get<{ success: true; data: OnboardingStateResponse }>('/onboarding', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

async function saveStepData(
  step: number,
  data: Step1Data | Step2Data | Step3Data,
  getToken: () => Promise<string | null>
): Promise<OnboardingStateResponse> {
  const token = await getToken();
  const response = await api.patch<{ success: true; data: OnboardingStateResponse }>(`/onboarding/step/${step}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}

async function skipOnboardingApi(getToken: () => Promise<string | null>): Promise<OnboardingStateResponse> {
  const token = await getToken();
  const response = await api.post<{ success: true; data: OnboardingStateResponse }>(
    '/onboarding/skip',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

async function completeOnboardingApi(getToken: () => Promise<string | null>): Promise<OnboardingStateResponse> {
  const token = await getToken();
  const response = await api.post<{ success: true; data: OnboardingStateResponse }>(
    '/onboarding/complete',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

async function gotoStepApi(step: number, getToken: () => Promise<string | null>): Promise<OnboardingStateResponse> {
  const token = await getToken();
  const response = await api.post<{ success: true; data: OnboardingStateResponse }>(
    `/onboarding/goto/${step}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

async function restartOnboardingApi(getToken: () => Promise<string | null>): Promise<OnboardingStateResponse> {
  const token = await getToken();
  const response = await api.post<{ success: true; data: OnboardingStateResponse }>(
    '/onboarding/restart',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
}

// Hooks
export function useOnboardingState() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ONBOARDING_KEY,
    queryFn: () => fetchOnboardingState(getToken),
    enabled: isSignedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSaveStep() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ step, data }: { step: number; data: Step1Data | Step2Data | Step3Data }) =>
      saveStepData(step, data, getToken),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEY, data);
    },
  });
}

export function useSkipOnboarding() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => skipOnboardingApi(getToken),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEY, data);
    },
  });
}

export function useCompleteOnboarding() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeOnboardingApi(getToken),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEY, data);
    },
  });
}

export function useGotoStep() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (step: number) => gotoStepApi(step, getToken),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEY, data);
    },
  });
}

export function useRestartOnboarding() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => restartOnboardingApi(getToken),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEY, data);
    },
  });
}
