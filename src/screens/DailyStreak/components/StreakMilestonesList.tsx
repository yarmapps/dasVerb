import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { ThemeColors } from '../../../styles/themeColors';
import { createStyles } from './StreakMilestonesList.styles';

export interface StreakMilestonesListProps {
  currentStreak: number;
  bestStreak: number;
  colors: ThemeColors;
}

interface MilestoneDef {
  days: number;
  idKey: string;
  iconName: string;
  iconColor: string;
}

const MILESTONES: MilestoneDef[] = [
  { days: 3, idKey: 'Spark', iconName: 'bolt', iconColor: '#F59E0B' },
  { days: 7, idKey: 'Flame', iconName: 'fire', iconColor: '#EF4444' },
  { days: 14, idKey: 'Torch', iconName: 'burn', iconColor: '#F97316' },
  { days: 30, idKey: 'Inferno', iconName: 'meteor', iconColor: '#EC4899' },
  { days: 50, idKey: 'Blaze', iconName: 'sun', iconColor: '#EAB308' },
  { days: 100, idKey: 'Legend', iconName: 'award', iconColor: '#8B5CF6' },
  { days: 365, idKey: 'Master', iconName: 'crown', iconColor: '#FFD700' },
];

export function StreakMilestonesList({
  currentStreak,
  bestStreak,
  colors,
}: StreakMilestonesListProps): React.JSX.Element {
  const intl = useIntl();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const maxTrackedStreak = Math.max(currentStreak, bestStreak);

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        {intl.formatMessage({ id: 'dailyStreak.milestonesTitle' })}
      </Text>

      <View style={styles.milestonesColumn}>
        {MILESTONES.map(milestone => {
          const isUnlocked = maxTrackedStreak >= milestone.days;
          const progressRatio = Math.min(1, Math.max(0, currentStreak / milestone.days));

          return (
            <View
              key={milestone.days}
              style={[styles.milestoneCard, isUnlocked && styles.unlockedCard]}
            >
              <View style={styles.iconWrapper}>
                <FontAwesome5
                  name={milestone.iconName}
                  size={16}
                  color={isUnlocked ? milestone.iconColor : colors.textMuted}
                />
              </View>

              <View style={styles.infoColumn}>
                <Text style={styles.milestoneTitle}>
                  {intl.formatMessage({ id: `dailyStreak.milestone${milestone.idKey}` })}
                </Text>
                <Text style={styles.milestoneDesc}>
                  {intl.formatMessage({ id: `dailyStreak.milestone${milestone.idKey}Desc` })}
                </Text>
                {!isUnlocked && (
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.round(progressRatio * 100)}%` },
                      ]}
                    />
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
