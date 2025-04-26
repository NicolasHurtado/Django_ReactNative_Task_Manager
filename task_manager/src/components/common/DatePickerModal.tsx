import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  currentDate: Date;
  title: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isVisible,
  onClose,
  onDateSelect,
  currentDate,
  title,
  minimumDate,
  maximumDate
}) => {
  const [selectedDate, setSelectedDate] = React.useState(currentDate);
  const [showAndroidPicker, setShowAndroidPicker] = React.useState(false);

  // Reset selected date when modal is opened with a new currentDate
  React.useEffect(() => {
    setSelectedDate(currentDate);
    
    // For Android, show the picker only when the modal is visible
    if (Platform.OS === 'android' && isVisible) {
      setShowAndroidPicker(true);
    }
  }, [currentDate, isVisible]);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    // For Android, when the user selects a date or cancels the native picker
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
      
      if (event.type === 'set' && date) {
        setSelectedDate(date);
        // For Android, we automatically confirm when a date is selected
        onDateSelect(date);
      } else {
        // For Android, we close the modal when the user cancels
        onClose();
      }
    } else if (date) {
      // For iOS, we only update the selected date
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    onDateSelect(selectedDate);
  };

  if (!isVisible) return null;

  // For Android, we show only the native DateTimePicker when needed
  if (Platform.OS === 'android') {
    return (
      <>
        {showAndroidPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )}
      </>
    );
  }

  // For iOS, we show the custom modal
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.iosPickerWrapper}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor="#000000"
                themeVariant="light"
                style={styles.iosDatePicker}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 22,
    color: '#757575',
  },
  pickerContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosPickerWrapper: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  iosDatePicker: {
    width: 300,
    height: 200,
  },
  datePicker: {
    width: Platform.OS === 'ios' ? '100%' : 320,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DatePickerModal; 