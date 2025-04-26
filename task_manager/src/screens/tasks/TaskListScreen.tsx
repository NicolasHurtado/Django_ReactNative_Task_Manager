import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';

import TaskCard from '../../components/tasks/TaskCard';
import DatePickerModal from '../../components/common/DatePickerModal';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import EditTaskModal from '../../components/tasks/EditTaskModal';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { MainStackParamList } from '../../navigation';
import { Task } from '../../api/tasksApi';

type TaskListScreenProps = NativeStackScreenProps<MainStackParamList, 'TaskList'>;

const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation }) => {
  const { 
    fetchTasks, 
    filteredTasks, 
    tasks, 
    isLoading, 
    error, 
    markAsCompleted, 
    searchByDateRange 
  } = useTaskStore();
  const { user, logout } = useAuthStore();
  
  // Local states
  const [activeTab, setActiveTab] = useState<'all' | 'completed'>('all');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  // Estados para el modal de edición
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filtered tasks based on active tab
  const displayedTasks = activeTab === 'all' 
    ? filteredTasks 
    : filteredTasks.filter(task => task.completed);

  // Load tasks when the screen is opened
  useEffect(() => {
    if (startDate || dueDate) {
      filterTasksByDate();
    } else {
      fetchTasks();
    }
  }, [startDate, dueDate]);

  // Format date for display
  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return '';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get current date for header
  const getCurrentDate = (): string => {
    const now = new Date();
    
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    const day = now.toLocaleDateString('en-US', { day: '2-digit' });
    const month = now.toLocaleDateString('en-US', { month: 'short' });
    
    return `${weekday}, ${day} ${month}`;
  };

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'completed') => {
    setActiveTab(tab);
  };

  // Handle date selection for start date
  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    setShowStartDatePicker(false);
  };

  // Handle date selection for due date
  const handleDueDateSelect = (date: Date) => {
    setDueDate(date);
    setShowDueDatePicker(false);
  };

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (startDate) {
      // Si hay fechas seleccionadas, aplicar búsqueda con filtro de fechas
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedDueDate = dueDate ? dueDate.toISOString().split('T')[0] : undefined;
      searchByDateRange(formattedStartDate, formattedDueDate, text);
    } else {
      // Si no hay fechas, solo filtrar por texto
      useTaskStore.getState().filterByName(text);
    }
  };

  // Handle toggle complete
  const handleToggleComplete = async (task: Task) => {
    try {
      await markAsCompleted(task.id);
    } catch (error) {
      Alert.alert('Error', 'Error updating task');
    }
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            // Cerrar sesión directamente sin mostrar alerta adicional
            setTimeout(() => {
              logout();
            }, 100);
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  // Función para filtrar tareas por fechas
  const filterTasksByDate = async () => {
    try {
      if (!startDate) return;
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedDueDate = dueDate ? dueDate.toISOString().split('T')[0] : undefined;
      
      await searchByDateRange(formattedStartDate, formattedDueDate, searchQuery);
    } catch (error) {
      console.error('Error filtering tasks by date:', error);
      Alert.alert('Error', 'Could not filter tasks by date');
    }
  };

  // Render task item
  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => {
        setSelectedTask(item);
        setShowEditTaskModal(true);
      }}
      onToggleComplete={() => handleToggleComplete(item)}
    />
  );

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {/* Placeholders para las tareas */}
      <View style={styles.placeholdersContainer}>
        <TaskCard
          task={{ id: 0, title: '', description: '', completed: false, start_date: '', user: 0 }}
          onPress={() => {}}
          onToggleComplete={() => {}}
          isPlaceholder={true}
        />
        <TaskCard
          task={{ id: 0, title: '', description: '', completed: false, start_date: '', user: 0 }}
          onPress={() => {}}
          onToggleComplete={() => {}}
          isPlaceholder={true}
        />
        <TaskCard
          task={{ id: 0, title: '', description: '', completed: false, start_date: '', user: 0 }}
          onPress={() => {}}
          onToggleComplete={() => {}}
          isPlaceholder={true}
        />
      </View>
      
      <Text style={styles.emptyTitle}>
        <Text style={styles.emptyTitleItalic}>Just Press</Text> "Create a Task"
      </Text>
      
      
      <Text style={styles.emptySubtitle}>
        and start collaborating.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{user?.first_name ? `${user.first_name}'s Tasks` : 'My Tasks'}</Text>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <View style={styles.iconContainer}>
              {Platform.OS === 'android' ? (
                <Feather name="arrow-right" size={16} color="#333333" />
              ) : (
                <Text style={styles.logoutIconText}>→</Text>
              )}
            </View>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Title or Name"
            value={searchQuery}
            onChangeText={handleSearch}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Date filters */}
        <View style={styles.dateFiltersContainer}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <View style={styles.dateInputContainer}>
              {!startDate ? (
                <Text style={styles.dateButtonPlaceholder}>Start date</Text>
              ) : (
                <Text style={styles.dateButtonText}>
                  {formatDateForDisplay(startDate)}
                </Text>
              )}
            </View>
            <View style={styles.calendarIconContainer}>
              <Feather name="calendar" size={16} color="#777777" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.dateButtonSeparator} />
          
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDueDatePicker(true)}
          >
            <View style={styles.dateInputContainer}>
              {!dueDate ? (
                <Text style={styles.dateButtonPlaceholder}>End date</Text>
              ) : (
                <Text style={styles.dateButtonText}>
                  {formatDateForDisplay(dueDate)}
                </Text>
              )}
            </View>
            <View style={styles.calendarIconContainer}>
              <Feather name="calendar" size={16} color="#777777" />
            </View>
          </TouchableOpacity>
          
          {(startDate || dueDate) && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={() => {
                setStartDate(null);
                setDueDate(null);
                fetchTasks();
              }}
            >
              <Feather name="x" size={16} color="#777777" />
            </TouchableOpacity>
          )}
        </View>

        {/* Task tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => handleTabChange('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All tasks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => handleTabChange('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              Completed tasks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task list */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        ) : (
          <FlatList
            data={displayedTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Create task button */}
        <TouchableOpacity
          style={styles.createTaskButton}
          onPress={() => setShowCreateTaskModal(true)}
        >
          <Text style={styles.createTaskButtonText}>Create a Task</Text>
        </TouchableOpacity>

        {/* Date picker modals */}
        <DatePickerModal
          isVisible={showStartDatePicker}
          onClose={() => setShowStartDatePicker(false)}
          onDateSelect={handleStartDateSelect}
          currentDate={startDate || new Date()}
          title="Select start date"
        />

        <DatePickerModal
          isVisible={showDueDatePicker}
          onClose={() => setShowDueDatePicker(false)}
          onDateSelect={handleDueDateSelect}
          currentDate={dueDate || new Date()}
          title="Select due date"
          minimumDate={startDate || undefined}
        />
        
        {/* Create task modal */}
        <CreateTaskModal 
          visible={showCreateTaskModal}
          onClose={() => {
            setShowCreateTaskModal(false);
            fetchTasks(); // Refrescar la lista después de crear una tarea
          }}
        />
        
        {/* Edit task modal */}
        <EditTaskModal
          visible={showEditTaskModal}
          onClose={() => {
            setShowEditTaskModal(false);
            setSelectedTask(null);
            fetchTasks(); // Refrescar la lista después de editar
          }}
          task={selectedTask}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: -30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#ACACAC',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    paddingRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1C1E20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoutIconText: {
    fontSize: 16,
    color: '#333333',
  },
  logoutText: {
    color: '#333333',
    fontWeight: '500',
    fontSize: 14,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0.5,
    borderColor: '#C7CACD',
  },
  dateFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: '#C7CACD',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 0,
  },
  dateButtonSeparator: {
    width: 1,
    backgroundColor: '#C7CACD',
    height: '100%',
  },
  dateInputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dateButtonPlaceholder: {
    fontSize: 16,
    color: '#9e9e9e',
    fontWeight: '400',
  },
  calendarIconContainer: {
    marginLeft: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
    borderBottomWidth: 0,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#9e9e9e',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  placeholdersContainer: {
    width: '100%',
    marginBottom: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#9e9e9e',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyTitleItalic: {
    fontStyle: 'italic',
  },
  emptySubtitle: {
    fontSize: 18,
    color: '#c0c0c0',
    textAlign: 'center',
  },
  createTaskButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    backgroundColor: '#007BFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearFiltersButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 4,
    alignSelf: 'center',
  },
});

export default TaskListScreen; 