import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { soundService } from '../../services/soundService';
import { QuizInputMode } from '../../services/settingsService';
import { BaseDialog } from '../BaseDialog/BaseDialog';
import { createStyles } from './QuizInputModeModal.styles';

export interface QuizInputModeModalProps {
  visible: boolean;
  currentMode: QuizInputMode;
  onClose: () => void;
  onSelectMode: (mode: QuizInputMode) => void;
  isPremium: boolean;
}

export function QuizInputModeModal({
  visible,
  currentMode,
  onClose,
  onSelectMode,
  isPremium,
}: QuizInputModeModalProps): React.JSX.Element {
  const { colors, isDark } = useAppTheme();
  const intl = useIntl();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleSelect = (mode: QuizInputMode) => {
    soundService.playTapSound();
    onSelectMode(mode);
  };

  return (
    <BaseDialog
      visible={visible}
      onClose={onClose}
      icon={<FontAwesome5 name="keyboard" size={22} color={colors.primary} />}
      title={intl.formatMessage({ id: 'settingsScreen.quizInputMode' })}
      message={intl.formatMessage({ id: 'settingsScreen.quizInputModeDesc' })}
      closeButtonTestID="quiz-input-mode-modal-close-btn"
      testID="quiz-input-mode-modal"
    >
      <View style={styles.optionsContainer}>
        {/* Multiple Choice Option */}
        <TouchableOpacity
          style={[styles.optionItem, currentMode === 'choice' && styles.optionItemActive]}
          onPress={() => handleSelect('choice')}
          activeOpacity={0.7}
          testID="settings-input-mode-choice-btn"
        >
          <View style={styles.optionLeft}>
            <View
              style={[
                styles.optionIconContainer,
                currentMode === 'choice' && styles.optionIconContainerActive,
              ]}
            >
              <FontAwesome5 name="th-large" size={14} color={colors.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>
                {intl.formatMessage({ id: 'settingsScreen.quizInputModeChoice' })}
              </Text>
              <Text style={styles.optionSubtitle}>
                {intl.formatMessage({ id: 'settingsScreen.quizInputModeChoiceDesc' })}
              </Text>
            </View>
          </View>
          <View style={styles.radioContainer}>
            {currentMode === 'choice' ? (
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            ) : (
              <View style={styles.radioUnchecked} />
            )}
          </View>
        </TouchableOpacity>

        {/* Type-in Mode Option */}
        <TouchableOpacity
          style={[styles.optionItem, currentMode === 'type_in' && styles.optionItemActive]}
          onPress={() => handleSelect('type_in')}
          activeOpacity={0.7}
          testID="settings-input-mode-type-in-btn"
        >
          <View style={styles.optionLeft}>
            <View
              style={[
                styles.optionIconContainer,
                currentMode === 'type_in' && styles.optionIconContainerActive,
              ]}
            >
              <FontAwesome5 name="font" size={14} color={colors.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <View style={styles.optionTitleRow}>
                <Text style={styles.optionTitle}>
                  {intl.formatMessage({ id: 'settingsScreen.quizInputModeTypeIn' })}
                </Text>
                {!isPremium && (
                  <FontAwesome5
                    name="gem"
                    size={11}
                    color={colors.premiumDiamond}
                    style={styles.diamondBadge}
                  />
                )}
              </View>
              <Text style={styles.optionSubtitle}>
                {intl.formatMessage({ id: 'settingsScreen.quizInputModeTypeInDesc' })}
              </Text>
            </View>
          </View>
          <View style={styles.radioContainer}>
            {currentMode === 'type_in' ? (
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            ) : (
              <View style={styles.radioUnchecked} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </BaseDialog>
  );
}
