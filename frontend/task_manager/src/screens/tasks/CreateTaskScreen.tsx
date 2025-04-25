import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getTaskCategories } from '../../api/categoriesApi';
import { createTask } from '../../api/tasksApi';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import DatePickerModal from '../../components/common/DatePickerModal';
import { MainStackParamList } from '../../navigation';
import { useTaskStore } from '../../store/taskStore';
import { TaskFormData } from '../../api/tasksApi';

type CreateTaskScreenProps = NativeStackScreenProps<MainStackParamList, 'CreateTask'>;

// Schema of validation for the form
const CreateTaskSchema = Yup.object().shape({
  title: Yup.string()
    .required('El título es obligatorio')
    .max(100, 'El título no puede exceder 100 caracteres'),
  description: Yup.string()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  start_date: Yup.date()
    .required('La fecha de inicio es obligatoria'),
  due_date: Yup.date()
    .nullable()
    .test(
      'due-date-after-start-date',
      'La fecha de vencimiento debe ser posterior a la fecha de inicio',
      function(value) {
        const { start_date } = this.parent;
        if (!value || !start_date) return true;
        return new Date(value) >= new Date(start_date);
      }
    ),
});

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ navigation }) => {
  const { createTask, isLoading, error } = useTaskStore();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateType, setActiveDateType] = useState<'start' | 'due'>('start');
  const [categories, setCategories] = useState([]);
  
  // Initial values of the form
  const initialValues: TaskFormData = {
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    due_date: null,
  };

  // Format the date to display
  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return 'No establecida';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to format date for API (YYYY-MM-DD)
  const formatDateForApi = (date: Date): string => {
    // Ajustamos la fecha a medianoche en UTC para evitar problemas de zona horaria
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toISOString().split('T')[0];
  };

  // Open date picker
  const openDatePicker = (type: 'start' | 'due') => {
    setActiveDateType(type);
    setShowDatePicker(true);
  };

  // Handle date selection
  const handleDateSelect = (date: Date, setFieldValue: any) => {
    const formattedDate = formatDateForApi(date);
    if (activeDateType === 'start') {
      setFieldValue('start_date', formattedDate);
    } else {
      setFieldValue('due_date', formattedDate);
    }
    setShowDatePicker(false);
  };

  // Function to create a new task
  const handleCreateTask = async (values: TaskFormData) => {
    try {
      await createTask(values);
      Alert.alert(
        'Tarea Creada',
        'La tarea ha sido creada correctamente',
        [
          { 
            text: 'Aceptar', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error: any) {
      // If there is an error specific to date conflicts
      if (error.response?.data?.start_date?.includes('overlap')) {
        Alert.alert(
          'Conflicto de Fechas',
          'Ya tienes una tarea programada para estas fechas. Por favor elige otro período.',
          [{ text: 'Aceptar' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo crear la tarea');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Nueva Tarea</Text>
            <Text style={styles.subtitle}>Crea una nueva tarea para tu lista</Text>
          </View>

          <Formik
            initialValues={initialValues}
            validationSchema={CreateTaskSchema}
            onSubmit={handleCreateTask}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <View style={styles.form}>
                <Input
                  label="Título"
                  placeholder="Título de la tarea"
                  value={values.title}
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  error={errors.title}
                  touched={touched.title}
                />

                <Input
                  label="Descripción"
                  placeholder="Descripción de la tarea"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  error={errors.description}
                  touched={touched.description}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={styles.textArea}
                />

                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>Fecha de inicio:</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => openDatePicker('start')}
                  >
                    <Text style={styles.dateValue}>
                      {formatDateForDisplay(values.start_date)}
                    </Text>
                  </TouchableOpacity>
                  {touched.start_date && errors.start_date && (
                    <Text style={styles.errorText}>{errors.start_date}</Text>
                  )}
                </View>

                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>Fecha de vencimiento (opcional):</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => openDatePicker('due')}
                  >
                    <Text style={styles.dateValue}>
                      {values.due_date ? formatDateForDisplay(values.due_date) : 'No establecida'}
                    </Text>
                  </TouchableOpacity>
                  {touched.due_date && errors.due_date && (
                    <Text style={styles.errorText}>{errors.due_date}</Text>
                  )}
                </View>

                {/* Date picker modal */}
                <DatePickerModal
                  isVisible={showDatePicker}
                  onClose={() => setShowDatePicker(false)}
                  onDateSelect={(date) => handleDateSelect(date, setFieldValue)}
                  currentDate={activeDateType === 'start' 
                    ? (values.start_date ? new Date(values.start_date) : new Date()) 
                    : (values.due_date ? new Date(values.due_date) : new Date(values.start_date || new Date()))}
                  title={activeDateType === 'start' ? 'Seleccionar fecha de inicio' : 'Seleccionar fecha de vencimiento'}
                  minimumDate={activeDateType === 'due' && values.start_date ? new Date(values.start_date) : new Date()}
                />

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <Button
                    title="Cancelar"
                    onPress={() => navigation.goBack()}
                    variant="secondary"
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title="Crear Tarea"
                    onPress={handleSubmit}
                    isLoading={isLoading}
                    style={{ flex: 1 }}
                  />
                </View>
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
    marginVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  textArea: {
    height: 100,
    paddingTop: 8,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  dateButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    marginVertical: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
});

export default CreateTaskScreen; 