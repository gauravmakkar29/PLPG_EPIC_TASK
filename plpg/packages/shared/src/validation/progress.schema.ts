import { z } from 'zod';

export const progressStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'skipped',
]);

export const updateProgressSchema = z.object({
  status: progressStatusSchema.optional(),
  timeSpentMinutes: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

export const logTimeSchema = z.object({
  moduleId: z.string().uuid(),
  minutes: z.number().min(1).max(480),
  notes: z.string().max(500).optional(),
});

export const weeklyCheckinSchema = z.object({
  hoursSpent: z.number().min(0).max(168),
  challengesFaced: z.string().max(1000).optional(),
  winsAchieved: z.string().max(1000).optional(),
  focusNextWeek: z.string().max(500).optional(),
  motivationLevel: z.number().min(1).max(10),
});

export type ProgressStatusInput = z.infer<typeof progressStatusSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type LogTimeInput = z.infer<typeof logTimeSchema>;
export type WeeklyCheckinInput = z.infer<typeof weeklyCheckinSchema>;
