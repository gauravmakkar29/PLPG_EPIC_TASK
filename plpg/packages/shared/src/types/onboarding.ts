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
  currentStep: number;
  totalSteps: number;
  responses: Record<string, string | string[]>;
  isComplete: boolean;
}
