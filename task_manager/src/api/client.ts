import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure the IP of your local machine where Docker is running
const TU_IP_LOCAL = '192.168.1.8'; // CHANGE THIS to your actual IP (e.g., 192.168.1.5)

// Configuration of URL according to the platform where the app is running
let API_URL = `http://${TU_IP_LOCAL}:8000/api`;


console.log('API URL configured:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor to add the JWT token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log of the complete URL that is being used
      console.log('Sending request to:', `${config.baseURL}${config.url}`);
      console.log('Method:', config.method?.toUpperCase());
      console.log('Data sent:', config.data);
      
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.error('Error in request:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.detail || 'No detail'
    });
    return Promise.reject(error);
  }
);

// Interceptor to handle response errors (401, 403, etc.)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 (unauthorized) and we haven't tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Here we could implement the logic to refresh the token
      // For now, we simply reject the promise
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 