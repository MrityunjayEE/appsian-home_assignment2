import axios from 'axios';
import { LoginRequest, RegisterRequest, LoginResponse, User, Project, ProjectDetail, Task, ScheduleRequest, ScheduleResponse, ChangePasswordRequest, ScheduleTaskInput } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://appsian-home-assignment2.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: RegisterRequest): Promise<User> =>
    api.post('/auth/register', data).then(res => res.data),
  
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post('/auth/login', data).then(res => res.data),
  
  changePassword: (data: ChangePasswordRequest): Promise<{message: string}> =>
    api.post('/auth/change-password', data).then(res => res.data),
};

export const projectsApi = {
  getAll: (): Promise<Project[]> =>
    api.get('/projects').then(res => res.data),
  
  create: (data: { title: string; description?: string }): Promise<Project> =>
    api.post('/projects', data).then(res => res.data),
  
  getById: (id: number): Promise<ProjectDetail> =>
    api.get(`/projects/${id}`).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/projects/${id}`).then(res => res.data),
};

export const tasksApi = {
  create: (projectId: number, data: { title: string; dueDate?: string }): Promise<Task> =>
    api.post(`/projects/${projectId}/tasks`, data).then(res => res.data),
  
  update: (taskId: number, data: { title?: string; dueDate?: string; isCompleted?: boolean }): Promise<Task> =>
    api.put(`/tasks/${taskId}`, data).then(res => res.data),
  
  delete: (taskId: number): Promise<void> =>
    api.delete(`/tasks/${taskId}`).then(res => res.data),
};

export const schedulerApi = {
  generateSchedule: (projectId: number, data: ScheduleRequest): Promise<ScheduleResponse> =>
    api.post(`/v1/projects/${projectId}/schedule`, data).then(res => res.data),
  
  getSchedulerTasks: (projectId: number): Promise<ScheduleTaskInput[]> =>
    api.get(`/v1/projects/${projectId}/scheduler-tasks`).then(res => res.data),
  
  saveSchedulerTasks: (projectId: number, tasks: ScheduleTaskInput[]): Promise<void> =>
    api.post(`/v1/projects/${projectId}/save-scheduler-tasks`, tasks).then(res => res.data),
  
  getSchedulerStatus: (projectId: number): Promise<{title: string, isCompleted: boolean, taskId?: number}[]> =>
    api.get(`/v1/projects/${projectId}/scheduler-status`).then(res => res.data),
  
  getScheduleResult: (projectId: number): Promise<ScheduleResponse | null> =>
    api.get(`/v1/projects/${projectId}/schedule-result`).then(res => res.data),
};
