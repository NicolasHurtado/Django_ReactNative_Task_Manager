import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar,
  ImageBackground
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation';

type SplashScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

const SplashScreen = () => {
  // Usamos try-catch para manejar el caso cuando el componente se usa fuera del NavigationContainer
  let navigation: SplashScreenNavigationProp | null = null;
  
  try {
    navigation = useNavigation<SplashScreenNavigationProp>();
  } catch (error) {
    // Si hay un error al obtener el objeto de navegación, simplemente continuamos
    // sin navegación, lo que significa que estamos fuera del NavigationContainer
  }

  useEffect(() => {
    // Solo navegamos a Login si tenemos un objeto de navegación válido
    if (navigation) {
      // Navigate to Login screen after 2 seconds
      const timer = setTimeout(() => {
        navigation.replace('Login');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [navigation]);

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

export default SplashScreen; 