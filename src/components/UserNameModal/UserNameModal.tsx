import React, { useState, useMemo } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { soundService } from '../../services/soundService';
import { BaseDialog } from '../BaseDialog/BaseDialog';
import { createStyles } from './UserNameModal.styles';

export interface UserNameModalProps {
  visible: boolean;
  onSave: (name: string) => void;
  onClose?: () => void;
  initialValue?: string;
}

const resolveInitialName = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  return trimmed.toLowerCase() === 'learner' ? '' : trimmed;
};

export function UserNameModal({
  visible,
  onSave,
  onClose,
  initialValue = '',
}: UserNameModalProps): React.JSX.Element {
  const { colors, isDark } = useAppTheme();
  const intl = useIntl();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [prevVisible, setPrevVisible] = useState(visible);
  const [name, setName] = useState(() => resolveInitialName(initialValue));
  const [error, setError] = useState(false);

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setName(resolveInitialName(initialValue));
      setError(false);
    }
  }

  const isSaveDisabled = name.trim().length < 1;

  const handleSave = () => {
    soundService.playTapSound();
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setError(true);
      return;
    }
    setError(false);
    onSave(trimmed);
  };

  return (
    <BaseDialog
      visible={visible}
      onClose={onClose}
      title={intl.formatMessage({ id: 'leaderboard.modalTitle' })}
      message={intl.formatMessage({ id: 'leaderboard.modalSubtitle' })}
      titleStyle={styles.title}
      messageStyle={styles.message}
      primaryButton={{
        text: intl.formatMessage({ id: 'common.save' }),
        onPress: handleSave,
        disabled: isSaveDisabled,
        buttonStyle: styles.saveBtn,
        testID: 'user-name-save-button',
      }}
      testID="user-name-modal"
      closeButtonTestID="user-name-close-button"
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={intl.formatMessage({ id: 'leaderboard.modalPlaceholder' })}
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={text => {
            setName(text);
            if (error && text.trim().length >= 1) setError(false);
          }}
          maxLength={15}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        {error && (
          <Text style={styles.errorText}>
            {intl.formatMessage({ id: 'leaderboard.modalError' })}
          </Text>
        )}
      </View>
    </BaseDialog>
  );
}
