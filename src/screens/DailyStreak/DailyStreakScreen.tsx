import React, { useEffect, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';
import { useStreak } from '../../hooks/useStreak';
import { useAppTheme } from '../../context/ThemeContext';
import { trackEvent, trackScreenView } from '../../services/analyticsService';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { StreakTopMetricsRow } from './components/StreakTopMetricsRow';
import { StreakFreezeCard } from './components/StreakFreezeCard';
import { StreakMonthCalendar } from './components/StreakMonthCalendar';
import { StreakMilestonesList } from './components/StreakMilestonesList';
import { createStyles } from './DailyStreakScreen.styles';

export function DailyStreakScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    currentStreak,
    bestStreak,
    totalActiveDays,
    isActiveToday,
    isFrozenToday,
    activeDates,
    frozenDates,
  } = useStreak();

  useEffect(() => {
    trackScreenView('DailyStreak');
    trackEvent('daily_streak_screen_shown', {
      current_streak: currentStreak,
      best_streak: bestStreak,
      total_active_days: totalActiveDays,
      is_active_today: isActiveToday,
      is_frozen_today: isFrozenToday,
    });
  }, [currentStreak, bestStreak, totalActiveDays, isActiveToday, isFrozenToday]);

  return (
    <ScreenBackground style={styles.container}>
      <ScreenHeader
        title={intl.formatMessage({ id: 'dailyStreak.title' })}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showStreak={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StreakTopMetricsRow
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          totalActiveDays={totalActiveDays}
          isActiveToday={isActiveToday}
          colors={colors}
        />

        <StreakFreezeCard
          currentStreak={currentStreak}
          isActiveToday={isActiveToday}
          isFrozenToday={isFrozenToday}
          colors={colors}
        />

        <StreakMonthCalendar activeDates={activeDates} frozenDates={frozenDates} colors={colors} />

        <StreakMilestonesList
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          colors={colors}
        />
      </ScrollView>
    </ScreenBackground>
  );
}
