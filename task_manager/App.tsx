import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ImageBackground, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation';

export default function App() {
  // preload image
  const [loaded, setLoaded] = useState(false);
  
  // Ensure the UI doesn't show until we've loaded a minimum
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!loaded) {
    return null; // Don't show anything until we're ready
  }
  
  return (
    <ImageBackground
      source={require('./assets/Blur.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaProvider style={styles.container}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        <AppNavigator />
      </SafeAreaProvider>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  }
});
