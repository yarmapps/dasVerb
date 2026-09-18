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
import { QuizExercise, ConjugationRowData } from '../../services/quizGeneratorService';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './ConjugationFillExercise.styles';

export interface ConjugationFillExerciseProps {
  exercise: QuizExercise;
  activeGapIndex: number;
  userAnswers: string[];
  status: 'idle' | 'correct' | 'incorrect';
  pulseAnim: Animated.Value;
  onSlotPress?: (gapIndex: number) => void;
}

export function ConjugationFillExercise({
  exercise,
  activeGapIndex,
  userAnswers,
  status,
  pulseAnim,
  onSlotPress,
}: ConjugationFillExerciseProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!exercise) {
    return <View />;
  }

  const rows: ConjugationRowData[] = exercise.conjugationRows || [];

  return (
    <View style={styles.container} testID="conjugation-fill-exercise">
      {rows.map(row => {
        const { pronoun, gapIndex, correctValue, reflexivePronoun } = row;
        const userAnswer = userAnswers[gapIndex] || '';
        const isActive = activeGapIndex === gapIndex && !userAnswer;
        const isCorrect = userAnswer === correctValue;

        let slotStyle: StyleProp<ViewStyle> = styles.gapSlot;
        let slotTextStyle: StyleProp<TextStyle> = styles.gapSlotText;

        if (status === 'correct') {
          slotStyle = [styles.gapSlot, styles.gapSlotCorrect];
          slotTextStyle = [styles.gapSlotText, styles.gapSlotTextCorrect];
        } else if (status === 'incorrect') {
          if (isCorrect) {
            slotStyle = [styles.gapSlot, styles.gapSlotCorrect];
            slotTextStyle = [styles.gapSlotText, styles.gapSlotTextCorrect];
          } else {
            slotStyle = [styles.gapSlot, styles.gapSlotIncorrect];
            slotTextStyle = [styles.gapSlotText, styles.gapSlotTextIncorrect];
          }
        } else if (userAnswer) {
          slotStyle = [styles.gapSlot, styles.gapSlotFilled];
        } else if (isActive) {
          slotStyle = [styles.gapSlot, styles.gapSlotActive];
        }

        const handlePress = () => {
          if (status === 'idle' && onSlotPress) {
            onSlotPress(gapIndex);
          }
        };

        return (
          <View key={`row_${gapIndex}`} style={styles.rowContainer}>
            <View style={styles.pronounContainer}>
              <Text
                style={[styles.pronounText, isActive && styles.pronounTextActive]}
                numberOfLines={1}
              >
                {pronoun}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.slotWrapper}
              activeOpacity={0.8}
              onPress={handlePress}
              disabled={status !== 'idle'}
              testID={`conjugation-slot-touch-${gapIndex}`}
            >
              <Animated.View
                style={[slotStyle, isActive && { transform: [{ scale: pulseAnim }] }]}
                testID={`conjugation-gap-slot-${gapIndex}`}
              >
                <Text style={slotTextStyle} numberOfLines={1}>
                  {userAnswer || (status === 'incorrect' ? '—' : '')}
                </Text>
              </Animated.View>
            </TouchableOpacity>

            {reflexivePronoun ? (
              <View style={styles.reflexiveContainer}>
                <Text style={styles.reflexiveText} numberOfLines={1}>
                  {reflexivePronoun}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
