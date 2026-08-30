import React, { useState, forwardRef, useMemo } from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './FormInput.styles';

export interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  error?: boolean;
}

export const FormInput = forwardRef<TextInput, FormInputProps>(function FormInput(
  { label, leftIcon, rightIcon, containerStyle, error, ...textInputProps },
  ref,
) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          isFocused && styles.inputRowFocused,
          error && styles.inputRowError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          onFocus={e => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    </View>
  );
});
