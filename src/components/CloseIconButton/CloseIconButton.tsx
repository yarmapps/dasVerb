import React, { useMemo } from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './CloseIconButton.styles';

export interface CloseIconButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  backgroundColor?: string;
  size?: number;
}

export function CloseIconButton({
  onPress,
  style,
  iconColor,
  backgroundColor,
  size = 16,
}: CloseIconButtonProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(), []);

  const effectiveIconColor = iconColor || colors.textDisabled;
  const effectiveBackgroundColor = backgroundColor || colors.headerButtonBackground;

  return (
    <TouchableOpacity
      style={[styles.closeButton, { backgroundColor: effectiveBackgroundColor }, style]}
      activeOpacity={0.7}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID="close-icon-button"
    >
      <FontAwesome5 name="times" size={size} color={effectiveIconColor} />
    </TouchableOpacity>
  );
}
