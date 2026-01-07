export interface Progress {
  id: string;
  userId: string;
  roadmapModuleId: string;
  status: ProgressStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  timeSpentMinutes: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProgressStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'skipped';

export interface ProgressUpdate {
  status?: ProgressStatus;
  timeSpentMinutes?: number;
  notes?: string;
}

export interface DailyProgress {
  date: string;
  minutesSpent: number;
  modulesCompleted: number;
}

export interface WeeklyStats {
  totalMinutes: number;
  modulesCompleted: number;
  streak: number;
  averageMinutesPerDay: number;
}
