export const Phase = {
  FOUNDATION: 'foundation',
  CORE_ML: 'core_ml',
  DEEP_LEARNING: 'deep_learning',
} as const;

export type Phase = (typeof Phase)[keyof typeof Phase];

export const PHASE_ORDER: Phase[] = [
  Phase.FOUNDATION,
  Phase.CORE_ML,
  Phase.DEEP_LEARNING,
];

export const PHASE_LABELS: Record<Phase, string> = {
  [Phase.FOUNDATION]: 'Foundation',
  [Phase.CORE_ML]: 'Core ML',
  [Phase.DEEP_LEARNING]: 'Deep Learning',
};

export const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  [Phase.FOUNDATION]: 'Build foundational skills: Python, Math, and Data fundamentals',
  [Phase.CORE_ML]: 'Master core machine learning: Algorithms, Scikit-learn, and Projects',
  [Phase.DEEP_LEARNING]: 'Explore deep learning: Neural Networks, TensorFlow/PyTorch',
};

export const PHASE_ACCESS: Record<Phase, ('free' | 'trial' | 'pro')[]> = {
  [Phase.FOUNDATION]: ['trial', 'pro'],
  [Phase.CORE_ML]: ['pro'],
  [Phase.DEEP_LEARNING]: ['pro'],
};
