import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { ThemeColors } from '../../../styles/themeColors';
import { FireIcon } from '../../../components/FireIcon/FireIcon';
import { createStyles } from './StreakTopMetricsRow.styles';

export interface StreakTopMetricsRowProps {
  currentStreak: number;
  bestStreak: number;
  totalActiveDays: number;
  isActiveToday: boolean;
  colors: ThemeColors;
}

export function StreakTopMetricsRow({
  currentStreak,
  bestStreak,
  totalActiveDays,
  isActiveToday: _isActiveToday,
  colors,
}: StreakTopMetricsRowProps): React.JSX.Element {
  const intl = useIntl();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Current Streak */}
      <View style={styles.metricCard}>
        <View style={styles.topContent}>
          <View style={styles.iconWrapper}>
            <FireIcon size={24} isActive={true} />
          </View>
          <Text style={styles.valueText}>{currentStreak}</Text>
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>
            {intl.formatMessage({ id: 'dailyStreak.currentStreak' })}
          </Text>
        </View>
      </View>

      {/* Best Streak */}
      <View style={styles.metricCard}>
        <View style={styles.topContent}>
          <View style={styles.iconWrapper}>
            <FontAwesome5 name="trophy" size={20} color="#FFD700" />
          </View>
          <Text style={styles.valueText}>{bestStreak}</Text>
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>
            {intl.formatMessage({ id: 'dailyStreak.bestStreak' })}
          </Text>
        </View>
      </View>

      {/* Total Active Days */}
      <View style={styles.metricCard}>
        <View style={styles.topContent}>
          <View style={styles.iconWrapper}>
            <FontAwesome5 name="calendar-check" size={20} color={colors.primary} />
          </View>
          <Text style={styles.valueText}>{totalActiveDays}</Text>
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>
            {intl.formatMessage({ id: 'dailyStreak.totalActiveDays' })}
          </Text>
        </View>
      </View>
    </View>
  );
}
