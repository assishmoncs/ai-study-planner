import type { StudyPlanStatus, TaskStatus } from './index';

export interface TaskStatusSummary {
  _id: TaskStatus;
  count: number;
}
export interface PlanStatusSummary {
  _id: StudyPlanStatus;
  count: number;
  totalCompletedHours: number;
}

export interface AnalyticsSummary {
  taskStats: TaskStatusSummary[];
  planStats: PlanStatusSummary[];
}

export interface DailyActivity {
  _id: string;
  tasksCompleted: number;
  minutesStudied: number;
}

export interface SubjectActivity {
  _id: string;
  totalCompletedHours: number;
  totalTargetHours: number;
  planCount: number;
}
