import React, { useMemo, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { createStyles } from './OfflineLimitModal.styles';
import { useAppTheme } from '../../context/ThemeContext';
import { trackEvent } from '../../services/analyticsService';
import { isFeatureEnabled } from '../../services/featuresService';

export interface OfflineLimitModalProps {
  visible: boolean;
  onDismiss: () => void;
  onPremiumCTA?: () => void;
  onRetry: () => void;
  onPurchaseSuccess?: () => void;
  /** DEV only: simulate trial offer for UI testing */
  debugMockTrial?: boolean;
}

export function OfflineLimitModal({
  visible,
  onDismiss,
  onPremiumCTA,
  onRetry,
}: OfflineLimitModalProps): React.JSX.Element {
  const intl = useIntl();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  useEffect(() => {
    if (visible) {
      trackEvent('offline_limit_modal_shown', {});
    }
  }, [visible]);

  const handleDismissWithReason = (reason: 'close_button' | 'backdrop') => {
    trackEvent('offline_limit_modal_close_clicked', { reason });
    onDismiss();
  };

  const handlePremiumPress = () => {
    trackEvent('offline_limit_modal_premium_clicked', { has_trial: false });
    if (onPremiumCTA) {
      onPremiumCTA();
    } else {
      onDismiss();
    }
  };

  const isPremiumAvailable = isFeatureEnabled('ENABLE_PREMIUM') && Boolean(onPremiumCTA);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => handleDismissWithReason('backdrop')}
          testID="offline-modal-backdrop"
        />

        <View style={styles.modalContainer} testID="offline-modal-container">
          <View style={styles.gradient}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => handleDismissWithReason('close_button')}
              testID="offline-modal-close-button"
            >
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.content}>
              <View style={styles.iconCircle}>
                <Ionicons name="cloud-offline" size={32} color={colors.primary} />
              </View>

              <Text style={styles.title}>{intl.formatMessage({ id: 'offlineModal.title' })}</Text>

              <Text style={styles.message}>
                {intl.formatMessage({ id: 'offlineModal.message' })}
              </Text>

              {isPremiumAvailable && (
                <>
                  <TouchableOpacity
                    style={styles.premiumButton}
                    activeOpacity={0.85}
                    onPress={handlePremiumPress}
                    testID="offline-modal-premium-button"
                  >
                    <View style={styles.premiumButtonIcon}>
                      <FontAwesome5 name="gem" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.premiumButtonText}>
                      {intl.formatMessage({ id: 'offlineModal.enableOffline' })}
                    </Text>
                    <View style={styles.premiumButtonIcon} />
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

              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.85}
                onPress={onRetry}
                testID="offline-modal-retry-button"
              >
                <View style={styles.retryButtonIcon}>
                  <FontAwesome5 name="redo-alt" size={14} color={colors.primary} />
                </View>
                <Text style={styles.retryButtonText}>
                  {intl.formatMessage({ id: 'offlineModal.retry' })}
                </Text>
                <View style={styles.retryButtonIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
