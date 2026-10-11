import React, { useState } from 'react';
import { Linking } from 'react-native';
import { useIntl } from 'react-intl';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppUpdate, UpdateType } from '../../hooks/useAppUpdate';
import { BaseDialog } from '../BaseDialog/BaseDialog';

export function AppUpdateModal(): React.JSX.Element | null {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const { updateType, updateUrl, isLoading } = useAppUpdate();
  const [dismissedType, setDismissedType] = useState<UpdateType | null>(null);

  const shouldHideModal =
    isLoading || updateType === 'none' || (updateType === 'soft' && dismissedType === 'soft');

  if (shouldHideModal) {
    return null;
  }

  const handleUpdate = () => {
    if (updateUrl) {
      Linking.openURL(updateUrl).catch(() => {});
    }
  };

  const handleClose = () => {
    if (updateType === 'soft') {
      setDismissedType('soft');
    }
  };

  const messageText =
    updateType === 'force'
      ? intl.formatMessage({ id: 'appUpdate.forceMessage' })
      : intl.formatMessage({ id: 'appUpdate.softMessage' });

  return (
    <BaseDialog
      visible={true}
      onClose={updateType === 'soft' ? handleClose : undefined}
      icon={<Ionicons name="cloud-download" size={32} color={colors.primary} />}
      title={intl.formatMessage({ id: 'appUpdate.title' })}
      message={messageText}
      primaryButton={{
        text: intl.formatMessage({ id: 'appUpdate.button' }),
        onPress: handleUpdate,
        testID: 'app-update-now-button',
      }}
      testID="app-update-modal"
      closeButtonTestID="app-update-close-button"
    />
  );
}
