import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps, ViewStyle, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';

interface NeoInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const NeoInput: React.FC<NeoInputProps> = ({ 
  label, 
  error, 
  containerStyle,
  secureTextEntry,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error && styles.inputWrapperError
      ]}>
        <TextInput
          style={[styles.input, secureTextEntry && { paddingRight: 50 }]}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus && props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur && props.onBlur(e);
          }}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeButton} 
            onPress={() => setIsSecure(!isSecure)}
          >
            <Text style={styles.eyeText}>{isSecure ? 'VER' : 'OCULTAR'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    fontSize: theme.typography.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    borderWidth: theme.borders.width,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.radius,
    backgroundColor: theme.colors.background,
    shadowColor: theme.colors.border,
    shadowOffset: theme.shadows.neoBrutalism.shadowOffset,
    shadowOpacity: theme.shadows.neoBrutalism.shadowOpacity,
    shadowRadius: theme.shadows.neoBrutalism.shadowRadius,
    elevation: 4, // Lighter elevation for input
  },
  inputWrapperFocused: {
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 0 },
  },
  inputWrapperError: {
    borderColor: theme.colors.primary, // using primary (orange) as error color for now
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  eyeText: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.background,
  },
  errorText: {
    marginTop: 4,
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: 'bold',
  }
});
