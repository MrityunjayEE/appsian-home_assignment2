export interface User {
  id: number;
  username: string;
  name: string;
  college: string;
  createdAt: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  ownerId: number;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
}

export interface Task {
  id: number;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  createdAt: string;
  projectId: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  college: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface ScheduleTaskInput {
  title: string;
  estimatedHours: number;
  dueDate?: string;
  dependencies: string[];
}

export interface ScheduleRequest {
  tasks: ScheduleTaskInput[];
  workingHoursPerDay?: number;
}

export interface ScheduledTask {
  title: string;
  startDate: string;
  endDate: string;
  allocatedHours: number;
}

export interface ScheduleResponse {
  recommendedOrder: string[];
  schedule: ScheduledTask[];
  warnings: string[];
  errors: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
