import React, { useMemo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { useRewardedAd } from '../../ads/useRewardedAd';
import { grantExtraQuiz } from '../../services/usageService';
import { trackEvent } from '../../services/analyticsService';
import { isFeatureEnabled } from '../../services/featuresService';
import { BaseDialog } from '../BaseDialog/BaseDialog';
import { createStyles } from './DailyQuizLimitModal.styles';

export interface DailyQuizLimitModalProps {
  visible: boolean;
  onDismiss: () => void;
  onPremiumCTA?: () => void;
  onVideoSuccess: () => void;
  canWatchAd?: boolean;
}

export function DailyQuizLimitModal({
  visible,
  onDismiss,
  onPremiumCTA,
  onVideoSuccess,
  canWatchAd = true,
}: DailyQuizLimitModalProps): React.JSX.Element {
  const intl = useIntl();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { showRewardedAd, isAdLoading } = useRewardedAd();
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const handleVideoPress = async () => {
    if (isVideoLoading || isAdLoading) return;

    trackEvent('daily_limit_ad_chosen', {});
    setIsVideoLoading(true);
    const rewardEarned = await showRewardedAd();
    setIsVideoLoading(false);

    if (rewardEarned) {
      grantExtraQuiz();
      onVideoSuccess();
    }
  };

  const handlePremiumPress = () => {
    trackEvent('daily_limit_premium_clicked', {});
    if (onPremiumCTA) {
      onPremiumCTA();
    } else {
      onDismiss();
    }
  };

  const handleDismissWithReason = (reason: 'close_button' | 'backdrop' | 'wait_button') => {
    trackEvent('daily_limit_ad_declined', { reason });
    onDismiss();
  };

  const handleSecondaryButtonPress = () => {
    if (canWatchAd) {
      handleVideoPress();
    } else {
      handleDismissWithReason('wait_button');
    }
  };

  const renderVideoButtonContent = () => {
    if (isVideoLoading || isAdLoading) {
      return <ActivityIndicator color={colors.primary} size="small" />;
    }

    if (canWatchAd) {
      return (
        <>
          <View style={styles.videoButtonIcon}>
            <FontAwesome5 name="tv" size={16} color={colors.primary} />
          </View>
          <Text style={styles.videoButtonText}>
            {intl.formatMessage({ id: 'dailyQuizLimitModal.videoButton' })}
          </Text>
        </>
      );
    }

    return (
      <>
        <View style={styles.videoButtonIcon}>
          <FontAwesome5 name="clock" size={16} color={colors.primary} />
        </View>
        <Text style={styles.videoButtonText}>
          {intl.formatMessage({ id: 'dailyQuizLimitModal.waitUntilTomorrow' })}
        </Text>
      </>
    );
  };

  const isPremiumAvailable = isFeatureEnabled('ENABLE_PREMIUM') && Boolean(onPremiumCTA);

  return (
    <BaseDialog
      visible={visible}
      onClose={() => handleDismissWithReason('close_button')}
      icon={<FontAwesome5 name="hourglass-half" size={28} color={colors.primary} />}
      title={intl.formatMessage({ id: 'dailyQuizLimitModal.title' })}
      message={intl.formatMessage({ id: 'dailyQuizLimitModal.message' })}
      emphasisText={intl.formatMessage({ id: 'dailyQuizLimitModal.instructions' })}
      primaryButton={
        isPremiumAvailable
          ? {
              text: intl.formatMessage({ id: 'dailyQuizLimitModal.premiumButtonNoTrial' }),
              onPress: handlePremiumPress,
              icon: <FontAwesome5 name="gem" size={16} color="#FFFFFF" />,
              testID: 'daily-limit-premium-button',
            }
          : undefined
      }
      secondaryButton={{
        content: renderVideoButtonContent(),
        onPress: handleSecondaryButtonPress,
        disabled: isVideoLoading || isAdLoading,
        testID: 'daily-limit-video-button',
      }}
      dividerText={
        isPremiumAvailable ? intl.formatMessage({ id: 'dailyQuizLimitModal.or' }) : undefined
      }
      testID="daily-limit-modal-container"
      closeButtonTestID="daily-limit-close-button"
      backdropTestID="daily-limit-backdrop"
    />
  );
}
