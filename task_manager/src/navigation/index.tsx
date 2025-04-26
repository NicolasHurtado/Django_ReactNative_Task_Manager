import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text, StyleSheet, StatusBar, ImageBackground } from 'react-native';
import { useAuthStore } from '../store/authStore';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TaskListScreen from '../screens/tasks/TaskListScreen';
import SplashScreen from '../screens/SplashScreen';

// Define types for navigation
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  TaskList: undefined;
};

// Create navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();

// Versión simplificada del SplashScreen para usar después del logout
// sin depender de los hooks de navegación
const LogoutSplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../../assets/Blur.png')}
        style={styles.backgroundImage}
      >
        <View style={styles.contentContainer}>
          <View style={styles.logoOuterCircle}>
            <View style={styles.logoInnerCircle}>
              <Text style={styles.logoText}>C</Text>
            </View>
          </View>
          <Text style={styles.appName}>Collaby</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

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
  </MainStack.Navigator>
);

// Main navigator with authentication verification
const AppNavigator = () => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showSplashAfterLogout, setShowSplashAfterLogout] = useState(false);
  
  // Monitorear cambios en isAuthenticated para determinar si es un logout
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // Si no está autenticado y no está cargando inicialmente, 
      // probablemente es un logout
      setShowSplashAfterLogout(true);
      
      // Resetear después de 2 segundos (tiempo que toma el SplashScreen)
      const timer = setTimeout(() => {
        setShowSplashAfterLogout(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

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
  
  // Si recién se hizo logout, mostrar nuestra versión simplificada del SplashScreen
  if (showSplashAfterLogout) {
    return <LogoutSplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// Estilos para LogoutSplashScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoOuterCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInnerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0078FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
  },
});

export default AppNavigator; 