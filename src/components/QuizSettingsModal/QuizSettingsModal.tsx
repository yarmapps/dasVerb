import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  Modal,
  Platform,
  Linking,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { soundService } from '../../services/soundService';
import { speechService } from '../../services/speechService';
import { createStyles } from './QuizSettingsModal.styles';

export interface QuizSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  speakOnCorrectAnswer: boolean;
  onToggleSpeakOnCorrectAnswer: (value: boolean) => void;
  ttsVoiceGender: 'female' | 'male';
  onToggleTtsVoiceGender: () => void;
}

export function QuizSettingsModal(props: QuizSettingsModalProps): React.JSX.Element {
  const {
    visible,
    onClose,
    speakOnCorrectAnswer,
    onToggleSpeakOnCorrectAnswer,
    ttsVoiceGender,
    onToggleTtsVoiceGender,
  } = props;

  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [showMaleVoiceHint, setShowMaleVoiceHint] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    if (visible && ttsVoiceGender === 'male' && Platform.OS === 'ios') {
      speechService.hasMaleVoiceAvailable().then(has => {
        if (!isCancelled) {
          setShowMaleVoiceHint(!has);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [visible, ttsVoiceGender]);

  const isMaleVoiceHintVisible =
    visible && ttsVoiceGender === 'male' && Platform.OS === 'ios' && showMaleVoiceHint;

  const voiceGenderLabel = useMemo(() => {
    if (ttsVoiceGender === 'female') {
      return intl.formatMessage({ id: 'settingsScreen.voiceFemale' });
    }
    return intl.formatMessage({ id: 'settingsScreen.voiceMale' });
  }, [intl, ttsVoiceGender]);

  const handleVoiceHintPress = () => {
    Linking.openURL('App-prefs:ACCESSIBILITY&path=SPEECH');
  };

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
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
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
                  />
                </View>
              </View>

              <View style={styles.separator} />

              {/* Voice gender selector */}
              <TouchableOpacity
                style={styles.row}
                onPress={onToggleTtsVoiceGender}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5 name="venus-mars" size={15} color={colors.primary} />
                  </View>
                  <Text style={styles.rowLabel}>
                    {intl.formatMessage({ id: 'settingsScreen.voiceGender' })}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <View style={styles.rowValueContainer}>
                    <Text style={styles.rowValue}>{voiceGenderLabel}</Text>
                    <FontAwesome5 name="chevron-right" size={12} color={colors.textMuted} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Hint when no male voice installed on iOS */}
              {isMaleVoiceHintVisible ? (
                <TouchableOpacity
                  style={styles.maleVoiceHintContainer}
                  onPress={handleVoiceHintPress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.maleVoiceHintText}>
                    {intl.formatMessage({ id: 'settingsScreen.maleVoiceHint' })}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
