import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Feather } from '@expo/vector-icons';

import DatePickerModal from '../common/DatePickerModal';
import { useTaskStore } from '../../store/taskStore';
import { TaskFormData } from '../../api/tasksApi';
import { fetchUsers, User } from '../../api/authApi';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

// Interface for the error of overlapping tasks
interface TaskError {
  response?: {
    data?: {
      start_date?: string[];
      overlapping_task?: string;
    }
  }
}

// Schema for the validation of the form
const CreateTaskSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: Yup.string()
    .max(500, 'Description cannot exceed 500 characters'),
  start_date: Yup.date()
    .required('Start date is required'),
  due_date: Yup.date()
    .nullable()
    .test(
      'due-date-after-start-date',
      'Due date must be after start date',
      function(value) {
        const { start_date } = this.parent;
        if (!value || !start_date) return true;
        return new Date(value) >= new Date(start_date);
      }
    ),
  user: Yup.number()
    .required('Assigning a user is required')
});

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ visible, onClose }) => {
  const { createTask, isLoading, error: storeError } = useTaskStore();
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserInitials, setSelectedUserInitials] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [taskError, setTaskError] = useState<TaskError | null>(null);
  
  const formikRef = useRef<FormikProps<TaskFormData>>(null);
  
  // Reset the state when the modal is closed
  useEffect(() => {
    if (!visible) {
      setSelectedUser(null);
      setSelectedUserId(null);
      setSelectedUserInitials(null);
      setSearchQuery('');
    }
  }, [visible]);
  
  // Load users from the API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    if (visible) {
      loadUsers();
    }
  }, [visible]);
  
  // Filter users by search
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || user.username.toLowerCase().includes(query);
  });
  
  // Initial values of the form
  const initialValues: TaskFormData = {
    title: '',
    description: '',
    start_date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
    due_date: null,
    user: undefined,
  };

  // Format date to display MM/DD/YYYY
  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return 'MM/DD/YYYY';
    return `${dateString}`;
  };

  // Function to create a new task
  const handleCreateTask = async (values: TaskFormData) => {
    try {
      // Reset error state
      setTaskError(null);
      
      // Add the assigned user ID if it exists
      if (selectedUserId) {
        values.user = selectedUserId;
      }
      await createTask(values);
      // Clean fields and close modal
      setSelectedUser(null);
      setSelectedUserId(null);
      setSelectedUserInitials(null);
      onClose();
    } catch (error: any) {
      // Verify if it is an error of overlapping tasks
      if (error.response?.data?.start_date?.some((msg: string) => msg.includes('overlaps'))) {
        // Save the error to show it in the UI
        setTaskError(error);
        // No show additional alert
      } else {
        // For other types of errors, show alert
        Alert.alert('Error', 'Could not create task');
      }
    }
  };

  useEffect(() => {
    if (selectedUserId !== null && formikRef.current) {
      formikRef.current.setFieldValue('user', selectedUserId);
      formikRef.current.setFieldTouched('user', true);
    }
  }, [selectedUserId]);

  // Rendering a user in the list
  const renderUserItem = (user: User) => {
    const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    const fullName = `${user.first_name} ${user.last_name}`;
    
    return (
      <TouchableOpacity 
        key={user.id}
        style={styles.userItem}
        onPress={() => {
          setSelectedUser(fullName);
          setSelectedUserId(user.id);
          setSelectedUserInitials(initials);
          setShowUserPicker(false);
        }}
      >
        <View style={styles.userInitials}>
          <Text style={styles.userInitialsText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{fullName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add new Task</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={22} color="#A0A0A0"/>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              validationSchema={CreateTaskSchema}
              onSubmit={handleCreateTask}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, setFieldTouched }) => (
                <View style={styles.form}>
                  {/* Title */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Title <Text style={styles.requiredField}>*</Text></Text>
                    <TextInput
                      style={[
                        styles.input,
                        touched.title && errors.title ? styles.inputError : {}
                      ]}
                      placeholder="Title for your task"
                      placeholderTextColor="#C7CACD"
                      value={values.title}
                      onChangeText={handleChange('title')}
                      onBlur={handleBlur('title')}
                    />
                    {touched.title && errors.title && (
                      <Text style={styles.errorText}>{errors.title}</Text>
                    )}
                  </View>
                  
                  {/* Description */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Description</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        touched.description && errors.description ? styles.inputError : {}
                      ]}
                      placeholder="Enter an description for you task"
                      placeholderTextColor="#C7CACD"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      value={values.description}
                      onChangeText={handleChange('description')}
                      onBlur={handleBlur('description')}
                    />
                    {touched.description && errors.description && (
                      <Text style={styles.errorText}>{errors.description}</Text>
                    )}
                  </View>
                  
                  {/* Start Date */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Start date <Text style={styles.requiredField}>*</Text></Text>
                    <TouchableOpacity 
                      style={[
                        styles.dateInput,
                        touched.start_date && errors.start_date ? styles.inputError : {}
                      ]}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Text style={styles.dateText}>{formatDateForDisplay(values.start_date)}</Text>
                      <Feather name="chevron-down" size={20} color="#888" />
                    </TouchableOpacity>
                    {touched.start_date && errors.start_date && (
                      <Text style={styles.errorText}>{errors.start_date}</Text>
                    )}
                  </View>
                  
                  {/* End Date */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>End date</Text>
                    <TouchableOpacity 
                      style={[
                        styles.dateInput,
                        touched.due_date && errors.due_date ? styles.inputError : {}
                      ]}
                      onPress={() => setShowDueDatePicker(true)}
                    >
                      <Text style={styles.dateText}>{values.due_date ? formatDateForDisplay(values.due_date) : 'MM/DD/YYYY'}</Text>
                      <Feather name="chevron-down" size={20} color="#888" />
                    </TouchableOpacity>
                    {touched.due_date && errors.due_date && (
                      <Text style={styles.errorText}>{errors.due_date}</Text>
                    )}
                  </View>
                  
                  {/* Assign to */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Assign to <Text style={styles.requiredField}>*</Text></Text>
                    <TouchableOpacity 
                      style={[
                        styles.dateInput,
                        !selectedUserId && touched.user ? styles.inputError : {}
                      ]}
                      onPress={() => setShowUserPicker(!showUserPicker)}
                    >
                      {selectedUser ? (
                        <View style={styles.selectedUserContainer}>
                          <View style={[styles.userInitials, {backgroundColor: '#E0E0E0'}]}>
                            <Text style={styles.userInitialsText}>{selectedUserInitials}</Text>
                          </View>
                          <Text style={styles.userName}>{selectedUser}</Text>
                        </View>
                      ) : (
                        <Text style={styles.dateText}>Select and user for your task</Text>
                      )}
                      <Feather name="chevron-down" size={20} color="#888" />
                    </TouchableOpacity>
                    
                    {!selectedUserId && touched.user && (
                      <Text style={styles.errorText}>You must assign this task to a user</Text>
                    )}
                    
                    {showUserPicker && (
                      <View style={styles.userPickerContainer}>
                        <TextInput
                          style={styles.userSearchInput}
                          placeholder="Search by name"
                          placeholderTextColor="#909090"
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                        />
                        <View style={styles.userList}>
                          {loadingUsers ? (
                            <Text style={styles.loadingText}>Loading users...</Text>
                          ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(renderUserItem)
                          ) : (
                            <Text style={styles.noResultsText}>No users found</Text>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                  
                  {/* Mensaje de error de superposición */}
                  {taskError && taskError.response?.data?.start_date?.some((msg: string) => msg.includes('overlaps')) && (
                    <View style={styles.overlapErrorContainer}>
                      <Text style={styles.overlapErrorTitle}>This task is overlapping with:</Text>
                      <Text style={styles.overlapErrorText}>
                        {taskError.response.data.overlapping_task || "Another task"}
                      </Text>
                    </View>
                  )}
                  
                  {/* Task completed checkbox */}
                  <View style={styles.checkboxContainer}>
                    <Text style={styles.fieldLabel}>Task Completed</Text>
                    <TouchableOpacity 
                      style={[
                        styles.checkbox,
                        values.completed && styles.checkboxChecked
                      ]}
                      onPress={() => setFieldValue('completed', !values.completed)}
                    >
                      {values.completed && (
                        <Text style={styles.checkmarkText}>✓</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  {/* Submit button */}
                  <TouchableOpacity 
                    style={[
                      styles.createButton,
                      (!values.title || !values.start_date || !selectedUserId) ? styles.createButtonDisabled : {}
                    ]}
                    onPress={() => {
                      if (!selectedUserId) {
                        setFieldTouched('user', true);
                      }
                      handleSubmit();
                    }}
                    disabled={isLoading || !values.title || !values.start_date || !selectedUserId}
                  >
                    <Text style={[
                      styles.createButtonText,
                      (!values.title || !values.start_date || !selectedUserId) ? styles.createButtonTextDisabled : {}
                    ]}>Create task</Text>
                  </TouchableOpacity>
                  
                  {/* Date picker modals */}
                  <DatePickerModal
                    isVisible={showStartDatePicker}
                    onClose={() => setShowStartDatePicker(false)}
                    onDateSelect={(date) => {
                      // Ajustamos la zona horaria para evitar el desplazamiento de un día
                      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                      const formattedDate = localDate.toISOString().split('T')[0];
                      setFieldValue('start_date', formattedDate);
                      setShowStartDatePicker(false);
                    }}
                    currentDate={values.start_date ? new Date(values.start_date) : new Date()}
                    title="Select start date"
                  />
                  
                  <DatePickerModal
                    isVisible={showDueDatePicker}
                    onClose={() => setShowDueDatePicker(false)}
                    onDateSelect={(date) => {
                      // Ajustamos la zona horaria para evitar el desplazamiento de un día
                      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                      const formattedDate = localDate.toISOString().split('T')[0];
                      setFieldValue('due_date', formattedDate);
                      setShowDueDatePicker(false);
                    }}
                    currentDate={values.due_date ? new Date(values.due_date) : new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000))}
                    title="Select due date"
                    minimumDate={values.start_date ? new Date(values.start_date) : undefined}
                  />
                </View>
              )}
            </Formik>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: "#A0A0A0",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '700',
    color: '#4A4F52',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#4A4F52',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#070707',
  },
  userPickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  userSearchInput: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    fontSize: 16,
  },
  userList: {
    maxHeight: 200,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInitials: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userInitialsText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#e3f2fd',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonTextDisabled: {
    color: '#2196F3',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    padding: 15,
  },
  noResultsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    padding: 15,
  },
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requiredField: {
    color: '#F44336',
  },
  overlapErrorContainer: {
    backgroundColor: '#FFF9C4',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0,
  },
  overlapErrorTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  overlapErrorText: {
    fontSize: 16,
    color: '#000000',
  },
});

export default CreateTaskModal; 