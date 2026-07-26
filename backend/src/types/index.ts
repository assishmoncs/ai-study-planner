import type { Request } from 'express';
import type { Document, Types } from 'mongoose';

/* ------------------------------------------------------------------ */
/*  Mongoose document interfaces                                      */
/* ------------------------------------------------------------------ */

export interface IUserPreferences {
  studyHoursPerDay: number;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  pomodoroLength: number;
  breakLength: number;
  timezone: string;
}

export interface IUser extends Document<Types.ObjectId> {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  preferences: IUserPreferences;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IStudyPlan extends Document<Types.ObjectId> {
  user: Types.ObjectId;
  title: string;
  subject: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  targetHours: number;
  completedHours: number;
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  aiGenerated: boolean;
  aiSuggestions?: string;
  color: string;
  progressPercent: number;
}

export interface ITask extends Document<Types.ObjectId> {
  user: Types.ObjectId;
  studyPlan?: Types.ObjectId | null;
  title: string;
  description?: string;
  dueDate?: Date | null;
  estimatedMinutes: number;
  actualMinutes: number;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  pomodoroSessions: number;
  completedAt?: Date | null;
}

/* ------------------------------------------------------------------ */
/*  Auth / JWT                                                        */
/* ------------------------------------------------------------------ */

export interface AuthPayload {
  id: string;
  type: 'access' | 'refresh';
  jti?: string;
}

export interface CustomRequest extends Request {
  user?: IUser;
}

/* ------------------------------------------------------------------ */
/*  Service payloads                                                  */
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
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  studyPlan?: string;
  dueDate?: string;
}

export interface AIGeneratePayload {
  subject: string;
  daysAvailable: number;
  hoursPerDay: number;
  currentLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface AIStudyPlanResponse {
  title: string;
  summary: string;
  dailyPlan: Array<{
    day: number;
    focus: string;
    tasks: string[];
  }>;
  resources: string[];
  milestones: string[];
  tips: string[];
}

/* ------------------------------------------------------------------ */
/*  API response shapes                                               */
/* ------------------------------------------------------------------ */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ msg: string; param?: string; location?: string }>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
