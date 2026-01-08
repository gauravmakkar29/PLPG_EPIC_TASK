import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Phase, PHASE_ACCESS, PLAN_PRICING, SUBSCRIPTION_PLANS } from '@plpg/shared';

export type SubscriptionTier = 'free' | 'trial' | 'pro';

export interface SubscriptionInfo {
  /** Current subscription tier */
  tier: SubscriptionTier;
  /** Whether user is in active trial period */
  isInTrial: boolean;
  /** Days remaining in trial (null if not in trial) */
  trialDaysRemaining: number | null;
  /** Date when trial ends (null if not in trial) */
  trialEndsAt: Date | null;
  /** Whether user has Pro subscription */
  isPro: boolean;
  /** Whether user is on free tier (no trial, no pro) */
  isFree: boolean;
  /** Monthly price for Pro plan */
  proMonthlyPrice: number;
  /** Check if user has access to a specific phase */
  hasPhaseAccess: (phase: Phase) => boolean;
  /** Whether subscription is loading */
  isLoading: boolean;
}

/**
 * Hook to get subscription status and access control information
 */
export function useSubscription(): SubscriptionInfo {
  const { session, isLoading } = useAuth();

  return useMemo(() => {
    const subscriptionStatus = session?.subscriptionStatus ?? 'free';
    const trialEndsAtStr = session?.trialEndsAt;

    // Parse trial end date
    const trialEndsAt = trialEndsAtStr ? new Date(trialEndsAtStr) : null;

    // Calculate trial days remaining
    let trialDaysRemaining: number | null = null;
    let isInTrial = false;

    if (subscriptionStatus === 'trial' && trialEndsAt) {
      const now = new Date();
      const diffTime = trialEndsAt.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        trialDaysRemaining = diffDays;
        isInTrial = true;
      }
    }

    // Determine tier
    let tier: SubscriptionTier;
    if (subscriptionStatus === 'pro') {
      tier = 'pro';
    } else if (isInTrial) {
      tier = 'trial';
    } else {
      tier = 'free';
    }

    const isPro = tier === 'pro';
    const isFree = tier === 'free';

    // Phase access check function
    const hasPhaseAccess = (phase: Phase): boolean => {
      const allowedTiers = PHASE_ACCESS[phase];

      if (isPro) {
        return allowedTiers.includes('pro');
      }

      if (isInTrial) {
        return allowedTiers.includes('trial');
      }

      return allowedTiers.includes('free');
    };

    return {
      tier,
      isInTrial,
      trialDaysRemaining,
      trialEndsAt,
      isPro,
      isFree,
      proMonthlyPrice: PLAN_PRICING[SUBSCRIPTION_PLANS.PRO].monthly,
      hasPhaseAccess,
      isLoading,
    };
  }, [session, isLoading]);
}

/**
 * Calculate estimated completion weeks based on total hours and weekly commitment
 */
export function calculateCompletionWeeks(totalHours: number, weeklyHours: number = 10): number {
  if (weeklyHours <= 0) return 0;
  return Math.ceil(totalHours / weeklyHours);
}
