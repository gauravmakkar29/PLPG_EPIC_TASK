import type { Phase } from '../constants/phases';
import type { Skill } from './skill';

export interface Roadmap {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  sourceRole: string;
  targetRole: string;
  totalEstimatedHours: number;
  completedHours: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoadmapModule {
  id: string;
  roadmapId: string;
  skillId: string;
  phase: Phase;
  sequenceOrder: number;
  isLocked: boolean;
  isSkipped: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoadmapWithModules extends Roadmap {
  modules: RoadmapModuleWithSkill[];
}

export interface RoadmapModuleWithSkill extends RoadmapModule {
  skill: Skill;
  progress: Progress | null;
}

export interface RoadmapSummary {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  totalHours: number;
  completedHours: number;
  currentPhase: Phase;
  percentComplete: number;
}
