import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, PixelRatio } from 'react-native';
import { theme } from '../styles/theme';

interface NeoCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const NeoCard: React.FC<NeoCardProps> = ({ children, style }) => {
  const fontScale = PixelRatio.getFontScale();
  const isLargeFont = fontScale > 1.2;
  
  return (
    <View style={[styles.container, isLargeFont && styles.containerLargeFont, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderWidth: theme.borders.width,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.radius,
    padding: 20,
    marginVertical: 10,
    shadowColor: theme.shadows.neoBrutalism.shadowColor,
    shadowOffset: theme.shadows.neoBrutalism.shadowOffset,
    shadowOpacity: theme.shadows.neoBrutalism.shadowOpacity,
    shadowRadius: theme.shadows.neoBrutalism.shadowRadius,
    elevation: theme.shadows.neoBrutalism.elevation,
  },
  containerLargeFont: {
    padding: 12,
  }
});
