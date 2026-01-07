export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  category: FeedbackCategory;
  content: string;
  rating: number | null;
  metadata: Record<string, unknown> | null;
  status: FeedbackStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type FeedbackType =
  | 'bug'
  | 'feature_request'
  | 'general'
  | 'resource_quality'
  | 'content_suggestion';

export type FeedbackCategory =
  | 'roadmap'
  | 'resources'
  | 'ui_ux'
  | 'performance'
  | 'other';

export type FeedbackStatus =
  | 'pending'
  | 'reviewed'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface FeedbackInput {
  type: FeedbackType;
  category: FeedbackCategory;
  content: string;
  rating?: number;
  metadata?: Record<string, unknown>;
}
