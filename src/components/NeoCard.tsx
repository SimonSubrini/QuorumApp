import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

interface NeoCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const NeoCard: React.FC<NeoCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
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
    shadowColor: theme.colors.border,
    shadowOffset: theme.shadows.neoBrutalism.shadowOffset,
    shadowOpacity: theme.shadows.neoBrutalism.shadowOpacity,
    shadowRadius: theme.shadows.neoBrutalism.shadowRadius,
    elevation: theme.shadows.neoBrutalism.elevation,
  }
});
