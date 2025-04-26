import apiClient from './client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * User login using email
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // El campo username contiene el email del usuario
  const response = await apiClient.post('/auth/login/', credentials);
  return response.data;
};

/**
 * Get the current user information
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/token/me/');
  return response.data;
};

/**
 * Get all users
 */
export const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/auth/users/');
  console.log('users: ', response.data);
  return response.data;
};

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<any> => {
  const response = await apiClient.post('/auth/register/', userData);
  return response.data;
};

/**
 * Verify if the user's token is valid by checking its expiration
 * This is a local verification and doesn't require a backend call
 */
export const verifyToken = (token: string): boolean => {
  try {
    // Decode the token
    const decodedToken: any = jwtDecode(token);
    
    // Check if the token has an expiration claim
    if (!decodedToken.exp) {
      return false;
    }
    
    // Token expiration is stored as seconds since epoch
    // Convert to milliseconds for JavaScript Date
    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    
    // Token is valid if the current time is before the expiration time
    console.log('is token valid? ', currentTime < expirationTime);
    return currentTime < expirationTime;
  } catch (error) {
    // If there's an error decoding the token, it's invalid
    console.error('Error decoding token:', error);
    return false;
  }
};

/**
 * Close session (only in the client, deletes the token)
 */
export const logout = async (): Promise<void> => {
  // This function would be handled by the store
  return Promise.resolve();
}; 