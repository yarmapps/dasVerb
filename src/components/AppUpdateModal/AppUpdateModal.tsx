import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, Linking } from 'react-native';
import { useIntl } from 'react-intl';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppUpdate, UpdateType } from '../../hooks/useAppUpdate';
import { CloseIconButton } from '../CloseIconButton/CloseIconButton';
import { createStyles } from './AppUpdateModal.styles';

export function AppUpdateModal(): React.JSX.Element | null {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={handleClose}
      testID="app-update-modal"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {updateType === 'soft' ? (
            <CloseIconButton
              onPress={handleClose}
              style={styles.closeButton}
              testID="app-update-close-button"
            />
          ) : null}

          <View style={styles.iconContainer}>
            <Ionicons name="cloud-download" size={44} color={colors.primary} />
          </View>

          <Text style={styles.title}>{intl.formatMessage({ id: 'appUpdate.title' })}</Text>

          <Text style={styles.message}>{messageText}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdate}
            activeOpacity={0.8}
            testID="app-update-now-button"
          >
            <Text style={styles.buttonText}>{intl.formatMessage({ id: 'appUpdate.button' })}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
