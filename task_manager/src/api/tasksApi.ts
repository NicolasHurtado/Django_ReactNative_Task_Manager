import apiClient from './client';

// Interfaces
export interface Task {
  id: number;
  title: string;
  description: string;
  start_date: string;
  due_date?: string | null;
  completed: boolean;
  user: number;
  assigned_user?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface TaskFormData {
  title: string;
  description: string;
  start_date: string;
  due_date?: string | null;
  completed?: boolean;
  user?: number;
}

/**
 * Get all tasks for the authenticated user
 */
export const fetchTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get('/tasks/');
  return response.data;
};

/**
 * Get a specific task
 */
export const fetchTask = async (id: number): Promise<Task> => {
  const response = await apiClient.get(`/tasks/${id}/`);
  return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (taskData: TaskFormData): Promise<Task> => {
  const response = await apiClient.post('/tasks/', taskData);
  return response.data;
};

/**
 * Update an existing task
 */
export const updateTask = async (id: number, taskData: Partial<TaskFormData>): Promise<Task> => {
  const response = await apiClient.patch(`/tasks/${id}/`, taskData);
  return response.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (id: number): Promise<void> => {
  await apiClient.delete(`/tasks/${id}/`);
  return Promise.resolve();
};

/**
 * Search tasks by date range
 */
export const searchTasksByDateRange = async (
  startDate: string,
  endDate?: string
): Promise<Task[]> => {
  const params: Record<string, string> = { start: startDate };
  if (endDate) {
    params.end = endDate;
  }
  
  const response = await apiClient.get('/tasks/search/', { params });
  return response.data;
}; 