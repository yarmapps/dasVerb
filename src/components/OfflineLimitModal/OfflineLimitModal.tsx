import React, { useEffect } from 'react';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { trackEvent } from '../../services/analyticsService';
import { isFeatureEnabled } from '../../services/featuresService';
import { BaseDialog } from '../BaseDialog/BaseDialog';

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
  const { colors } = useAppTheme();

  useEffect(() => {
    if (visible) {
      trackEvent('offline_limit_modal_shown', {});
    }
  }, [visible]);

  const handleDismiss = () => {
    trackEvent('offline_limit_modal_close_clicked', { reason: 'close_button' });
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
    <BaseDialog
      visible={visible}
      onClose={handleDismiss}
      icon={<Ionicons name="cloud-offline" size={32} color={colors.primary} />}
      title={intl.formatMessage({ id: 'offlineModal.title' })}
      message={intl.formatMessage({ id: 'offlineModal.message' })}
      primaryButton={
        isPremiumAvailable
          ? {
              text: intl.formatMessage({ id: 'offlineModal.enableOffline' }),
              onPress: handlePremiumPress,
              icon: <FontAwesome5 name="gem" size={16} color="#FFFFFF" />,
              testID: 'offline-modal-premium-button',
            }
          : undefined
      }
      secondaryButton={{
        text: intl.formatMessage({ id: 'offlineModal.retry' }),
        onPress: onRetry,
        icon: <FontAwesome5 name="redo-alt" size={14} color={colors.primary} />,
        testID: 'offline-modal-retry-button',
      }}
      dividerText={
        isPremiumAvailable ? intl.formatMessage({ id: 'dailyQuizLimitModal.or' }) : undefined
      }
      testID="offline-modal-container"
      closeButtonTestID="offline-modal-close-button"
      backdropTestID="offline-modal-backdrop"
    />
  );
}
