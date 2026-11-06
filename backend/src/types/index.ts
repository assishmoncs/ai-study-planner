import type { Request } from 'express';
import type { Document, Types } from 'mongoose';

/* ------------------------------------------------------------------ */
/*  Mongoose Document Interfaces                                      */
/* ------------------------------------------------------------------ */

/**
 * User-configurable study and Pomodoro preferences.
 */
export interface IUserPreferences {
  studyHoursPerDay: number;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  pomodoroLength: number;
  breakLength: number;
  timezone: string;
}

/**
 * Authenticated user document stored in MongoDB.
 */
export interface IUser extends Document<Types.ObjectId> {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  preferences: IUserPreferences;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type StudyPlanStatus = 'active' | 'paused' | 'completed' | 'archived';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Study plan document representing a structured learning goal.
 */
export interface IStudyPlan extends Document<Types.ObjectId> {
  user: Types.ObjectId;
  title: string;
  subject: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  targetHours: number;
  completedHours: number;
  status: StudyPlanStatus;
  priority: PriorityLevel;
  tags: string[];
  aiGenerated: boolean;
  aiSuggestions?: string;
  color: string;
  progressPercent: number;
}

/**
 * Individual actionable study task optionally linked to a StudyPlan.
 */
export interface ITask extends Document<Types.ObjectId> {
  user: Types.ObjectId;
  studyPlan?: Types.ObjectId | null;
  title: string;
  description?: string;
  dueDate?: Date | null;
  estimatedMinutes: number;
  actualMinutes: number;
  status: TaskStatus;
  priority: PriorityLevel;
  tags: string[];
  pomodoroSessions: number;
  completedAt?: Date | null;
}

/* ------------------------------------------------------------------ */
/*  Auth / JWT                                                        */
/* ------------------------------------------------------------------ */

/**
 * Decoded JWT payload structure for access and refresh tokens.
 */
export interface AuthPayload {
  id: string;
  type: 'access' | 'refresh';
  jti?: string;
}

/**
 * Express Request augmented with the authenticated user and request ID.
 */
export interface CustomRequest extends Request {
  user?: IUser;
}

/* ------------------------------------------------------------------ */
/*  Service & Repository Payloads                                     */
/* ------------------------------------------------------------------ */

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  avatar?: string;
  preferences?: Partial<IUserPreferences>;
}

export interface StudyPlanFilters {
  status?: string;
  subject?: string;
  priority?: string;
  search?: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  studyPlan?: string;
  dueDate?: string;
  search?: string;
}

export interface AIGeneratePayload {
  subject: string;
  daysAvailable: number;
  hoursPerDay: number;
  currentLevel?: SkillLevel;
  goals?: string;
}

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

export interface AITaskSuggestionPayload {
  subject: string;
  description?: string;
  count?: number;
}

/* ------------------------------------------------------------------ */
/*  API Response Shapes                                               */
/* ------------------------------------------------------------------ */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  requestId?: string;
  errors?: Array<{ msg: string; param?: string; path?: string; location?: string }> | string[];
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
