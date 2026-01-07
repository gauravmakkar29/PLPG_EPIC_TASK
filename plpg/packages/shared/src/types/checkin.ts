export interface WeeklyCheckin {
  id: string;
  userId: string;
  weekStartDate: Date;
  hoursSpent: number;
  challengesFaced: string | null;
  winsAchieved: string | null;
  focusNextWeek: string | null;
  motivationLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckinSummary {
  totalCheckins: number;
  averageHoursPerWeek: number;
  averageMotivation: number;
  streakWeeks: number;
  lastCheckinDate: Date | null;
}

export interface CheckinInput {
  hoursSpent: number;
  challengesFaced?: string;
  winsAchieved?: string;
  focusNextWeek?: string;
  motivationLevel: number;
}
