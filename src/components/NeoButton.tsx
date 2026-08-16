import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, PixelRatio } from 'react-native';
import { theme } from '../styles/theme';

interface NeoButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  textStyle,
  disabled = false
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

  const getTextColor = () => {
    if (variant === 'success') return theme.colors.text;
    return theme.colors.textLight;
  };

  // Ajuste de accesibilidad para letras grandes
  const fontScale = PixelRatio.getFontScale();
  const dynamicVerticalPadding = fontScale > 1.2 ? 8 : 14;
  const dynamicHorizontalPadding = fontScale > 1.2 ? 16 : 24;

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
          paddingVertical: dynamicVerticalPadding,
          paddingHorizontal: dynamicHorizontalPadding,
          backgroundColor: disabled ? '#A0A0A0' : getBackgroundColor(),
          transform: [{ translateX: isPressed && !disabled ? 2 : 0 }, { translateY: isPressed && !disabled ? 2 : 0 }],
          shadowOffset: {
            width: isPressed && !disabled ? 0 : theme.shadows.neoBrutalism.shadowOffset.width,
            height: isPressed && !disabled ? 0 : theme.shadows.neoBrutalism.shadowOffset.height,
          },
        },
        style,
      ]}
    >
      <Text style={[
        styles.text, 
        { color: disabled ? '#E0E0E0' : getTextColor() },
        textStyle
      ]} numberOfLines={0}>
        {title}
      </Text>
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
    shadowColor: theme.shadows.neoBrutalism.shadowColor,
    shadowOpacity: theme.shadows.neoBrutalism.shadowOpacity,
    shadowRadius: theme.shadows.neoBrutalism.shadowRadius,
    elevation: theme.shadows.neoBrutalism.elevation,
  },
  text: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});
