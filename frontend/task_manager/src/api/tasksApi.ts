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
}

export interface TaskFormData {
  title: string;
  description: string;
  start_date: string;
  due_date?: string | null;
  completed?: boolean;
}

/**
 * Obtiene todas las tareas del usuario
 */
export const fetchTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get('/tasks/');
  return response.data;
};

/**
 * Obtiene una tarea específica
 */
export const fetchTask = async (id: number): Promise<Task> => {
  const response = await apiClient.get(`/tasks/${id}/`);
  return response.data;
};

/**
 * Crea una nueva tarea
 */
export const createTask = async (taskData: TaskFormData): Promise<Task> => {
  const response = await apiClient.post('/tasks/', taskData);
  return response.data;
};

/**
 * Actualiza una tarea existente
 */
export const updateTask = async (id: number, taskData: Partial<TaskFormData>): Promise<Task> => {
  const response = await apiClient.patch(`/tasks/${id}/`, taskData);
  return response.data;
};

/**
 * Elimina una tarea
 */
export const deleteTask = async (id: number): Promise<void> => {
  await apiClient.delete(`/tasks/${id}/`);
  return Promise.resolve();
};

/**
 * Busca tareas por rango de fechas
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