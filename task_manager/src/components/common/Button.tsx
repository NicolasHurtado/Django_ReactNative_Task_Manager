import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  variant = 'primary',
  fullWidth = false,
  style,
  textStyle,
  disabled,
  ...rest
}) => {
  // Determinar el estilo basado en la variante
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#757575',
          textColor: '#fff'
        };
      case 'danger':
        return {
          backgroundColor: '#f44336',
          textColor: '#fff'
        };
      case 'primary':
      default:
        return {
          backgroundColor: '#2196F3',
          textColor: '#fff'
        };
    }
  };

  const { backgroundColor, textColor } = getVariantStyle();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button; 