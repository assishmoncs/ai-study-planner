export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    studyHoursPerDay: number;
    preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
    pomodoroLength: number;
    breakLength: number;
    timezone: string;
  };
  createdAt: string;
  updatedAt: string;
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
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  pomodoroSessions: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ msg: string; param?: string }>;
}
