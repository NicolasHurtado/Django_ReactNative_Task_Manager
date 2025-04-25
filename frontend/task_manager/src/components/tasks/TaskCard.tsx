import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../../api/tasksApi';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onToggleComplete }) => {
  // Format date for display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    // Convert from YYYY-MM-DD format to Date object
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Check if task is overdue
  const isOverdue = (): boolean => {
    if (!task.due_date || task.completed) return false;
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };

  // Generate user initials from username
  const getUserInitials = (): string => {
    // This is a placeholder - in a real app you'd use the assigned user's name
    // For now, we'll use "CC" for Carlos Castillo from the design
    return "CC";
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.completed && styles.completedContainer
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text 
            style={[
              styles.title,
              task.completed && styles.completedText
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.description,
            task.completed && styles.completedText
          ]}
          numberOfLines={2}
        >
          {task.description || 'No description'}
        </Text>
        
        {/* Date range */}
        <View style={styles.dateRow}>
          {task.start_date && (
            <Text style={styles.dateText}>
              {formatDate(task.start_date)} 
              {task.due_date && ` - ${formatDate(task.due_date)}`}
            </Text>
          )}
        </View>
      </View>
      
      {/* Right side: Checkbox and user initials */}
      <View style={styles.rightSide}>
        <TouchableOpacity 
          style={[
            styles.checkbox,
            task.completed && styles.checkboxChecked
          ]}
          onPress={onToggleComplete}
        >
          {task.completed && (
            <View style={styles.checkmark} />
          )}
        </TouchableOpacity>
        
        <View style={styles.userInitials}>
          <Text style={styles.initialsText}>{getUserInitials()}</Text>
        </View>
      </View>
      
      {/* Overdue indicator dot */}
      {isOverdue() && (
        <View style={styles.overdueDot} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  completedContainer: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
  },
  rightSide: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  userInitials: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2196F3',
  },
  overdueDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
});

export default TaskCard; 