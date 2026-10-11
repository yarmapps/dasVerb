import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { MonthlyRecapData } from '../../services/leaderboardService';
import { ScreenBackground } from '../ScreenBackground/ScreenBackground';
import { ConfettiOverlay } from '../ConfettiOverlay/ConfettiOverlay';
import { GenericLevelCircle } from '../GenericLevelCircle/GenericLevelCircle';
import { useAppTheme } from '../../context/ThemeContext';
import { soundService } from '../../services/soundService';
import { Spacing } from '../../styles/spacing';
import { createStyles } from './MonthlySummaryModal.styles';

export interface MonthlySummaryModalProps {
  visible: boolean;
  data: MonthlyRecapData | null;
  onClose: () => void;
}

const formatNumberWithSpace = (num: number): string =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export function MonthlySummaryModal({
  visible,
  data,
  onClose,
}: MonthlySummaryModalProps): React.JSX.Element | null {
  const intl = useIntl();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleClose = () => {
    soundService.playTapSound();
    onClose();
  };

  if (!visible || !data) {
    return null;
  }

  const {
    rank,
    score,
    monthDate,
    totalParticipants,
    allTimeRank,
    allTimeTotalParticipants,
    isChampion,
    isInTop3,
  } = data;

  // Format month name only without year and capitalize first letter (e.g. "July" / "Июль")
  const rawMonthName = intl.formatDate(monthDate, { month: 'long' });
  const monthName = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

  const topInset = insets.top > 0 ? insets.top : Spacing.sm;
  const bottomInset = insets.bottom > 0 ? insets.bottom : Spacing.md;

  const ringColor = isChampion ? '#EAB308' : colors.primary;

  const allTimeRankFormatted = formatNumberWithSpace(allTimeRank ?? rank);
  const allTimeTotalFormatted = allTimeTotalParticipants
    ? formatNumberWithSpace(allTimeTotalParticipants)
    : '';

  const allTimeDisplay = allTimeTotalParticipants
    ? intl.formatMessage(
        { id: 'monthlyRecap.allTimeStandingValue' },
        { rank: allTimeRankFormatted, total: allTimeTotalFormatted },
      )
    : `#${allTimeRankFormatted}`;

  const headlineKey = isChampion
    ? 'monthlyRecap.championHeadline'
    : 'monthlyRecap.finishedHeadline';

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={handleClose}>
      <ScreenBackground>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
          {/* Top Bar with Title on same level as Close Button */}
          <View style={[styles.topBar, { paddingTop: topInset }]}>
            <View style={styles.headerSpacer} />
            <Text style={styles.topBarTitle}>
              {intl.formatMessage(
                { id: 'monthlyRecap.title' },
                {
                  month: <Text style={styles.monthHighlight}>{monthName}</Text>,
                },
              )}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
              testID="monthly-summary-close-button"
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {isInTop3 && <ConfettiOverlay count={120} />}

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Text Above Circle */}
            <Text style={styles.aboveCircleText}>{intl.formatMessage({ id: headlineKey })}</Text>

            {/* Hero Section: GenericLevelCircle */}
            <View style={styles.heroSection}>
              <GenericLevelCircle
                size={124}
                outerBorderColor={ringColor}
                outerBorderWidth={6}
                hasGlow={true}
                fillPercentage={100}
                fillColor={ringColor}
                fillOpacity={0.16}
                innerBackgroundColor={colors.blockBackground}
              >
                <Text
                  style={[
                    styles.heroRankText,
                    rank >= 100 && rank < 1000 && styles.heroRankTextThreeDigits,
                    rank >= 1000 && styles.heroRankTextFourDigits,
                    isChampion && styles.heroRankChampion,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  #{formatNumberWithSpace(rank)}
                </Text>
              </GenericLevelCircle>
            </View>

            {/* Text Below Circle */}
            <Text style={styles.belowCircleText}>
              {intl.formatMessage(
                { id: 'monthlyRecap.monthlyParticipants' },
                { count: formatNumberWithSpace(totalParticipants) },
              )}
            </Text>

            {/* Champion Hall of Fame subline for #1 */}
            {isChampion && (
              <Text style={styles.championSubline}>
                {intl.formatMessage({ id: 'monthlyRecap.championHallOfFame' })}
              </Text>
            )}

            {/* Stats Cards in Swapped Order */}
            <View style={styles.cardsList}>
              {/* 1. Monthly Points Earned */}
              <View style={styles.statRowCard}>
                <View style={styles.statLeftGroup}>
                  <View style={styles.statIconCircle}>
                    <FontAwesome5 name="star" size={14} color="#FFB300" solid />
                  </View>
                  <Text style={styles.statLabel}>
                    {intl.formatMessage({ id: 'monthlyRecap.pointsEarned' })}
                  </Text>
                </View>
                <Text style={styles.statValuePoints}>+{formatNumberWithSpace(score)} pts</Text>
              </View>

              {/* 2. All-Time Standing */}
              <View style={styles.statRowCard}>
                <View style={styles.statLeftGroup}>
                  <View style={styles.statIconCircle}>
                    <FontAwesome5 name="award" size={15} color={colors.textSecondary} />
                  </View>
                  <Text style={styles.statLabel}>
                    {intl.formatMessage({ id: 'monthlyRecap.allTimeStanding' })}
                  </Text>
                </View>
                <Text style={styles.statValue}>{allTimeDisplay}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Action Footer */}
          <View style={[styles.footer, { paddingBottom: bottomInset }]}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleClose}
              activeOpacity={0.85}
              testID="monthly-summary-continue-button"
            >
              <Text style={styles.continueButtonText}>
                {intl.formatMessage({ id: 'monthlyRecap.continueButton' })}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    </Modal>
  );
}
