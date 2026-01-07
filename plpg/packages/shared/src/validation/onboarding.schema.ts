import { z } from 'zod';

export const onboardingResponseSchema = z.object({
  questionKey: z.string().min(1),
  answer: z.union([z.string(), z.array(z.string())]),
});

export const submitOnboardingSchema = z.object({
  responses: z.array(onboardingResponseSchema),
});

export const currentRoleSchema = z.object({
  role: z.string().min(1, 'Please select your current role'),
  yearsExperience: z.number().min(0).max(50),
  primaryLanguages: z.array(z.string()).min(1, 'Select at least one language'),
});

export const targetRoleSchema = z.object({
  targetRole: z.string().min(1, 'Please select your target role'),
  timeline: z.enum(['3_months', '6_months', '12_months', '18_months']),
  hoursPerWeek: z.number().min(1).max(40),
});

export const learningStyleSchema = z.object({
  preferredFormats: z.array(z.enum(['video', 'article', 'interactive', 'project'])).min(1),
  learningPace: z.enum(['self_paced', 'structured', 'intensive']),
  priorKnowledge: z.array(z.string()),
});

export type OnboardingResponseInput = z.infer<typeof onboardingResponseSchema>;
export type SubmitOnboardingInput = z.infer<typeof submitOnboardingSchema>;
export type CurrentRoleInput = z.infer<typeof currentRoleSchema>;
export type TargetRoleInput = z.infer<typeof targetRoleSchema>;
export type LearningStyleInput = z.infer<typeof learningStyleSchema>;
