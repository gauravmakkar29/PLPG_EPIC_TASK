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

export type OnboardingStepData = Step1Data | Step2Data | Step3Data;

export const ONBOARDING_TOTAL_STEPS = 3;

export const CURRENT_ROLES = [
  { value: 'backend_developer', label: 'Backend Developer', description: 'Build server-side applications and APIs' },
  { value: 'devops_engineer', label: 'DevOps Engineer', description: 'Manage infrastructure and deployments' },
  { value: 'data_analyst', label: 'Data Analyst', description: 'Analyze data and create insights' },
  { value: 'qa_engineer', label: 'QA Engineer', description: 'Test and ensure software quality' },
  { value: 'it_professional', label: 'IT Professional', description: 'General IT support and administration' },
  { value: 'other', label: 'Other', description: 'Specify your role' },
] as const;

export const TARGET_ROLES = [
  { value: 'frontend_developer', label: 'Frontend Developer', description: 'Build user interfaces and web apps' },
  { value: 'backend_developer', label: 'Backend Developer', description: 'Build server-side applications and APIs' },
  { value: 'fullstack_developer', label: 'Full Stack Developer', description: 'Work on both frontend and backend' },
  { value: 'devops_engineer', label: 'DevOps Engineer', description: 'Manage infrastructure and deployments' },
  { value: 'data_engineer', label: 'Data Engineer', description: 'Build data pipelines and systems' },
  { value: 'ml_engineer', label: 'ML Engineer', description: 'Build machine learning systems' },
] as const;

export const WEEKLY_HOURS_OPTIONS = [
  { value: 5, label: '5 hours/week', description: 'Casual learning pace' },
  { value: 10, label: '10 hours/week', description: 'Moderate commitment' },
  { value: 15, label: '15 hours/week', description: 'Dedicated learner' },
  { value: 20, label: '20 hours/week', description: 'Intensive learning' },
  { value: 30, label: '30+ hours/week', description: 'Full-time commitment' },
] as const;
