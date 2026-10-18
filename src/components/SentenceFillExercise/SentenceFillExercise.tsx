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
import { QuizExercise } from '../../services/quizGeneratorService';
import { useAppTheme } from '../../context/ThemeContext';
import { isAnswerCorrect } from '../../utils/answerValidation';
import { AlignedSegment } from '../../utils/speechAlignment';
import { createStyles } from './SentenceFillExercise.styles';

export interface SentenceFillExerciseProps {
  exercise: QuizExercise;
  activeGapIndex: number;
  userAnswers: string[];
  status: 'idle' | 'correct' | 'incorrect';
  pulseAnim: Animated.Value;
  onSlotPress?: (gapIndex: number) => void;
  inputMode?: 'choice' | 'type_in';
  onTextChange?: (gapIndex: number, text: string) => void;
  onSubmitSlot?: (gapIndex: number) => void;
  alignedSegments?: AlignedSegment[];
}

export function SentenceFillExercise({
  exercise,
  activeGapIndex,
  userAnswers,
  status,
  pulseAnim,
  onSlotPress,
  inputMode = 'choice',
  onTextChange,
  onSubmitSlot,
  alignedSegments,
}: SentenceFillExerciseProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!exercise) {
    return <View />;
  }

  const elements: React.JSX.Element[] = [];
  const renderedIndices = new Set<number>();

  exercise.segments?.forEach((segment, idx) => {
    if (renderedIndices.has(idx)) return;

    if (typeof segment.gapIndex === 'number') {
      const { gapIndex } = segment;
      const gap = exercise.gaps?.[gapIndex];
      if (!gap) return;
      const userAnswer = userAnswers[gapIndex];
      const isInputMode = inputMode === 'type_in';
      const isActive = isInputMode
        ? activeGapIndex === gapIndex
        : activeGapIndex === gapIndex && !userAnswer;

      let slotStyle: StyleProp<ViewStyle> = styles.gapSlot;
      let slotTextStyle: StyleProp<TextStyle> = styles.gapSlotText;

      const isGapCorrect = Boolean(userAnswer && isAnswerCorrect(userAnswer, gap.correctValue));

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
        <TouchableOpacity
          key={gap?.id || `gap_${gapIndex}`}
          activeOpacity={0.8}
          onPress={() => {
            if (status === 'idle' && onSlotPress) {
              onSlotPress(gapIndex);
            }
          }}
          disabled={status !== 'idle'}
          testID={`gap-slot-touch-${gapIndex}`}
        >
          <Animated.View
            style={[
              slotStyle,
              { minWidth: calculatedSlotMinWidth },
              isActive && { transform: [{ scale: pulseAnim }] },
            ]}
            testID={`gap-slot-${gapIndex}`}
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
                returnKeyType={gapIndex === (exercise.gaps?.length || 1) - 1 ? 'done' : 'next'}
                testID={`gap-slot-input-${gapIndex}`}
              />
            ) : (
              <Text style={slotTextStyle} numberOfLines={1}>
                {userAnswer || ''}
              </Text>
            )}
          </Animated.View>
        </TouchableOpacity>
      );

      if (trailingPunctuation.length > 0) {
        elements.push(
          <View key={`atomic_group_${idx}`} style={styles.atomicSlotGroup}>
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

    const trimmedText = segment.text?.trim() || '';
    const isPunctuation = Boolean(trimmedText && /^[.,!?:;]+$/.test(trimmedText));
    const alignedSeg = alignedSegments?.find(s => s.segmentIndex === idx && !s.isGap);

    if (!isPunctuation && alignedSeg && (alignedSeg.matchedWordsCount || 0) > 0) {
      const words = trimmedText.split(/\s+/).filter(Boolean);
      if (words.length > 1) {
        words.forEach((word, wordIdx) => {
          const isWordMatched = wordIdx < (alignedSeg.matchedWordsCount || 0);
          elements.push(
            <Text
              key={`${idx}_${wordIdx}`}
              style={[styles.regularWord, isWordMatched && styles.regularWordMatched]}
            >
              {word}
            </Text>,
          );
        });
        return;
      }
    }

    const isSegmentMatched = Boolean(!isPunctuation && alignedSeg?.isMatched);

    elements.push(
      <Text
        key={idx}
        style={
          isPunctuation
            ? styles.punctuationText
            : [styles.regularWord, isSegmentMatched && styles.regularWordMatched]
        }
      >
        {trimmedText}
      </Text>,
    );
  });

  return <View style={styles.sentenceRow}>{elements}</View>;
}
