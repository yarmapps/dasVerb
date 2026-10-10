import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { ThemeColors } from '../../../styles/themeColors';
import { FireIcon } from '../../../components/FireIcon/FireIcon';
import { SnowflakeIcon } from '../../../components/SnowflakeIcon/SnowflakeIcon';
import { getLocalDateString } from '../../../services/streakService';
import { soundService } from '../../../services/soundService';
import { trackEvent } from '../../../services/analyticsService';
import { createStyles } from './StreakMonthCalendar.styles';

export interface StreakMonthCalendarProps {
  activeDates: string[];
  frozenDates?: string[];
  colors: ThemeColors;
}

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakMonthCalendar({
  activeDates,
  frozenDates = [],
  colors,
}: StreakMonthCalendarProps): React.JSX.Element {
  const intl = useIntl();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const todayDateString = useMemo(() => getLocalDateString(), []);
  const todayDate = useMemo(() => new Date(), []);

  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth()); // 0-indexed

  // Format header month label (e.g. "October 2026")
  const monthLabel = useMemo(() => {
    const monthDateInstance = new Date(currentYear, currentMonth, 1);
    return monthDateInstance.toLocaleDateString(intl.locale || 'en-US', {
      month: 'short',
      year: 'numeric',
    });
  }, [currentYear, currentMonth, intl.locale]);

  const isCurrentMonthOrFuture =
    currentYear === todayDate.getFullYear() && currentMonth >= todayDate.getMonth();

  const handlePrevMonth = () => {
    soundService.playTapSound();
    let nextYear = currentYear;
    let nextMonth = currentMonth - 1;
    if (currentMonth === 0) {
      nextMonth = 11;
      nextYear = currentYear - 1;
      setCurrentMonth(11);
      setCurrentYear(previousYear => previousYear - 1);
    } else {
      setCurrentMonth(previousMonth => previousMonth - 1);
    }
    trackEvent('daily_streak_month_changed', {
      direction: 'prev',
      year: nextYear,
      month: nextMonth + 1,
    });
  };

  const handleNextMonth = () => {
    if (isCurrentMonthOrFuture) {
      return;
    }
    soundService.playTapSound();
    let nextYear = currentYear;
    let nextMonth = currentMonth + 1;
    if (currentMonth === 11) {
      nextMonth = 0;
      nextYear = currentYear + 1;
      setCurrentMonth(0);
      setCurrentYear(previousYear => previousYear + 1);
    } else {
      setCurrentMonth(previousMonth => previousMonth + 1);
    }
    trackEvent('daily_streak_month_changed', {
      direction: 'next',
      year: nextYear,
      month: nextMonth + 1,
    });
  };

  // Compute days grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay();
  // Mon: 0, Tue: 1, ..., Sun: 6
  const leadingOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

  const activeDatesSet = useMemo(() => new Set(activeDates), [activeDates]);
  const frozenDatesSet = useMemo(() => new Set(frozenDates), [frozenDates]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.navArrowButton}
          onPress={handlePrevMonth}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthTitleText}>{monthLabel}</Text>
        <TouchableOpacity
          style={[styles.navArrowButton, isCurrentMonthOrFuture && styles.navArrowDisabled]}
          onPress={handleNextMonth}
          disabled={isCurrentMonthOrFuture}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekHeaderRow}>
        {WEEK_DAYS.map((weekdayLetter, index) => (
          <View key={`weekday-${index}`} style={styles.weekDayColumn}>
            <Text style={styles.weekDayText}>{weekdayLetter}</Text>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.daysGrid}>
        {Array.from({ length: leadingOffset }).map((_, emptyIndex) => (
          <View key={`empty-${emptyIndex}`} style={styles.emptyCell} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
          const dayNumber = dayIndex + 1;
          const monthString = String(currentMonth + 1).padStart(2, '0');
          const dayString = String(dayNumber).padStart(2, '0');
          const formattedDateString = `${currentYear}-${monthString}-${dayString}`;

          const isActive = activeDatesSet.has(formattedDateString);
          const isFrozen = !isActive && frozenDatesSet.has(formattedDateString);
          const isToday = formattedDateString === todayDateString;
          const isFuture = formattedDateString > todayDateString;

          let cellContent: React.JSX.Element;
          if (isActive) {
            cellContent = <FireIcon size={20} isActive={true} />;
          } else if (isFrozen) {
            cellContent = <SnowflakeIcon size={20} isActive={true} />;
          } else {
            cellContent = (
              <Text style={[styles.dayText, isFuture && styles.mutedDayText]}>{dayNumber}</Text>
            );
          }

          return (
            <View key={formattedDateString} style={styles.cellWrapper}>
              <View style={[styles.dayCircle, isToday && styles.todayRing]}>{cellContent}</View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
