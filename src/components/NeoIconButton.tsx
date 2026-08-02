import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, PixelRatio } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface NeoIconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  style?: ViewStyle;
  disabled?: boolean;
  size?: number;
}

export const NeoIconButton: React.FC<NeoIconButtonProps> = ({ 
  icon, 
  onPress, 
  variant = 'primary', 
  style, 
  disabled = false,
  size = 24
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getBackgroundColor = () => {
    switch(variant) {
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'primary':
      default: return theme.colors.primary;
    }
  };

  const getIconColor = () => {
    if (variant === 'success') return theme.colors.text;
    return theme.colors.textLight;
  };

  const fontScale = PixelRatio.getFontScale();
  const padding = fontScale > 1.2 ? 6 : 10;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        {
          padding,
          backgroundColor: disabled ? '#A0A0A0' : getBackgroundColor(),
          transform: [{ translateX: isPressed && !disabled ? 2 : 0 }, { translateY: isPressed && !disabled ? 2 : 0 }],
          shadowOffset: {
            width: isPressed && !disabled ? 0 : 2,
            height: isPressed && !disabled ? 0 : 2,
          },
        },
        style,
      ]}
    >
      <Ionicons 
        name={icon} 
        size={size} 
        color={disabled ? '#E0E0E0' : getIconColor()} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: theme.borders.width,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.radius,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.border,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  }
});
