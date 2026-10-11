import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  Insets,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { soundService } from '../../services/soundService';
import { createStyles } from './HeaderIconButton.styles';

export interface HeaderIconButtonProps {
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  icon?: string | React.ReactNode;
  iconSize?: number;
  iconColor?: string;
  label?: string | number;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  hitSlop?: Insets;
  testID?: string;
  activeOpacity?: number;
  playSound?: boolean;
  children?: React.ReactNode;
}

export function HeaderIconButton({
  onPress,
  onLongPress,
  delayLongPress,
  icon,
  iconSize = 18,
  iconColor,
  label,
  labelStyle,
  style,
  contentStyle,
  hitSlop = { top: 8, bottom: 8, left: 8, right: 8 },
  testID,
  activeOpacity = 0.7,
  playSound = true,
  children,
}: HeaderIconButtonProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const effectiveIconColor = iconColor || colors.textPrimary;
  const isPill = label !== undefined && label !== null && String(label).trim().length > 0;

  const handlePress = () => {
    if (playSound) {
      soundService.playTapSound();
    }
    onPress?.();
  };

  const handleLongPress = () => {
    if (playSound && onLongPress) {
      soundService.playTapSound();
    }
    onLongPress?.();
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <FontAwesome5 name={icon} size={iconSize} color={effectiveIconColor} />;
    }
    return icon;
  };

  return (
    <TouchableOpacity
      style={[isPill ? styles.pillButton : styles.circleButton, style]}
      onPress={onPress ? handlePress : undefined}
      onLongPress={onLongPress ? handleLongPress : undefined}
      delayLongPress={delayLongPress}
      activeOpacity={activeOpacity}
      hitSlop={hitSlop}
      testID={testID}
    >
      {isPill || children ? (
        <View style={[styles.innerRow, contentStyle]}>
          {renderIcon()}
          {children}
          {isPill && <Text style={[styles.label, labelStyle]}>{label}</Text>}
        </View>
      ) : (
        renderIcon()
      )}
    </TouchableOpacity>
  );
}
