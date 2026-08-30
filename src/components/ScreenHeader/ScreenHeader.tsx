import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { Spacing } from '../../styles/spacing';
import { createStyles } from './ScreenHeader.styles';

export interface ScreenHeaderProps {
  title?: string | React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  leftContent,
  rightContent,
  showBackButton = false,
  onBackPress,
  style,
  titleStyle,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, Spacing.sm) }, style]}>
      <View style={styles.headerContent}>
        {(showBackButton || leftContent) && (
          <View style={styles.leftContainer}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBackPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                testID="header-back-button"
              >
                <FontAwesome5 name="arrow-left" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
            {!showBackButton && leftContent}
          </View>
        )}

        <View style={styles.centerContainer}>
          {typeof title === 'string' ? (
            <Text style={[styles.title, titleStyle]} testID="header-title">
              {title}
            </Text>
          ) : (
            title
          )}
        </View>

        {rightContent && <View style={styles.rightContainer}>{rightContent}</View>}
      </View>
    </View>
  );
};
