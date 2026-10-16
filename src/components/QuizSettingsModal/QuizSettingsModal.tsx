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
import { QuizInputMode } from '../../services/settingsService';
import { createStyles } from './QuizSettingsModal.styles';

export interface QuizSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  speakOnCorrectAnswer: boolean;
  onToggleSpeakOnCorrectAnswer: (value: boolean) => void;
  ttsVoiceGender: 'female' | 'male';
  onChangeVoiceGender: (gender: 'female' | 'male') => void;
  quizInputMode: QuizInputMode;
  isPremium: boolean;
  onChangeInputMode: (mode: QuizInputMode) => void;
  onRequirePremium: () => void;
}

export function QuizSettingsModal(props: QuizSettingsModalProps): React.JSX.Element {
  const {
    visible,
    onClose,
    speakOnCorrectAnswer,
    onToggleSpeakOnCorrectAnswer,
    ttsVoiceGender,
    onChangeVoiceGender,
    quizInputMode,
    isPremium,
    onChangeInputMode,
    onRequirePremium,
  } = props;

  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSpeakToggle = (value: boolean) => {
    onToggleSpeakOnCorrectAnswer(value);
    if (value) {
      soundService.playTapSound();
    }
  };

  const handleVoiceChange = (gender: 'female' | 'male') => {
    if (gender !== ttsVoiceGender) {
      soundService.playTapSound();
      onChangeVoiceGender(gender);
    }
  };

  const handleInputModeSelect = (mode: QuizInputMode) => {
    soundService.playTapSound();
    if (mode === 'type_in' && !isPremium) {
      onClose();
      onRequirePremium();
      return;
    }
    onChangeInputMode(mode);
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
                  onPress={() => {
                    soundService.playTapSound();
                    onClose();
                  }}
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

              <View style={styles.separator} />

              {/* Voice Gender Selection */}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5 name="user-friends" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.rowLabel}>
                    {intl.formatMessage({ id: 'settingsScreen.voiceGender' })}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <View style={styles.voiceSegmentContainer}>
                    <TouchableOpacity
                      style={[
                        styles.voiceSegmentButton,
                        ttsVoiceGender === 'female' && styles.voiceSegmentButtonActive,
                      ]}
                      onPress={() => handleVoiceChange('female')}
                      activeOpacity={0.8}
                      testID="voice-gender-female-btn"
                    >
                      <FontAwesome5
                        name="female"
                        size={12}
                        color={ttsVoiceGender === 'female' ? '#ffffff' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.voiceSegmentText,
                          ttsVoiceGender === 'female' && styles.voiceSegmentTextActive,
                        ]}
                      >
                        {intl.formatMessage({ id: 'settingsScreen.voiceFemale' })}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.voiceSegmentButton,
                        ttsVoiceGender === 'male' && styles.voiceSegmentButtonActive,
                      ]}
                      onPress={() => handleVoiceChange('male')}
                      activeOpacity={0.8}
                      testID="voice-gender-male-btn"
                    >
                      <FontAwesome5
                        name="male"
                        size={12}
                        color={ttsVoiceGender === 'male' ? '#ffffff' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.voiceSegmentText,
                          ttsVoiceGender === 'male' && styles.voiceSegmentTextActive,
                        ]}
                      >
                        {intl.formatMessage({ id: 'settingsScreen.voiceMale' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.separator} />

              {/* Answer Input Mode Selection */}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5 name="keyboard" size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.rowLabel}>
                    {intl.formatMessage({ id: 'quizSettingsModal.quizInputMode' })}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <View style={styles.voiceSegmentContainer}>
                    <TouchableOpacity
                      style={[
                        styles.voiceSegmentButton,
                        quizInputMode === 'choice' && styles.voiceSegmentButtonActive,
                      ]}
                      onPress={() => handleInputModeSelect('choice')}
                      activeOpacity={0.8}
                      testID="quiz-input-mode-choice-btn"
                    >
                      <FontAwesome5
                        name="th-large"
                        size={11}
                        color={quizInputMode === 'choice' ? '#ffffff' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.voiceSegmentText,
                          quizInputMode === 'choice' && styles.voiceSegmentTextActive,
                        ]}
                      >
                        {intl.formatMessage({ id: 'settingsScreen.quizInputModeChoice' })}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.voiceSegmentButton,
                        quizInputMode === 'type_in' && styles.voiceSegmentButtonActive,
                      ]}
                      onPress={() => handleInputModeSelect('type_in')}
                      activeOpacity={0.8}
                      testID="quiz-input-mode-type-in-btn"
                    >
                      <FontAwesome5
                        name="font"
                        size={11}
                        color={quizInputMode === 'type_in' ? '#ffffff' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.voiceSegmentText,
                          quizInputMode === 'type_in' && styles.voiceSegmentTextActive,
                        ]}
                      >
                        {intl.formatMessage({ id: 'settingsScreen.quizInputModeTypeIn' })}
                      </Text>
                      {!isPremium && (
                        <FontAwesome5
                          name="gem"
                          size={10}
                          color={colors.premiumDiamond}
                          style={styles.diamondIcon}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
