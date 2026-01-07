export interface OnboardingResponse {
  id: string;
  userId: string;
  questionKey: string;
  answer: string | string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingQuestion {
  key: string;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'scale';
  options?: OnboardingOption[];
  required: boolean;
  order: number;
}

export interface OnboardingOption {
  value: string;
  label: string;
  description?: string;
}

export interface OnboardingState {
  id: string;
  userId: string;
  currentStep: number;
  isComplete: boolean;
  isSkipped: boolean;
  currentRole: string | null;
  customRole: string | null;
  targetRole: string | null;
  weeklyHours: number | null;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingStateResponse {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  isSkipped: boolean;
  data: {
    currentRole: string | null;
    customRole: string | null;
    targetRole: string | null;
    weeklyHours: number | null;
    existingSkills: string[];
  };
}

export interface Step1Data {
  currentRole: string;
  customRole?: string;
}

export interface Step2Data {
  targetRole: string;
}

export interface Step3Data {
  weeklyHours: number;
}

export interface Step4Data {
  existingSkills: string[];
}

export type OnboardingStepData = Step1Data | Step2Data | Step3Data | Step4Data;

export const ONBOARDING_TOTAL_STEPS = 5;

// Prerequisite skills that can be skipped during onboarding
export const PREREQUISITE_SKILLS = [
  {
    value: 'python_basics',
    label: 'Python Basics',
    description: 'Variables, data types, loops, functions, and basic OOP concepts',
  },
  {
    value: 'linear_algebra',
    label: 'Linear Algebra',
    description: 'Vectors, matrices, matrix operations, and transformations',
  },
  {
    value: 'statistics_probability',
    label: 'Statistics & Probability',
    description: 'Distributions, hypothesis testing, Bayes theorem, and statistical inference',
  },
  {
    value: 'sql_databases',
    label: 'SQL/Databases',
    description: 'SQL queries, joins, aggregations, and basic database concepts',
  },
  {
    value: 'git_version_control',
    label: 'Git Version Control',
    description: 'Git basics, branching, merging, and collaborative workflows',
  },
  {
    value: 'data_manipulation',
    label: 'Data Manipulation (Pandas/NumPy)',
    description: 'DataFrames, array operations, data cleaning, and transformation',
  },
  {
    value: 'basic_calculus',
    label: 'Basic Calculus',
    description: 'Derivatives, gradients, chain rule, and optimization basics',
  },
] as const;

export type PrerequisiteSkillValue = typeof PREREQUISITE_SKILLS[number]['value'];

export const CURRENT_ROLES = [
  { value: 'backend_developer', label: 'Backend Developer', description: 'Build server-side applications and APIs' },
  { value: 'devops_engineer', label: 'DevOps Engineer', description: 'Manage infrastructure and deployments' },
  { value: 'data_analyst', label: 'Data Analyst', description: 'Analyze data and create insights' },
  { value: 'qa_engineer', label: 'QA Engineer', description: 'Test and ensure software quality' },
  { value: 'it_professional', label: 'IT Professional', description: 'General IT support and administration' },
  { value: 'other', label: 'Other', description: 'Specify your role' },
] as const;

export const TARGET_ROLES = [
  {
    value: 'ml_engineer',
    label: 'ML Engineer',
    description: 'Build machine learning systems and deploy AI models to production',
    isAvailable: true,
    estimatedHours: 200,
    outcomes: [
      'Build and deploy ML models',
      'Design data pipelines for ML',
      'Implement MLOps best practices',
      'Work with popular ML frameworks',
    ],
  },
  {
    value: 'frontend_developer',
    label: 'Frontend Developer',
    description: 'Build user interfaces and web apps',
    isAvailable: false,
    estimatedHours: null,
    outcomes: null,
  },
  {
    value: 'backend_developer',
    label: 'Backend Developer',
    description: 'Build server-side applications and APIs',
    isAvailable: false,
    estimatedHours: null,
    outcomes: null,
  },
  {
    value: 'fullstack_developer',
    label: 'Full Stack Developer',
    description: 'Work on both frontend and backend',
    isAvailable: false,
    estimatedHours: null,
    outcomes: null,
  },
  {
    value: 'devops_engineer',
    label: 'DevOps Engineer',
    description: 'Manage infrastructure and deployments',
    isAvailable: false,
    estimatedHours: null,
    outcomes: null,
  },
  {
    value: 'data_engineer',
    label: 'Data Engineer',
    description: 'Build data pipelines and systems',
    isAvailable: false,
    estimatedHours: null,
    outcomes: null,
  },
] as const;

export const WEEKLY_HOURS_OPTIONS = [
  { value: 5, label: '5 hours/week', description: 'Casual learning pace' },
  { value: 10, label: '10 hours/week', description: 'Moderate commitment' },
  { value: 15, label: '15 hours/week', description: 'Dedicated learner' },
  { value: 20, label: '20 hours/week', description: 'Intensive learning' },
  { value: 30, label: '30+ hours/week', description: 'Full-time commitment' },
] as const;
