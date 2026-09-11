import React, { useMemo } from 'react';
import { View, Text, Animated, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { QuizExercise } from '../../services/quizGeneratorService';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './PrefixDualSlotExercise.styles';

export interface PrefixDualSlotExerciseProps {
  exercise: QuizExercise;
  activeGapIndex: number;
  userAnswers: string[];
  status: 'idle' | 'correct' | 'incorrect';
  pulseAnim: Animated.Value;
}

export function PrefixDualSlotExercise({
  exercise,
  activeGapIndex,
  userAnswers,
  status,
  pulseAnim,
}: PrefixDualSlotExerciseProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const elements: React.JSX.Element[] = [];
  const renderedIndices = new Set<number>();

  exercise.segments?.forEach((segment, idx) => {
    if (renderedIndices.has(idx)) return;

    if (typeof segment.gapIndex === 'number') {
      const { gapIndex } = segment;
      const gap = exercise.gaps?.[gapIndex];
      if (!gap) return;
      const userAnswer = userAnswers[gapIndex];
      const isActive = activeGapIndex === gapIndex && !userAnswer;

      let slotStyle: StyleProp<ViewStyle> = styles.gapSlot;
      let slotTextStyle: StyleProp<TextStyle> = styles.gapSlotText;

      const isGapCorrect = Boolean(userAnswer && userAnswer === gap.correctValue);

      if (status === 'correct') {
        slotStyle = [styles.gapSlot, styles.gapSlotCorrect];
        slotTextStyle = [styles.gapSlotText, styles.gapSlotTextCorrect];
      } else if (status === 'incorrect' && userAnswer) {
        if (isGapCorrect) {
          slotStyle = [styles.gapSlot, styles.gapSlotCorrect];
          slotTextStyle = [styles.gapSlotText, styles.gapSlotTextCorrect];
        } else {
          slotStyle = [styles.gapSlot, styles.gapSlotIncorrect];
          slotTextStyle = [styles.gapSlotText, styles.gapSlotTextIncorrect];
        }
      } else if (userAnswer) {
        slotStyle = [styles.gapSlot, styles.gapSlotFilled];
        if (userAnswer === '—') {
          slotTextStyle = styles.gapSlotDashText;
        }
      } else if (isActive) {
        slotStyle = [styles.gapSlot, styles.gapSlotActive];
      }

      const candidateOptions =
        gap?.options && gap.options.length > 0 ? gap.options : [gap?.correctValue || ''];
      const maxOptionLength = Math.max(
        ...candidateOptions.map(option => (option ? option.length : 0)),
        gap?.correctValue?.length || 4,
        4,
      );
      const calculatedSlotMinWidth = Math.max(64, Math.ceil(maxOptionLength * 15 + 24));

      const trailingPunctuation: string[] = [];
      let peekIdx = idx + 1;
      while (
        peekIdx < exercise.segments.length &&
        typeof exercise.segments[peekIdx].gapIndex !== 'number' &&
        /^[.,!?:;]+$/.test(exercise.segments[peekIdx].text?.trim() || '')
      ) {
        trailingPunctuation.push(exercise.segments[peekIdx].text || '');
        renderedIndices.add(peekIdx);
        peekIdx++;
      }

      const slotElement = (
        <Animated.View
          key={gap?.id || `prefix_gap_${gapIndex}`}
          style={[
            slotStyle,
            { minWidth: calculatedSlotMinWidth },
            isActive && { transform: [{ scale: pulseAnim }] },
          ]}
          testID={`prefix-gap-slot-${gapIndex}`}
        >
          <Text style={slotTextStyle} numberOfLines={1}>
            {userAnswer || ''}
          </Text>
        </Animated.View>
      );

      if (trailingPunctuation.length > 0) {
        elements.push(
          <View key={`prefix_atomic_group_${idx}`} style={styles.atomicSlotGroup}>
            {slotElement}
            {trailingPunctuation.map((punct, pIdx) => (
              <Text key={`punct_${pIdx}`} style={styles.punctuationText}>
                {punct}
              </Text>
            ))}
          </View>,
        );
      } else {
        elements.push(slotElement);
      }
      return;
    }

    const isPunctuation = Boolean(segment.text && /^[.,!?:;]+$/.test(segment.text.trim()));

    elements.push(
      <Text key={idx} style={isPunctuation ? styles.punctuationText : styles.regularWord}>
        {segment.text}
      </Text>,
    );
  });

  return <View style={styles.sentenceRow}>{elements}</View>;
}
