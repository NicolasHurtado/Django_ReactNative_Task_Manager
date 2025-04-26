import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { AuthStackParamList } from '../../navigation';
import { useAuthStore } from '../../store/authStore';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// Schema for validation with Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Em ail is not valid').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  
  // Function to handle login
  const handleLogin = async (values: { email: string; password: string }) => { 
    try {
      // Here the username field contains the user's email
      await login(values);
      // It is not necessary to navigate, the main navigator will detect the change in isAuthenticated 
    } catch (error) {
      // The error is already handled in the store
      Alert.alert('Error', 'Incorrect credentials. Please try again.');      
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Logo component - circular with C in center
  const LogoComponent = () => (
    <View style={styles.logoWrapper}>
      <View style={styles.logoGlow} />
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>C</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <LogoComponent />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Your tasks collaboration</Text>
              <Text style={styles.subtitle}>starts with <Text style={styles.collaby}>Collaby</Text>.</Text>
            </View>
          </View>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <Text style={styles.formLabel}>Email</Text>
                <Input
                  placeholder="Your email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={errors.email}
                  touched={touched.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputStyle}
                />

                <Text style={styles.formLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <Input
                    placeholder="Your password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={errors.password}
                    touched={touched.password}
                    secureTextEntry={!showPassword}
                    containerStyle={{...styles.inputContainer, ...styles.passwordInput}}
                    inputStyle={{
                      ...styles.inputStyle, 
                      ...(errors.password && touched.password ? styles.inputError : {})
                    }}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={togglePasswordVisibility}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color="#aaaaaa"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.forgotPasswordContainer}
                  onPress={() => null}
                >
                  <Text style={styles.forgotPasswordText}>¿Forgot password?</Text>
                </TouchableOpacity>

                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}

                <Button
                  title="Log in"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  fullWidth
                  style={styles.loginButton}
                />
              </View>          
            )}
          </Formik>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Create an account? </Text>
            <TouchableOpacity 
              onPress={() => {
                clearError();
                navigation.navigate('Register');
              }}
            >
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'relative',
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  collaby: {
    fontSize: 22,
    fontWeight: 'normal',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginTop: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
  },
  eyeButton: {
    position: 'absolute', 
    right: 16,
    top: 7,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  inputStyle: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#2196F3',
    fontSize: 14,
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#2196F3',
  },
  footer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#757575',
  },
  registerLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  errorText: { 
    color: '#f44336',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LoginScreen; 