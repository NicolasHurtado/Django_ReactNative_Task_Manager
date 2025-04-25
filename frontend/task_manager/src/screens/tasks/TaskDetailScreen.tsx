import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Button from '../../components/common/Button';
import DatePickerModal from '../../components/common/DatePickerModal';
import { MainStackParamList } from '../../navigation';
import { useTaskStore } from '../../store/taskStore';
import { Task } from '../../api/tasksApi';

type TaskDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'TaskDetail'>;

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const { fetchTask, selectedTask, isLoading, error, markAsCompleted, deleteTask, updateTask } = useTaskStore();
  
  // States for edit modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  useEffect(() => {
    fetchTask(taskId);
  }, [taskId]);

  useEffect(() => {
    // When selectedTask changes, update editedTask
    if (selectedTask) {
      setEditedTask({ ...selectedTask });
    }
  }, [selectedTask]);

  // Format the date to display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'No establecido';
    
    // Convert the date to the local timezone correctly
    // Expected format: 'YYYY-MM-DD'
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create the date with the local timezone using the Date constructor
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Determine if the task is overdue
  const isOverdue = (): boolean => {
    if (!selectedTask?.due_date || selectedTask.completed) return false;
    
    const dueDate = new Date(selectedTask.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };

  // Handler to mark as completed
  const handleToggleComplete = async () => {
    if (!selectedTask) return;
    
    try {
      await markAsCompleted(selectedTask.id);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  // Handler to open edit modal
  const handleOpenEditModal = () => {
    if (!selectedTask) return;
    setEditedTask({ ...selectedTask });
    setIsEditModalVisible(true);
  };

  // Handler to close edit modal
  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
  };

  // Handler to save edited task
  const handleSaveTask = async () => {
    if (!editedTask) return;
    
    try {
      await updateTask(editedTask);
      setIsEditModalVisible(false);
      // Refresh task data
      fetchTask(taskId);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  // Handler for date selection
  const handleStartDateSelect = (date: Date) => {
    if (!editedTask) return;
    const formattedDate = formatDateForApi(date);
    setEditedTask({
      ...editedTask,
      start_date: formattedDate
    });
    setShowStartDatePicker(false);
  };

  const handleDueDateSelect = (date: Date) => {
    if (!editedTask) return;
    const formattedDate = formatDateForApi(date);
    setEditedTask({
      ...editedTask,
      due_date: formattedDate
    });
    setShowDueDatePicker(false);
  };

  // Handler to delete task
  const handleDeleteTask = () => {
    if (!selectedTask) return;

    Alert.alert(
      'Eliminar Tarea',
      '¿Estás seguro que deseas eliminar esta tarea?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          onPress: async () => {
            try {
              await deleteTask(selectedTask.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la tarea');
            }
          },
          style: 'destructive' 
        }
      ]
    );
  };

  // Edit Task Modal
  const renderEditTaskModal = () => {
    if (!editedTask) return null;

    return (
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar tarea</Text>
              <TouchableOpacity onPress={handleCloseEditModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Título</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedTask.title}
                  onChangeText={(text) => setEditedTask({...editedTask, title: text})}
                  placeholder="Título de la tarea"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editedTask.description || ''}
                  onChangeText={(text) => setEditedTask({...editedTask, description: text})}
                  placeholder="Descripción de la tarea"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fecha de inicio</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDate(editedTask.start_date)}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fecha de vencimiento</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDueDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDate(editedTask.due_date)}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Asignado a</Text>
                <View style={styles.assigneeButton}>
                  <View style={styles.userInitials}>
                    <Text style={styles.initialsText}>CC</Text>
                  </View>
                  <Text style={styles.assigneeText}>Carlos Castillo</Text>
                </View>
              </View>
              
              <View style={styles.taskCompletedContainer}>
                <Text style={styles.inputLabel}>Tarea Completada</Text>
                <TouchableOpacity 
                  style={[
                    styles.checkbox,
                    editedTask.completed && styles.checkboxChecked
                  ]}
                  onPress={() => setEditedTask({
                    ...editedTask,
                    completed: !editedTask.completed
                  })}
                >
                  {editedTask.completed && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button 
                title="Cancelar" 
                onPress={handleCloseEditModal} 
                variant="secondary"
                style={styles.modalButton}
              />
              <Button 
                title="Guardar" 
                onPress={handleSaveTask} 
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4361ee" />
        <Text style={styles.loadingText}>Cargando detalles de la tarea...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !selectedTask) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la tarea.</Text>
        <Button 
          title="Regresar" 
          onPress={() => navigation.goBack()} 
          style={styles.goBackButton}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.taskTitle}>{selectedTask.title}</Text>
            
            <View style={styles.statusContainer}>
              {isOverdue() && (
                <View style={[styles.statusBadge, styles.overdueBadge]}>
                  <Text style={styles.statusText}>Vencida</Text>
                </View>
              )}
              
              <View 
                style={[
                  styles.statusBadge,
                  selectedTask.completed ? styles.completedBadge : styles.pendingBadge
                ]}
              >
                <Text style={styles.statusText}>
                  {selectedTask.completed ? 'Completada' : 'Pendiente'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                styles.completeButton,
                selectedTask.completed && styles.uncompleteButton
              ]}
              onPress={handleToggleComplete}
            >
              <Text style={styles.actionButtonText}>
                {selectedTask.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={handleOpenEditModal}
              >
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteTask}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>
            {selectedTask.description || 'Sin descripción.'}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fechas</Text>
          
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Fecha de inicio:</Text>
            <Text style={styles.dateValue}>{formatDate(selectedTask.start_date)}</Text>
          </View>
          
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Fecha de vencimiento:</Text>
            <Text 
              style={[
                styles.dateValue,
                isOverdue() && styles.overdueText
              ]}
            >
              {formatDate(selectedTask.due_date)}
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asignado a</Text>
          <View style={styles.assigneeContainer}>
            <View style={styles.userInitials}>
              <Text style={styles.initialsText}>CC</Text>
            </View>
            <Text style={styles.assigneeName}>Carlos Castillo</Text>
          </View>
        </View>
      </ScrollView>
      
      {renderEditTaskModal()}
      
      {/* Start Date Picker Modal */}
      <DatePickerModal
        isVisible={showStartDatePicker}
        currentDate={editedTask?.start_date ? new Date(editedTask.start_date) : new Date()}
        onDateSelect={handleStartDateSelect}
        onClose={() => setShowStartDatePicker(false)}
        title="Seleccionar fecha de inicio"
      />
      
      {/* Due Date Picker Modal */}
      <DatePickerModal
        isVisible={showDueDatePicker}
        currentDate={editedTask?.due_date ? new Date(editedTask.due_date) : new Date()}
        onDateSelect={handleDueDateSelect}
        onClose={() => setShowDueDatePicker(false)}
        title="Seleccionar fecha de vencimiento"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4361ee',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 16,
    color: '#e63946',
    marginBottom: 20,
    textAlign: 'center',
  },
  goBackButton: {
    width: 200,
  },
  header: {
    marginBottom: 24,
  },
  titleContainer: {
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  pendingBadge: {
    backgroundColor: '#FFD166',
  },
  completedBadge: {
    backgroundColor: '#06D6A0',
  },
  overdueBadge: {
    backgroundColor: '#EF476F',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: '#06D6A0',
  },
  uncompleteButton: {
    backgroundColor: '#FFD166',
  },
  editButton: {
    backgroundColor: '#4361EE',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF476F',
    flex: 1,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButtonText: {
    color: '#EF476F',
  },
  secondaryActions: {
    flexDirection: 'row',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  dateItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
    width: 160,
  },
  dateValue: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  overdueText: {
    color: '#EF476F',
    fontWeight: 'bold',
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  assigneeName: {
    fontSize: 16,
    color: '#212529',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    fontSize: 22,
    color: '#6C757D',
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  dateButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#212529',
  },
  assigneeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
  },
  assigneeText: {
    fontSize: 16,
    color: '#212529',
  },
  taskCompletedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#CED4DA',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4361EE',
    borderColor: '#4361EE',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  modalButton: {
    minWidth: 100,
    marginLeft: 8,
  },
});

export default TaskDetailScreen; 