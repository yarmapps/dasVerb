import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { ThemeColors } from '../../../styles/themeColors';
import { SnowflakeIcon } from '../../../components/SnowflakeIcon/SnowflakeIcon';
import { isPremiumEnabled } from '../../../services/premiumAccessService';
import { freezeStreakToday } from '../../../services/streakService';
import { soundService } from '../../../services/soundService';
import { hapticService } from '../../../services/hapticService';
import { trackEvent } from '../../../services/analyticsService';
import { adManager } from '../../../ads/adManager';
import { createStyles } from './StreakFreezeCard.styles';

export interface StreakFreezeCardProps {
  currentStreak: number;
  isActiveToday: boolean;
  isFrozenToday: boolean;
  colors: ThemeColors;
}

export function StreakFreezeCard({
  currentStreak,
  isActiveToday,
  isFrozenToday,
  colors,
}: StreakFreezeCardProps): React.JSX.Element {
  const intl = useIntl();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const isPremium = isPremiumEnabled();

  const handleFreezePress = async () => {
    if (isLoadingAd) {
      return;
    }
    soundService.playTapSound();

    trackEvent('daily_streak_freeze_button_clicked', {
      is_premium: isPremium,
      current_streak: currentStreak,
    });

    if (isPremium) {
      freezeStreakToday();
      void hapticService.notificationSuccess();
      trackEvent('daily_streak_freeze_success', {
        method: 'premium',
        current_streak: currentStreak,
      });
      return;
    }

    // Free user: watch rewarded ad
    setIsLoadingAd(true);
    try {
      const isRewardEarned = await adManager.showRewardedOrFallback();
      if (isRewardEarned) {
        freezeStreakToday();
        void hapticService.notificationSuccess();
        trackEvent('daily_streak_freeze_success', {
          method: 'rewarded_ad',
          current_streak: currentStreak,
        });
      }
    } catch {
      // Ad display failed
    } finally {
      setIsLoadingAd(false);
    }
  };

  const isProtected = isActiveToday || isFrozenToday;
  const isZeroStreak = currentStreak === 0;
  const isDisabled = isProtected || isZeroStreak || isLoadingAd;

  const renderButtonContent = () => {
    if (isLoadingAd) {
      return <ActivityIndicator size="small" color="#FFFFFF" />;
    }

    if (isActiveToday) {
      return (
        <Text style={[styles.freezeButtonText, styles.freezeButtonTextDisabled]}>
          {intl.formatMessage({ id: 'dailyStreak.buttonAlreadySafe' })}
        </Text>
      );
    }

    if (isFrozenToday) {
      return (
        <Text style={[styles.freezeButtonText, styles.freezeButtonTextDisabled]}>
          {intl.formatMessage({ id: 'dailyStreak.buttonAlreadyFrozen' })}
        </Text>
      );
    }

    if (isZeroStreak) {
      return (
        <Text style={[styles.freezeButtonText, styles.freezeButtonTextDisabled]}>
          {intl.formatMessage({ id: 'dailyStreak.buttonNoStreak' })}
        </Text>
      );
    }

    if (isPremium) {
      return (
        <Text style={styles.freezeButtonText}>
          {intl.formatMessage({ id: 'dailyStreak.freezeButtonPremium' })}
        </Text>
      );
    }

    return (
      <>
        <FontAwesome5 name="play-circle" size={16} color="#FFFFFF" />
        <Text style={styles.freezeButtonText}>
          {intl.formatMessage({ id: 'dailyStreak.freezeButtonFree' })}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
      </>
    );
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <SnowflakeIcon size={24} isActive={true} />
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.titleText}>
            {intl.formatMessage({ id: 'dailyStreak.freezeCardTitle' })}
          </Text>
          <Text style={styles.descText}>
            {intl.formatMessage({ id: 'dailyStreak.freezeCardDesc' })}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.freezeButton, isDisabled && styles.freezeButtonDisabled]}
        onPress={handleFreezePress}
        activeOpacity={isDisabled ? 1 : 0.8}
        disabled={isDisabled}
      >
        {renderButtonContent()}
      </TouchableOpacity>
    </View>
  );
}
