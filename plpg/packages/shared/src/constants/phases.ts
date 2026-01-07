export const Phase = {
  FOUNDATION: 'foundation',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export type Phase = (typeof Phase)[keyof typeof Phase];

export const PHASE_ORDER: Phase[] = [
  Phase.FOUNDATION,
  Phase.INTERMEDIATE,
  Phase.ADVANCED,
];

export const PHASE_LABELS: Record<Phase, string> = {
  [Phase.FOUNDATION]: 'Foundation',
  [Phase.INTERMEDIATE]: 'Intermediate',
  [Phase.ADVANCED]: 'Advanced',
};

export const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  [Phase.FOUNDATION]: 'Build core skills and fundamental knowledge',
  [Phase.INTERMEDIATE]: 'Develop practical expertise and deeper understanding',
  [Phase.ADVANCED]: 'Master complex concepts and specialized techniques',
};

export const PHASE_ACCESS: Record<Phase, ('free' | 'trial' | 'pro')[]> = {
  [Phase.FOUNDATION]: ['trial', 'pro'],
  [Phase.INTERMEDIATE]: ['pro'],
  [Phase.ADVANCED]: ['pro'],
};
