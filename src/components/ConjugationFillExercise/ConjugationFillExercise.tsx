import React, { useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  TextInput,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { QuizExercise, ConjugationRowData } from '../../services/quizGeneratorService';
import { useAppTheme } from '../../context/ThemeContext';
import { isAnswerCorrect } from '../../utils/answerValidation';
import { createStyles } from './ConjugationFillExercise.styles';

export interface ConjugationFillExerciseProps {
  exercise: QuizExercise;
  activeGapIndex: number;
  userAnswers: string[];
  status: 'idle' | 'correct' | 'incorrect';
  pulseAnim: Animated.Value;
  onSlotPress?: (gapIndex: number) => void;
  inputMode?: 'choice' | 'type_in';
  onTextChange?: (gapIndex: number, text: string) => void;
  onSubmitSlot?: (gapIndex: number) => void;
  matchedPronounIndices?: number[];
}

export function ConjugationFillExercise({
  exercise,
  activeGapIndex,
  userAnswers,
  status,
  pulseAnim,
  onSlotPress,
  inputMode = 'choice',
  onTextChange,
  onSubmitSlot,
  matchedPronounIndices,
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
        const isInputMode = inputMode === 'type_in';
        const isActive = isInputMode
          ? activeGapIndex === gapIndex
          : activeGapIndex === gapIndex && !userAnswer;
        const isCorrect = isAnswerCorrect(userAnswer, correctValue);
        const isPronounMatched = Boolean(matchedPronounIndices?.includes(gapIndex));

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
                style={[
                  styles.pronounText,
                  isActive && styles.pronounTextActive,
                  isPronounMatched && styles.pronounTextMatched,
                ]}
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
                {isInputMode && status === 'idle' && activeGapIndex === gapIndex ? (
                  <TextInput
                    style={[slotTextStyle, styles.gapInputText]}
                    value={userAnswer || ''}
                    onChangeText={text => onTextChange?.(gapIndex, text)}
                    onSubmitEditing={() => onSubmitSlot?.(gapIndex)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    autoFocus={true}
                    returnKeyType={gapIndex === (rows.length || 1) - 1 ? 'done' : 'next'}
                    testID={`conjugation-slot-input-${gapIndex}`}
                  />
                ) : (
                  <Text style={slotTextStyle} numberOfLines={1}>
                    {userAnswer || (status === 'incorrect' ? '—' : '')}
                  </Text>
                )}
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
