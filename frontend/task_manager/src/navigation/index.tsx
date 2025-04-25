import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuthStore } from '../store/authStore';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TaskListScreen from '../screens/tasks/TaskListScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import CreateTaskScreen from '../screens/tasks/CreateTaskScreen';
import SplashScreen from '../screens/SplashScreen';

// Define types for navigation
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: number };
  CreateTask: undefined;
};

// Create navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();

// Navigator for authentication screens
const AuthNavigator = () => (
  <AuthStack.Navigator 
    initialRouteName="Splash"
    screenOptions={{ 
      headerShown: false,
      cardStyle: { backgroundColor: '#fff' }
    }}
  >
    <AuthStack.Screen 
      name="Splash" 
      component={SplashScreen} 
    />
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

// Navigator for main screens
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
    <MainStack.Screen 
      name="TaskDetail" 
      component={TaskDetailScreen} 
      options={{ title: 'Task Detail' }} 
    />
    <MainStack.Screen 
      name="CreateTask" 
      component={CreateTaskScreen} 
      options={{ title: 'New Task' }} 
    />
  </MainStack.Navigator>
);

// Main navigator with authentication verification
const AppNavigator = () => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator; 