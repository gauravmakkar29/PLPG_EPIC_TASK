export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
} as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

export const TRIAL_DURATION_DAYS = 14;

export const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  [SUBSCRIPTION_PLANS.FREE]: [
    'Access to Foundation phase (during trial)',
    'Basic progress tracking',
    'Community resources',
  ],
  [SUBSCRIPTION_PLANS.PRO]: [
    'Access to all phases',
    'Personalized roadmap generation',
    'Advanced progress analytics',
    'Weekly check-ins and coaching',
    'Priority support',
    'Downloadable certificates',
  ],
};

export const PLAN_PRICING = {
  [SUBSCRIPTION_PLANS.FREE]: {
    monthly: 0,
    yearly: 0,
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    monthly: 29,
    yearly: 290,
  },
};

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
  UNPAID: 'unpaid',
} as const;
