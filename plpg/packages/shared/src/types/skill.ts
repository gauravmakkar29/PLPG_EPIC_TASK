import type { Phase } from '../constants/phases.js';

export interface PrerequisiteSkill {
  id: string;
  name: string;
  slug: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  whyThisMatters: string | null;
  phase: Phase;
  estimatedHours: number;
  isOptional: boolean;
  sequenceOrder: number;
  prerequisites?: PrerequisiteSkill[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillDependency {
  id: string;
  skillId: string;
  dependsOnId: string;
  isHard: boolean;
}

export interface SkillWithDependencies extends Skill {
  dependencies: SkillDependency[];
  dependents: SkillDependency[];
  resources: Resource[];
}

export interface Resource {
  id: string;
  skillId: string;
  title: string;
  url: string;
  type: ResourceType;
  provider: string | null;
  durationMinutes: number | null;
  isFree: boolean;
  quality: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ResourceType =
  | 'video'
  | 'article'
  | 'course'
  | 'book'
  | 'tutorial'
  | 'documentation'
  | 'exercise'
  | 'project';
