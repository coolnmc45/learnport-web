export type UserRole = 'learner' | 'assessor' | 'trainer' | 'iqa' | 'eqa';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  centreId?: number;
  programme?: string;
}

export type SubmissionStatus = 'draft' | 'submitted' | 'marking' | 'marked' | 'passed' | 'referred';

export interface Submission {
  id: number;
  learnerId: number;
  unitId: number;
  criterionId: number;
  title: string;
  description?: string;
  fileUrl?: string;
  status: SubmissionStatus;
  createdAt: Date;
  submittedAt?: Date;
}

export type Grade = 'pass' | 'distinction' | 'refer';

export interface Marking {
  id: number;
  submissionId: number;
  assessorId: number;
  grade: Grade;
  overallFeedback: string;
  flaggedForIqa: boolean;
  markedAt: Date;
}

export interface TrainingSession {
  id: number;
  title: string;
  description?: string;
  trainerId: number;
  startDate: Date;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export interface LearningMaterial {
  id: number;
  title: string;
  type: 'pdf' | 'video' | 'link';
  url: string;
  trainerId: number;
}

export interface Unit {
  id: number;
  code: string;
  title: string;
  criteria: Criterion[];
}

export interface Criterion {
  id: number;
  unitId: number;
  code: string;
  description: string;
}
