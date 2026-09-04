import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { useRewardedAd } from '../../ads/useRewardedAd';
import { grantExtraQuiz } from '../../services/usageService';
import { trackEvent } from '../../services/analyticsService';
import { createStyles } from './DailyQuizLimitModal.styles';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ENABLE_PREMIUM } = require('../../config/features');

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

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => handleDismissWithReason('backdrop')}
          testID="daily-limit-backdrop"
        />

        <View style={styles.modalContainer} testID="daily-limit-modal-container">
          <View style={styles.gradient}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => handleDismissWithReason('close_button')}
              testID="daily-limit-close-button"
            >
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.content}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="hourglass-half" size={28} color={colors.primary} />
              </View>

              <Text style={styles.title}>
                {intl.formatMessage({ id: 'dailyQuizLimitModal.title' })}
              </Text>

              <Text style={styles.message}>
                {intl.formatMessage({ id: 'dailyQuizLimitModal.message' })}
              </Text>

              <Text style={styles.emphasisText}>
                {intl.formatMessage({ id: 'dailyQuizLimitModal.instructions' })}
              </Text>

              {/* Premium Button & Divider */}
              {ENABLE_PREMIUM && onPremiumCTA && (
                <>
                  <TouchableOpacity
                    style={styles.premiumButton}
                    activeOpacity={0.85}
                    onPress={handlePremiumPress}
                    testID="daily-limit-premium-button"
                  >
                    <View style={styles.premiumButtonIcon}>
                      <FontAwesome5 name="gem" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.premiumButtonText}>
                      {intl.formatMessage({ id: 'dailyQuizLimitModal.premiumButtonNoTrial' })}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>
                      {intl.formatMessage({ id: 'dailyQuizLimitModal.or' })}
                    </Text>
                    <View style={styles.dividerLine} />
                  </View>
                </>
              )}

              {/* Rewarded Video / Ad Button */}
              <TouchableOpacity
                style={styles.videoButton}
                activeOpacity={0.85}
                onPress={handleSecondaryButtonPress}
                disabled={isVideoLoading || isAdLoading}
                testID="daily-limit-video-button"
              >
                {renderVideoButtonContent()}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
