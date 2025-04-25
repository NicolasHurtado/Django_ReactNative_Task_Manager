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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import TaskCard from '../../components/tasks/TaskCard';
import Button from '../../components/common/Button';
import DatePickerModal from '../../components/common/DatePickerModal';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { MainStackParamList } from '../../navigation';
import { Task } from '../../api/tasksApi';

type TaskListScreenProps = NativeStackScreenProps<MainStackParamList, 'TaskList'>;

const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation }) => {
  const { fetchTasks, filteredTasks, tasks, isLoading, error, markAsCompleted } = useTaskStore();
  const { user, logout } = useAuthStore();
  
  // Local states
  const [activeTab, setActiveTab] = useState<'all' | 'completed'>('all');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered tasks based on active tab
  const displayedTasks = activeTab === 'all' 
    ? filteredTasks 
    : filteredTasks.filter(task => task.completed);

  // Load tasks when the screen is opened
  useEffect(() => {
    fetchTasks();
  }, []);

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
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      day: '2-digit',
      month: 'short'
    });
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
    // Implement search logic
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
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  // Render task item
  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      onToggleComplete={() => handleToggleComplete(item)}
    />
  );

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {activeTab === 'all' 
          ? 'No tasks found. Create a new task!' 
          : 'No completed tasks.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{user?.username ? `${user.username}'s Tasks` : 'My Tasks'}</Text>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
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
            <Text style={styles.dateButtonLabel}>start date</Text>
            <Text style={styles.dateButtonText}>
              {startDate ? formatDateForDisplay(startDate) : ''}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDueDatePicker(true)}
          >
            <Text style={styles.dateButtonLabel}>due date</Text>
            <Text style={styles.dateButtonText}>
              {dueDate ? formatDateForDisplay(dueDate) : ''}
            </Text>
          </TouchableOpacity>
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
          onPress={() => navigation.navigate('CreateTask')}
        >
          <Text style={styles.createTaskButtonText}>Create a Task</Text>
        </TouchableOpacity>

        {/* Date picker modals */}
        <DatePickerModal
          isVisible={showStartDatePicker}
          onClose={() => setShowStartDatePicker(false)}
          onDateSelect={handleStartDateSelect}
          currentDate={startDate}
          title="Select start date"
        />

        <DatePickerModal
          isVisible={showDueDatePicker}
          onClose={() => setShowDueDatePicker(false)}
          onDateSelect={handleDueDateSelect}
          currentDate={dueDate}
          title="Select due date"
          minimumDate={startDate || undefined}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  dateFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#757575',
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
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  createTaskButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createTaskButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskListScreen; 