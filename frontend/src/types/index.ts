/**
 * Shared frontend TypeScript domain models and API contracts.
 */

export interface UserPreferences {
  studyHoursPerDay: number;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  pomodoroLength: number;
  breakLength: number;
  timezone: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export type StudyPlanStatus = 'active' | 'paused' | 'completed' | 'archived';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface AIDailyPlanItem {
  day: number;
  focus: string;
  tasks: string[];
}

export interface AIStudyPlanResponse {
  title: string;
  summary: string;
  dailyPlan: AIDailyPlanItem[];
  resources: string[];
  milestones: string[];
  tips: string[];
}

export interface AIGeneratePayload {
  subject: string;
  daysAvailable: number;
  hoursPerDay: number;
  currentLevel?: SkillLevel;
  goals?: string;
}

export interface StudyPlan {
  _id: string;
  user: string;
  title: string;
  subject: string;
  description?: string;
  startDate: string;
  endDate: string;
  targetHours: number;
  completedHours: number;
  status: StudyPlanStatus;
  priority: PriorityLevel;
  tags: string[];
  aiGenerated: boolean;
  aiSuggestions?: string;
  color: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  user: string;
  studyPlan?: Pick<StudyPlan, '_id' | 'title' | 'subject' | 'color'> | null;
  title: string;
  description?: string;
  dueDate?: string | null;
  estimatedMinutes: number;
  actualMinutes: number;
  status: TaskStatus;
  priority: PriorityLevel;
  tags: string[];
  pomodoroSessions: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  code?: string;
  requestId?: string;
  data?: T;
  errors?: Array<{ msg: string; param?: string; path?: string }>;
}
