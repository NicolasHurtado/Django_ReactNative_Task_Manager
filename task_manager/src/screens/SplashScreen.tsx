import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
} from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.contentContainer}>
      <View style={styles.logoOuterCircle}>
        <View style={styles.logoInnerCircle}>
          <Text style={styles.logoText}>C</Text>
        </View>
      </View>
      <Text style={styles.appName}>Collaby</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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