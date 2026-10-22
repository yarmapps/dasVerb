import React, { useMemo } from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';
import { HeaderIconButton } from '../HeaderIconButton/HeaderIconButton';
import { Spacing } from '../../styles/spacing';
import { StreakBadge } from '../StreakBadge/StreakBadge';
import { LeaderboardBadge } from '../LeaderboardBadge/LeaderboardBadge';
import { isLeaderboardEnabled } from '../../services/leaderboardService';
import { createStyles } from './ScreenHeader.styles';

export interface ScreenHeaderProps {
  title?: string | React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  showStreak?: boolean;
  animateStreak?: boolean;
  showLeaderboard?: boolean;
  leaderboardTooltipPoints?: number;
}

export function ScreenHeader({
  title,
  leftContent,
  rightContent,
  showBackButton = false,
  onBackPress,
  style,
  titleStyle,
  showStreak = true,
  animateStreak = false,
  showLeaderboard = false,
  leaderboardTooltipPoints,
}: ScreenHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, Spacing.sm) }, style]}>
      <View style={styles.headerContent}>
        {(showBackButton || leftContent) && (
          <View style={styles.leftContainer}>
            {showBackButton && (
              <HeaderIconButton
                icon="arrow-left"
                iconSize={18}
                iconColor={colors.textPrimary}
                onPress={onBackPress}
                testID="header-back-button"
              />
            )}
            {!showBackButton && leftContent}
          </View>
        )}

        {Boolean(title) && (
          <View style={styles.centerContainer}>
            {typeof title === 'string' ? (
              <Text
                style={[styles.title, titleStyle]}
                numberOfLines={1}
                ellipsizeMode="tail"
                testID="header-title"
              >
                {title}
              </Text>
            ) : (
              title
            )}
          </View>
        )}

        {(showStreak || rightContent || (showLeaderboard && isLeaderboardEnabled())) && (
          <View style={styles.rightContainer}>
            {showLeaderboard && isLeaderboardEnabled() && (
              <LeaderboardBadge tooltipPoints={leaderboardTooltipPoints} />
            )}
            {rightContent}
            {showStreak && <StreakBadge animate={animateStreak} />}
          </View>
        )}
      </View>
    </View>
  );
}
