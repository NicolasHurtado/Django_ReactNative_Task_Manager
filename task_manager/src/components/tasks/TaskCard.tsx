import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../../api/tasksApi';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
  isPlaceholder?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onToggleComplete, isPlaceholder = false }) => {
  // Format date for display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    // Convert from YYYY-MM-DD format to Date object
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return `${date.toLocaleDateString('en-US', {
      month: 'long', 
      day: '2-digit'
    })}, ${year}`;
  };

  // Check if task is overdue
  const isOverdue = (): boolean => {
    if (!task.due_date) {
      // Si no tiene due_date, verificar solo el start_date
      if (!task.start_date || task.completed) return false;
      const startDate = new Date(task.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate < today;
    } else {
      // Si tiene due_date
      if (task.completed) return false;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today;
    }
  };

  // Generate user initials from username or assigned user info
  const getUserInitials = (): string => {
    //console.log(task);
    if (task.assigned_user) {
      return `${task.assigned_user.first_name.charAt(0)}${task.assigned_user.last_name.charAt(0)}`;
    } else if (task.user) {
      // Si solo tenemos el ID pero no los datos completos, usamos CC como fallback
      return "CC";
    }
    return "CC"; // Fallback
  };

  // Render placeholder
  if (isPlaceholder || !task.title) {
    return (
      <View style={styles.placeholderContainer}>
        <View style={styles.placeholderCircleOuter}>
          <View style={styles.placeholderCircleInner} />
        </View>
        <View style={styles.placeholderBarOuter}>
          <View style={styles.placeholderBarInner} />
        </View>
      </View>
    );
  }

  // Render actual task
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isOverdue() && styles.overdueContainer,
        task.completed && styles.completedContainer
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.headerRow}>
          <Text 
            style={[
              styles.title,
              task.completed && styles.completedText
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <TouchableOpacity 
            style={[
              styles.checkbox,
              task.completed && styles.checkboxChecked
            ]}
            onPress={onToggleComplete}
          >
            {task.completed && (
              <Text style={styles.checkmarkText}>✓</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {task.description ? (
          <Text 
            style={[
              styles.description
            ]}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        ) : null}
        
        <View style={styles.footerRow}>
          {/* Date section */}
          <View style={styles.dateContainer}>
            {task.due_date ? (
              <View style={[styles.dateWrapper, isOverdue() && styles.overdueDateWrapper]}>
                <Text>
                  <Text style={styles.dateText}>
                    {formatDate(task.start_date)}
                  </Text>
                  <Text style={styles.dateSeparator}> — </Text>
                  <Text style={[
                    styles.dateText,
                    isOverdue() && styles.overdueText
                  ]}>
                    {formatDate(task.due_date)}
                  </Text>
                </Text>
                {isOverdue() && (
                  <View style={styles.overdueIndicator}>
                    <Text style={styles.overdueIndicatorText}>!</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={[styles.dateWrapper, isOverdue() && styles.overdueDateWrapper]}>
                <Text style={[
                  styles.dateText,
                  isOverdue() && styles.overdueText
                ]}>
                  {formatDate(task.start_date)}
                </Text>
                {isOverdue() && (
                  <View style={styles.overdueIndicator}>
                    <Text style={styles.overdueIndicatorText}>!</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          
          {/* User initials circle */}
          <View style={styles.userInitialsContainer}>
            <Text style={styles.userInitialsText}>{getUserInitials()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1.3,
    borderColor: '#C7CACD70',
  },
  contentWrapper: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', 
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0,
    borderTopColor: '#f5f5f5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
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
    lineHeight: 18,
    marginTop: -1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    paddingRight: 8,
  },
  description: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '##1C1E20',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  overdueDateWrapper: {
    backgroundColor: '#FFEBEE', // Fondo rojo sutil para fechas vencidas
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
  },
  dateSeparator: {
    color: '#666666',
  },
  overdueText: {
    color: '#FF5252',
  },
  overdueIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF5252',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  overdueIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userInitialsContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitialsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  // Placeholder styles
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    marginBottom: 20,
    width: '35%',
    alignSelf: 'center',
  },
  placeholderCircleOuter: {
    width: 24,
    height: 24, 
    borderRadius: 12,
    backgroundColor: '#EDEDED',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderCircleInner: {
    width: 15,
    height: 15,
    borderRadius: 9,
    backgroundColor: '#F5F5F5',
  },
  placeholderBarOuter: {
    flex: 1,
    height: 20,
    backgroundColor: '#EDEDED',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderBarInner: {
    width: '95%',
    height: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  overdueContainer: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF5252',
  },
  completedContainer: {
    opacity: 1,
  },
});

export default TaskCard; 