import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  Modal,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { soundService } from '../../services/soundService';
import { createStyles } from './QuizSettingsModal.styles';

export interface QuizSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  speakOnCorrectAnswer: boolean;
  onToggleSpeakOnCorrectAnswer: (value: boolean) => void;
}

export function QuizSettingsModal(props: QuizSettingsModalProps): React.JSX.Element {
  const { visible, onClose, speakOnCorrectAnswer, onToggleSpeakOnCorrectAnswer } = props;

  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSpeakToggle = (value: boolean) => {
    onToggleSpeakOnCorrectAnswer(value);
    if (value) {
      soundService.playTapSound();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e?.stopPropagation?.()}>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {intl.formatMessage({ id: 'quizSettingsModal.title' })}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  testID="quiz-settings-close-btn"
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Pronounce correct answer toggle */}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5 name="volume-up" size={15} color={colors.primary} />
                  </View>
                  <Text style={styles.rowLabel}>
                    {intl.formatMessage({ id: 'settingsScreen.speakOnCorrectAnswer' })}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <Switch
                    value={speakOnCorrectAnswer}
                    onValueChange={handleSpeakToggle}
                    trackColor={{ false: colors.blockBorder, true: colors.primary }}
                    thumbColor="#ffffff"
                    testID="speak-switch"
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
