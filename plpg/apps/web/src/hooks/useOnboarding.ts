import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { OnboardingStateResponse, Step1Data, Step2Data, Step3Data, Step4Data } from '@plpg/shared';
import api from '../services/api';
import { authService } from '../lib/auth';

// Query keys
const ONBOARDING_KEY = ['onboarding'];

// API functions
async function fetchOnboardingState(): Promise<OnboardingStateResponse> {
  const response = await api.get<{ success: true; data: OnboardingStateResponse }>('/onboarding');
  return response.data.data;
}

async function saveStepData(
  step: number,
  data: Step1Data | Step2Data | Step3Data | Step4Data
): Promise<OnboardingStateResponse> {
  const response = await api.patch<{ success: true; data: OnboardingStateResponse }>(`/onboarding/step/${step}`, data);
  return response.data.data;
}

async function skipOnboardingApi(): Promise<OnboardingStateResponse> {
  const response = await api.post<{ success: true; data: OnboardingStateResponse }>('/onboarding/skip', {});
  return response.data.data;
}

async function completeOnboardingApi(): Promise<OnboardingStateResponse> {
  const response = await api.post<{ success: true; data: OnboardingStateResponse }>('/onboarding/complete', {});
  return response.data.data;
}

async function gotoStepApi(step: number): Promise<OnboardingStateResponse> {
  const response = await api.post<{ success: true; data: OnboardingStateResponse }>(`/onboarding/goto/${step}`, {});
  return response.data.data;
}

async function restartOnboardingApi(): Promise<OnboardingStateResponse> {
  const response = await api.post<{ success: true; data: OnboardingStateResponse }>('/onboarding/restart', {});
  return response.data.data;
}

// Hooks
export function useOnboardingState() {
  const isAuthenticated = authService.isAuthenticated();

  return useQuery({
    queryKey: ONBOARDING_KEY,
    queryFn: () => fetchOnboardingState(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSaveStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ step, data }: { step: number; data: Step1Data | Step2Data | Step3Data | Step4Data }) =>
      saveStepData(step, data),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEY, data);
    },
  });
}

export function useSkipOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => skipOnboardingApi(),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEY, data);
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeOnboardingApi(),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEY, data);
    },
  });
}

export function useGotoStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (step: number) => gotoStepApi(step),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEY, data);
    },
  });
}

export function useRestartOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => restartOnboardingApi(),
    onSuccess: (data) => {
      queryClient.setQueryData(ONBOARDING_KEY, data);
    },
  });
}
