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
import { RegisterData } from '../../api/authApi';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

// Validation schema with Yup
const RegisterSchema = Yup.object().shape({
  first_name: Yup.string().required('Firstname is required'),
  last_name: Yup.string().required('Lastname is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'The password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Include at least one uppercase, one lowercase and one number'
    )
    .required('Password is required'),
  password_confirm: Yup.string()
    .oneOf([Yup.ref('password')], 'The passwords do not match')
    .required('Confirm your password'),
});

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Initial form values - username será generado automáticamente en el backend
  const initialValues: RegisterData = {
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Function to handle the registration
  const handleRegister = async (values: RegisterData) => {
    try {
      // Asignamos el username como el email para simplificar
      values.username = values.email.split('@')[0];
      await register(values);
      Alert.alert(
        'Cuenta Creada',
        'Tu cuenta ha sido creada con éxito. Ahora puedes iniciar sesión.',
        [{ text: 'Aceptar', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      // The error is already handled in the store
      console.log('Error en registro:', error);
    }
  };

  // Back button for navigation
  const BackButton = () => (
    <TouchableOpacity 
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.backButtonText}>←</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <BackButton />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Just a few steps away to</Text>
              <Text style={styles.subtitle}>complete your tasks.</Text>
            </View>
          </View>

          <Formik
            initialValues={initialValues}
            validationSchema={RegisterSchema}
            onSubmit={handleRegister}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <Text style={styles.label}>Firstname</Text>
                <Input
                  placeholder="Your firstname"
                  value={values.first_name}
                  onChangeText={handleChange('first_name')}
                  onBlur={handleBlur('first_name')}
                  containerStyle={styles.inputContainer}
                  inputStyle={{
                    ...styles.input,
                    ...(touched.first_name && errors.first_name ? styles.inputError : {})
                  }}
                />
                {touched.first_name && errors.first_name && (
                  <Text style={styles.errorMessage}>{errors.first_name}</Text>
                )}

                <Text style={styles.label}>Lastname</Text>
                <Input
                  placeholder="Your lastname"
                  value={values.last_name}
                  onChangeText={handleChange('last_name')}
                  onBlur={handleBlur('last_name')}
                  containerStyle={styles.inputContainer}
                  inputStyle={{
                    ...styles.input,
                    ...(touched.last_name && errors.last_name ? styles.inputError : {})
                  }}
                />
                {touched.last_name && errors.last_name && (
                  <Text style={styles.errorMessage}>{errors.last_name}</Text>
                )}

                <Text style={styles.label}>Email</Text>
                <Input
                  placeholder="juan@juan.com"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  containerStyle={styles.inputContainer}
                  inputStyle={{
                    ...styles.input,
                    ...(touched.email && errors.email ? styles.inputError : {})
                  }}
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorMessage}>{errors.email}</Text>
                )}

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <Input
                    placeholder="Your password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureTextEntry={!showPassword}
                    containerStyle={styles.passwordInputContainer}
                    inputStyle={{
                      ...styles.input,
                      ...(touched.password && errors.password ? styles.inputError : {})
                    }}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={togglePasswordVisibility}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color="#aaaaaa"
                    />
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.errorMessage}>{errors.password}</Text>
                )}

                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <Input
                    placeholder="Your password"
                    value={values.password_confirm}
                    onChangeText={handleChange('password_confirm')}
                    onBlur={handleBlur('password_confirm')}
                    secureTextEntry={!showConfirmPassword}
                    containerStyle={styles.passwordInputContainer}
                    inputStyle={{
                      ...styles.input,
                      ...(touched.password_confirm && errors.password_confirm ? styles.inputError : {})
                    }}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={toggleConfirmPasswordVisibility}
                  >
                    <MaterialCommunityIcons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color="#aaaaaa"
                    />
                  </TouchableOpacity>
                </View>
                {touched.password_confirm && errors.password_confirm && (
                  <Text style={styles.errorMessage}>
                    {errors.password_confirm === 'Confirma tu contraseña' 
                      ? 'Password and confirm password must match.' 
                      : errors.password_confirm}
                  </Text>
                )}

                <Button
                  title="Create account"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  style={styles.createButton}
                />

                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
              </View>
            )}
          </Formik>
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
    padding: 20,
  },
  header: {
    marginBottom: 30,
    position: 'relative',
  },
  titleContainer: {
    justifyContent: 'center',
    marginTop: 7,
    alignItems: 'flex-start',
    marginLeft: 45,
    marginBottom: 7,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 28,
    color: '#000',
    fontStyle: 'italic',
    textAlign: 'left',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4F52',
    marginBottom: 8,
    paddingTop: 15,
    fontFamily: 'Inter',                   
    
  },
  inputContainer: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 50,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  errorMessage: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 5,
    marginTop: 4,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  passwordInputContainer: {
    marginBottom: 0,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  createButton: {
    marginTop: 25,
    backgroundColor: '#0A82FF',
    borderRadius: 8,
    height: 52,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default RegisterScreen; 