import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  login, 
  register, 
  verifyToken, 
  getCurrentUser,
  LoginCredentials, 
  RegisterData,
  User 
} from '../api/authApi';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Interface for the authentication state
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await login(credentials);
      
      // Extract the access token and user data from the response
      const { access, user } = response;
      
      // Save the token and user data to AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, access);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Update the state
      set({ 
        token: access, 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      console.log('error ', error);
      set({ 
        error: error.response?.data?.detail || 'Error in login', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await register(userData);
      set({ isLoading: false });
      // We don't automatically log in after registration
    } catch (error: any) {
      const errorMessage = error.response?.data || {};
      const errorText = Object.keys(errorMessage)
        .map(key => `${key}: ${errorMessage[key]}`)
        .join(', ');
      
      set({ 
        error: errorText || 'Error in registration', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(USER_KEY);
      
      if (token) {
        const isValid = verifyToken(token);
        if (isValid) {
          const userData = userJson ? JSON.parse(userJson) : null;
          set({ token, user: userData, isAuthenticated: true });
          return true;
        } else {
          await AsyncStorage.removeItem(TOKEN_KEY);
          await AsyncStorage.removeItem(USER_KEY);
          set({ token: null, user: null, isAuthenticated: false });
        }
      }
    } catch (error) {
      console.error('Error verifying authentication:', error);
      set({ token: null, user: null, isAuthenticated: false });
    }
    return false;
  },
  
  clearError: () => set({ error: null }),
})); 