import React, { useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useIntl } from 'react-intl';
import { QuizExercise } from '../../services/quizGeneratorService';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './VerbFormsFillExercise.styles';

export interface VerbFormsFillExerciseProps {
  exercise: QuizExercise;
  activeSlotIndex: number;
  userAnswers: string[];
  status: 'idle' | 'correct' | 'incorrect';
  pulseAnim: Animated.Value;
  onSlotPress?: (slotIndex: number) => void;
}

export function VerbFormsFillExercise({
  exercise,
  activeSlotIndex,
  userAnswers,
  status,
  pulseAnim,
  onSlotPress,
}: VerbFormsFillExerciseProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!exercise || !exercise.verbFormsData) {
    return <View />;
  }

  const { verbFormsData } = exercise;
  const { infinitive, correctPraeteritum, correctAuxiliary, correctPartizipII } = verbFormsData;

  const getSlotStyles = (slotIndex: number, correctAnswer: string) => {
    const userAnswer = userAnswers[slotIndex] || '';
    const isActive = activeSlotIndex === slotIndex && !userAnswer;
    const isCorrect = userAnswer === correctAnswer;

    let slotStyle: StyleProp<ViewStyle> = styles.slot;
    let slotTextStyle: StyleProp<TextStyle> = styles.slotText;

    if (status === 'correct') {
      slotStyle = [styles.slot, styles.slotCorrect];
      slotTextStyle = [styles.slotText, styles.slotTextCorrect];
    } else if (status === 'incorrect') {
      if (isCorrect) {
        slotStyle = [styles.slot, styles.slotCorrect];
        slotTextStyle = [styles.slotText, styles.slotTextCorrect];
      } else {
        slotStyle = [styles.slot, styles.slotIncorrect];
        slotTextStyle = [styles.slotText, styles.slotTextIncorrect];
      }
    } else if (userAnswer) {
      slotStyle = [styles.slot, styles.slotFilled];
    } else if (isActive) {
      slotStyle = [styles.slot, styles.slotActive];
    }

    return { slotStyle, slotTextStyle, isActive, isCorrect, userAnswer };
  };

  const praetSlot = getSlotStyles(0, correctPraeteritum);
  const auxSlot = getSlotStyles(1, correctAuxiliary);
  const partizipSlot = getSlotStyles(2, correctPartizipII);

  const handleSlotPress = (slotIndex: number) => {
    if (status === 'idle' && onSlotPress) {
      onSlotPress(slotIndex);
    }
  };

  return (
    <View style={styles.container} testID="verb-forms-fill-exercise">
      {/* Verb Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.infinitiveText}>{infinitive}</Text>
      </View>

      {/* Slots Form Container */}
      <View style={styles.formContainer}>
        {/* Präteritum Block */}
        <View style={styles.formBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.labelText}>
              {intl.formatMessage({ id: 'verbFormsExercise.praeteritum' })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.slotWrapper}
            activeOpacity={0.8}
            onPress={() => handleSlotPress(0)}
            disabled={status !== 'idle'}
            testID="praeteritum-slot-touch"
          >
            <Animated.View
              style={[
                praetSlot.slotStyle,
                praetSlot.isActive && { transform: [{ scale: pulseAnim }] },
              ]}
              testID="praeteritum-gap-slot"
            >
              <Text style={praetSlot.slotTextStyle} numberOfLines={1}>
                {praetSlot.userAnswer || ''}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Perfekt Block */}
        <View style={[styles.formBlock, styles.formBlockLast]}>
          <View style={styles.labelRow}>
            <Text style={styles.labelText}>
              {intl.formatMessage({ id: 'verbFormsExercise.perfekt' })}
            </Text>
          </View>
          <View style={styles.perfektRow}>
            {/* Auxiliary Slot */}
            <View style={styles.auxSlotWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSlotPress(1)}
                disabled={status !== 'idle'}
                testID="aux-slot-touch"
              >
                <Animated.View
                  style={[
                    auxSlot.slotStyle,
                    auxSlot.isActive && { transform: [{ scale: pulseAnim }] },
                  ]}
                  testID="aux-gap-slot"
                >
                  <Text style={auxSlot.slotTextStyle} numberOfLines={1}>
                    {auxSlot.userAnswer || ''}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Partizip II Slot */}
            <View style={styles.partizipSlotWrapper}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSlotPress(2)}
                disabled={status !== 'idle'}
                testID="partizip-slot-touch"
              >
                <Animated.View
                  style={[
                    partizipSlot.slotStyle,
                    partizipSlot.isActive && { transform: [{ scale: pulseAnim }] },
                  ]}
                  testID="partizip-gap-slot"
                >
                  <Text style={partizipSlot.slotTextStyle} numberOfLines={1}>
                    {partizipSlot.userAnswer || ''}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
