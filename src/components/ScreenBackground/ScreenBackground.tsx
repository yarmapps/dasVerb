import React from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';
import { styles } from './ScreenBackground.styles';

export interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenBackground({ children, style }: ScreenBackgroundProps): React.JSX.Element {
  const { colors } = useAppTheme();

  return (
    <LinearGradient
      colors={[colors.background, colors.background]}
      style={[styles.container, style]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}
