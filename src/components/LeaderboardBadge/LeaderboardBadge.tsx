import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TrophyIcon } from '../TrophyIcon/TrophyIcon';
import { HeaderIconButton } from '../HeaderIconButton/HeaderIconButton';
import { useLeaderboardRank } from '../../hooks/useLeaderboardRank';
import { useAppTheme } from '../../context/ThemeContext';
import { trackEvent } from '../../services/analyticsService';
import { RootStackParamList } from '../../types/navigation';
import { LeaderboardPointsTooltip } from '../LeaderboardPointsTooltip/LeaderboardPointsTooltip';
import { createStyles } from './LeaderboardBadge.styles';

export interface LeaderboardBadgeProps {
  style?: ViewStyle;
  onPress?: () => void;
  tooltipPoints?: number;
}

export function LeaderboardBadge({
  style,
  onPress,
  tooltipPoints,
}: LeaderboardBadgeProps): React.JSX.Element {
  const { rank, isRanked } = useLeaderboardRank();
  const { colors, isDark } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const styles = useMemo(() => createStyles(), []);

  const handlePress = () => {
    trackEvent('leaderboard_icon_clicked');
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('Leaderboard');
    }
  };

  return (
    <View style={styles.wrapper}>
      <HeaderIconButton
        icon={
          <TrophyIcon
            size={20}
            isRanked={isRanked}
            isDark={isDark}
            inactiveColor={colors.textMuted}
          />
        }
        label={isRanked ? `#${rank}` : undefined}
        onPress={handlePress}
        style={style}
        testID="leaderboard-badge"
      />
      {tooltipPoints !== undefined && tooltipPoints > 0 && (
        <LeaderboardPointsTooltip points={tooltipPoints} />
      )}
    </View>
  );
}
