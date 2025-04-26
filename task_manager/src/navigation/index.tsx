import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TaskListScreen from '../screens/tasks/TaskListScreen';
import SplashScreen from '../screens/SplashScreen';

// Define types for navigation
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  TaskList: undefined;
};

// Create navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();

// Authentication navigator
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: 'transparent' },
    }}
  >
    <AuthStack.Screen
      name="Login"
      component={LoginScreen}
    />
    <AuthStack.Screen
      name="Register"
      component={RegisterScreen}
    />
  </AuthStack.Navigator>
);

// Main application navigator
const MainNavigator = () => (
  <MainStack.Navigator
    screenOptions={{ 
      headerStyle: { backgroundColor: '#2196F3' },
      headerTintColor: '#fff',
    }}
  >
    <MainStack.Screen 
      name="TaskList" 
      component={TaskListScreen} 
      options={{ title: 'My Tasks' }} 
    />
  </MainStack.Navigator>
);

// Root navigator with authentication state handling
const AppNavigator = () => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Initialization of the authentication
  useEffect(() => {
    const initialize = async () => {
      await checkAuth();
      setIsInitializing(false);
      
      // Show the splash for 2 seconds when starting
      setTimeout(() => {
        setShowSplash(false);
      }, 2000);
    };
    
    initialize();
  }, []);

  // Handle logout
  useEffect(() => {
    // If not initializing and changes to unauthenticated, show splash
    if (!isInitializing && !isAuthenticated && !showSplash) {
      setShowSplash(true);
      
      // Show for 2 seconds
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isInitializing]);

  // If we are in splash, show the SplashScreen component
  if (showSplash) {
    return <SplashScreen />;
  }

  // Main navigation based on authentication
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator; 