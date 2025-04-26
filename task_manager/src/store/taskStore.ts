import { create } from 'zustand';
import { 
  fetchTasks, 
  fetchTask,
  createTask, 
  updateTask, 
  deleteTask,
  searchTasksByDateRange,
  Task,
  TaskFormData
} from '../api/tasksApi';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filteredTasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  fetchTasks: () => Promise<void>;
  fetchTask: (id: number) => Promise<void>;
  createTask: (taskData: TaskFormData) => Promise<void>;
  updateTask: (id: number, taskData: Partial<TaskFormData>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  markAsCompleted: (id: number) => Promise<void>;
  searchByDateRange: (startDate: string, endDate?: string, searchQuery?: string) => Promise<void>;
  filterByName: (query: string) => void;
  clearError: () => void;
  setSelectedTask: (task: Task | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  filteredTasks: [],
  isLoading: false,
  error: null,
  
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await fetchTasks();
      //console.log(tasks);
      set({ tasks, filteredTasks: tasks, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Error loading tasks', 
        isLoading: false 
      });
    }
  },
  
  fetchTask: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const task = await fetchTask(id);
      set({ selectedTask: task, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Error loading task', 
        isLoading: false 
      });
    }
  },
  
  createTask: async (taskData: TaskFormData) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await createTask(taskData);
      set(state => ({ 
        tasks: [...state.tasks, newTask], 
        filteredTasks: [...state.filteredTasks, newTask],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Error creating task', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateTask: async (id: number, taskData: Partial<TaskFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await updateTask(id, taskData);
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? updatedTask : task
        ),
        filteredTasks: state.filteredTasks.map(task => 
          task.id === id ? updatedTask : task
        ),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Error updating task', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  deleteTask: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTask(id);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        filteredTasks: state.filteredTasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Error deleting task', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  markAsCompleted: async (id: number) => {
    return get().updateTask(id, { completed: true });
  },
  
  searchByDateRange: async (startDate: string, endDate?: string, searchQuery?: string) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await searchTasksByDateRange(startDate, endDate);
      
      // if there is a text search, we also filter by title
      let filteredResults = tasks;
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredResults = tasks.filter(task => 
          task.title.toLowerCase().includes(query)
        );
      }
      
      set({ filteredTasks: filteredResults, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Error searching tasks', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  filterByName: (query: string) => {
    const { tasks } = get();
    if (query.trim() === '') {
      set({ filteredTasks: tasks });
    } else {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = tasks.filter(task => 
        task.title.toLowerCase().includes(lowerCaseQuery)
      );
      set({ filteredTasks: filtered });
    }
  },
  
  clearError: () => set({ error: null }),
  
  setSelectedTask: (task: Task | null) => set({ selectedTask: task }),
})); 