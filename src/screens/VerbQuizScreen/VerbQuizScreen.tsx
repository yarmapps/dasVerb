import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useIntl } from 'react-intl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { ConjugationHintTable } from '../../components/ConjugationHintTable/ConjugationHintTable';
import { PrincipalPartsHintTable } from '../../components/PrincipalPartsHintTable/PrincipalPartsHintTable';
import { AuxiliaryHintCard } from '../../components/AuxiliaryHintCard/AuxiliaryHintCard';
import { SentenceFillExercise } from '../../components/SentenceFillExercise/SentenceFillExercise';
import { PrefixDualSlotExercise } from '../../components/PrefixDualSlotExercise/PrefixDualSlotExercise';
import { PrefixGrammarHint } from '../../components/PrefixGrammarHint/PrefixGrammarHint';
import { QuizSettingsModal } from '../../components/QuizSettingsModal/QuizSettingsModal';
import { verbDataService } from '../../services/verbDataService';
import { progressService } from '../../services/progressService';
import { soundService } from '../../services/soundService';
import { speechService } from '../../services/speechService';
import { getSettings, updateSettings } from '../../services/settingsService';
import {
  quizGeneratorService,
  QuizExercise,
  AUXILIARY_DISTRACTORS_MAP,
} from '../../services/quizGeneratorService';
import { CEFRLevel } from '../../../docs/verb.types';
import { RootStackParamList, VerbQuizQuestionResult } from '../../types/navigation';
import { trackEvent } from '../../services/analyticsService';
import { createStyles } from './VerbQuizScreen.styles';

type VerbQuizRouteProp = RouteProp<RootStackParamList, 'VerbQuiz'>;
type VerbQuizNavProp = NativeStackNavigationProp<RootStackParamList, 'VerbQuiz'>;

const EMPTY_INFINITIVES: string[] = [];

function resolveQuizType(
  isSmartQuiz: boolean,
  isCheckpoint: boolean,
  isCategoryQuiz?: boolean,
  isPrefixQuiz?: boolean,
): 'smart' | 'checkpoint' | 'category' | 'prefix' | 'verb' {
  if (isPrefixQuiz) {
    return 'prefix';
  }
  if (isSmartQuiz) {
    return 'smart';
  }
  if (isCheckpoint) {
    return 'checkpoint';
  }
  if (isCategoryQuiz) {
    return 'category';
  }
  return 'verb';
}

export function VerbQuizScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<VerbQuizNavProp>();
  const route = useRoute<VerbQuizRouteProp>();
  const { colors, isDark } = useAppTheme();
  const { locale } = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const bottomPadding = useMemo(() => {
    if (Platform.OS === 'android') {
      return Math.max(insets.bottom, 16) + 8;
    }
    return Math.max(insets.bottom, 16) + 8;
  }, [insets.bottom]);

  const languageCode = locale.split('-')[0];
  const {
    infinitive = 'anrufen',
    level = 'A1',
    isCheckpoint = false,
    checkpointId,
    checkpointNumber = 1,
    fromIndex = 1,
    toIndex = 10,
    isSmartQuiz = false,
    isCategoryQuiz = false,
    categoryId,
    categoryTitle,
    prefixLevelId,
    isPrefixCheckpoint = false,
    prefixCefrLevel,
  } = route.params || {};

  const infinitives = route.params?.infinitives || EMPTY_INFINITIVES;
  const infinitivesKey = infinitives.join(',');

  const [exercises, setExercises] = useState<QuizExercise[]>(() =>
    quizGeneratorService.generateExercisesForVerb({
      id: infinitive,
      infinitive,
      level: level as CEFRLevel,
      frequency_rank: 1,
      auxiliary: 'haben',
      morphology: {
        verb_class: 'weak',
        prefix_type: 'none',
        prefix: null,
        is_reflexive: false,
        reflexive_case: null,
      },
      principal_parts: {
        infinitive,
        present_3sg: infinitive,
        praeteritum_3sg: infinitive,
        partizip_2: infinitive,
      },
      conjugation: {
        present: {
          ich: `${infinitive.replace(/en$/, '')}e`,
          du: `${infinitive.replace(/en$/, '')}st`,
          er_sie_es: `${infinitive.replace(/en$/, '')}t`,
          wir: infinitive,
          ihr: `${infinitive.replace(/en$/, '')}t`,
          sie_Sie: infinitive,
          root_vowel_change: null,
        },
        praeteritum: {
          ich: `${infinitive.replace(/en$/, '')}te`,
          du: `${infinitive.replace(/en$/, '')}test`,
          er_sie_es: `${infinitive.replace(/en$/, '')}te`,
          wir: `${infinitive.replace(/en$/, '')}ten`,
          ihr: `${infinitive.replace(/en$/, '')}tet`,
          sie_Sie: `${infinitive.replace(/en$/, '')}ten`,
        },
        imperative: {
          du: `${infinitive.replace(/en$/, '')}!`,
          ihr: `${infinitive.replace(/en$/, '')}t!`,
          Sie: `${infinitive} Sie!`,
        },
      },
      rektion: {
        requires_object: false,
        direct_case: null,
        preposition: null,
        preposition_case: null,
      },
      sentences: [
        {
          id: 's1',
          tense: 'Präsens',
          german: `Ich ${infinitive.replace(/en$/, '')}e heute nach Hause`,
          translation: {
            ru: `Я тренирую глагол ${infinitive}`,
            en: `I practice the verb ${infinitive}`,
          },
          bracket_parts: [`${infinitive.replace(/en$/, '')}e`],
        },
      ],
      translation: {
        ru: infinitive,
        en: infinitive,
      },
    }),
  );

  useEffect(() => {
    let isMounted = true;

    async function loadQuizData() {
      try {
        if (prefixLevelId) {
          const levelData = await verbDataService.getPrefixLevelById(prefixLevelId);
          if (levelData && isMounted) {
            const pairs = await verbDataService.getSentencesByIds(levelData.exerciseSentenceIds);
            const generated = quizGeneratorService.generatePrefixExercises(pairs);
            if (generated.length > 0) {
              setExercises(generated);
            }
          }
        } else if (isPrefixCheckpoint && prefixCefrLevel) {
          const checkpointData = await verbDataService.getPrefixCheckpoint(prefixCefrLevel);
          if (checkpointData && isMounted) {
            const pairs = await verbDataService.getSentencesByIds(
              checkpointData.exerciseSentenceIds,
            );
            const generated = quizGeneratorService.generatePrefixExercises(pairs);
            if (generated.length > 0) {
              setExercises(generated);
            }
          }
        } else if (isSmartQuiz) {
          const allVerbs = await verbDataService.getVerbsOrderedByDifficulty();
          if (allVerbs.length > 0 && isMounted) {
            const generated = quizGeneratorService.generateSmartQuizExercises(allVerbs, 50);
            if (generated.length > 0) {
              setExercises(generated);
            }
          }
        } else if ((isCheckpoint || isCategoryQuiz) && infinitives.length > 0) {
          const allCardsNested = await Promise.all(
            infinitives.map(inf => verbDataService.getVerbsByInfinitive(inf)),
          );
          const flattenedCards = allCardsNested.flat();
          if (flattenedCards.length > 0 && isMounted) {
            const generated = quizGeneratorService.generateCheckpointExercises(flattenedCards);
            if (generated.length > 0) {
              setExercises(generated);
            }
          }
        } else {
          const verbCards = await verbDataService.getVerbsByInfinitive(infinitive);
          if (verbCards.length > 0 && isMounted) {
            const generated = quizGeneratorService.generateExercisesForVerb(
              verbCards[0],
              verbCards,
            );
            if (generated.length > 0) {
              setExercises(generated);
            }
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[VerbQuizScreen] Error loading verb from database:', error);
      }
    }

    loadQuizData();

    return () => {
      isMounted = false;
    };
  }, [
    infinitive,
    isCheckpoint,
    isCategoryQuiz,
    isSmartQuiz,
    infinitivesKey,
    infinitives,
    prefixLevelId,
    isPrefixCheckpoint,
    prefixCefrLevel,
  ]);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [activeGapIndex, setActiveGapIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [speakOnCorrectAnswer, setSpeakOnCorrectAnswer] = useState(
    () => getSettings().speakOnCorrectAnswer,
  );
  const [ttsVoiceGender, setTtsVoiceGender] = useState<'female' | 'male'>(
    () => getSettings().ttsVoiceGender,
  );

  const handleToggleSpeakOnCorrectAnswer = useCallback((value: boolean) => {
    setSpeakOnCorrectAnswer(value);
    updateSettings({ speakOnCorrectAnswer: value });
  }, []);

  const handleToggleTtsVoiceGender = useCallback(() => {
    setTtsVoiceGender(prev => {
      const next = prev === 'female' ? 'male' : 'female';
      updateSettings({ ttsVoiceGender: next });
      return next;
    });
  }, []);

  const currentExercise = exercises[currentExerciseIndex] || exercises[0];
  const totalQuestions = exercises.length;
  const currentGap = currentExercise?.gaps?.[activeGapIndex] || currentExercise?.gaps?.[0];

  // Анимация пульсации для активного слота
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (status === 'idle') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 650, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
        ]),
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      animation?.stop();
    };
  }, [status, pulseAnim, activeGapIndex]);

  useEffect(() => {
    const quizType = resolveQuizType(isSmartQuiz, isCheckpoint, isCategoryQuiz);
    trackEvent('quiz_started', {
      quiz_type: quizType,
      infinitive,
      level,
      total_questions: exercises.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resultsRef = useRef<VerbQuizQuestionResult[]>([]);
  const canAdvanceRef = useRef(true);
  const ttsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (ttsTimeoutRef.current) {
        clearTimeout(ttsTimeoutRef.current);
        ttsTimeoutRef.current = null;
      }
    };
  }, []);

  const goToNextQuestion = useCallback(async () => {
    if (ttsTimeoutRef.current) {
      clearTimeout(ttsTimeoutRef.current);
      ttsTimeoutRef.current = null;
    }
    speechService.stop();
    canAdvanceRef.current = true;
    if (currentExerciseIndex + 1 < totalQuestions) {
      setCurrentExerciseIndex(prev => prev + 1);
      setActiveGapIndex(0);
      setUserAnswers([]);
      setStatus('idle');
    } else {
      const isPrefixQuiz = Boolean(prefixLevelId || isPrefixCheckpoint);
      const quizType = resolveQuizType(isSmartQuiz, isCheckpoint, isCategoryQuiz, isPrefixQuiz);
      const results = resultsRef.current;
      const correctCount = results.filter(r => r.isCorrect).length;
      const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      trackEvent('quiz_completed', {
        quiz_type: quizType,
        infinitive,
        level,
        score: correctCount,
        total_questions: totalQuestions,
        percentage,
        is_passed: percentage >= 80,
      });

      let nextQuizParams: RootStackParamList['VerbQuiz'] | null = null;
      let returnRouteName: 'PrefixPracticeList' | 'VerbsPracticeList' | 'PracticeHome' =
        'VerbsPracticeList';

      if (prefixLevelId || isPrefixCheckpoint) {
        returnRouteName = 'PrefixPracticeList';
        const currentId =
          prefixLevelId || `prefix_checkpoint_${(prefixCefrLevel || 'a1').toLowerCase()}`;
        const nextLevel = await verbDataService.getNextPrefixLevel(currentId);
        if (nextLevel) {
          nextQuizParams = {
            prefixLevelId: nextLevel.id,
            isPrefixCheckpoint: nextLevel.subgroupType === 'checkpoint',
            prefixCefrLevel: nextLevel.cefrLevel,
          };
        }
      } else if (isSmartQuiz) {
        returnRouteName = 'PracticeHome';
      }

      navigation.replace('QuizResults', {
        infinitive,
        level,
        isCheckpoint,
        checkpointId,
        checkpointNumber,
        fromIndex,
        toIndex,
        isSmartQuiz,
        isCategoryQuiz,
        categoryId,
        categoryTitle,
        prefixLevelId,
        isPrefixCheckpoint,
        prefixCefrLevel,
        nextQuizParams,
        returnRouteName,
        results: resultsRef.current,
      });
    }
  }, [
    currentExerciseIndex,
    totalQuestions,
    navigation,
    infinitive,
    level,
    isCheckpoint,
    checkpointId,
    checkpointNumber,
    fromIndex,
    toIndex,
    isSmartQuiz,
    isCategoryQuiz,
    categoryId,
    categoryTitle,
    prefixLevelId,
    isPrefixCheckpoint,
    prefixCefrLevel,
  ]);

  const handleScreenPress = useCallback(() => {
    if (status !== 'idle' && canAdvanceRef.current) {
      goToNextQuestion();
    }
  }, [status, goToNextQuestion]);

  const handleOptionPress = useCallback(
    (option: string) => {
      if (status !== 'idle') return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      soundService.playTapSound();

      const nextAnswers = [...userAnswers];
      nextAnswers[activeGapIndex] = option;
      setUserAnswers(nextAnswers);

      const hasNextGap = activeGapIndex + 1 < currentExercise.gaps.length;

      if (hasNextGap) {
        setActiveGapIndex(prev => prev + 1);
      } else {
        // Проверяем все ответы
        const allCorrect = currentExercise.gaps.every(
          (gap, index) => gap.correctValue === nextAnswers[index],
        );

        const sentenceGerman = currentExercise.segments
          .map(seg => {
            if (typeof seg.gapIndex === 'number') {
              const answer = nextAnswers[seg.gapIndex];
              const fallback = currentExercise.gaps[seg.gapIndex]?.correctValue || '';
              return answer || fallback;
            }
            return seg.text || '';
          })
          .join(' ')
          .replace(/\s+([.,!?:;])/g, '$1')
          .replace(/\s*—\s*/g, ' ')
          .trim();

        resultsRef.current.push({
          sentenceGerman,
          isCorrect: allCorrect,
          userAnswers: nextAnswers,
          correctAnswers: currentExercise.gaps.map(gap => gap.correctValue),
          translation: currentExercise.translation,
        });

        const sentenceKey = `${currentExercise.verbCard.id || currentExercise.verbCard.infinitive}_${currentExercise.sentence.id}`;

        if (allCorrect) {
          progressService.recordSentenceSuccess(sentenceKey);
          setStatus('correct');
          if (process.env.NODE_ENV !== 'test') {
            canAdvanceRef.current = false;
            setTimeout(() => {
              canAdvanceRef.current = true;
            }, 350);
          }

          soundService.playCorrectSound();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          if (speakOnCorrectAnswer) {
            if (ttsTimeoutRef.current) {
              clearTimeout(ttsTimeoutRef.current);
            }
            const delay = process.env.NODE_ENV === 'test' ? 0 : 250;
            ttsTimeoutRef.current = setTimeout(() => {
              speechService.speak(sentenceGerman);
              ttsTimeoutRef.current = null;
            }, delay);
          }
        } else {
          progressService.recordSentenceError(sentenceKey);
          setStatus('incorrect');
          if (process.env.NODE_ENV !== 'test') {
            canAdvanceRef.current = false;
            setTimeout(() => {
              canAdvanceRef.current = true;
            }, 350);
          }

          soundService.playIncorrectSound();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    },
    [status, userAnswers, activeGapIndex, currentExercise, speakOnCorrectAnswer],
  );

  const renderGrammarHint = useCallback(() => {
    if (status !== 'incorrect') return null;

    if (currentExercise.grammarHint && currentExercise.type === 'prefix_dual_slot') {
      return <PrefixGrammarHint hint={currentExercise.grammarHint} embedded />;
    }

    const { tense, verbCard } = currentExercise;
    if (!verbCard) return null;

    // Find which gap(s) the user answered incorrectly
    const incorrectGapIndices = currentExercise.gaps
      .map((gap, idx) => (userAnswers[idx] !== gap.correctValue ? idx : -1))
      .filter(idx => idx !== -1);

    // Check if any incorrect gap is an auxiliary verb
    const isAuxiliaryError = incorrectGapIndices.some(idx => {
      const gap = currentExercise.gaps[idx];
      return gap && Boolean(AUXILIARY_DISTRACTORS_MAP[gap.correctValue.toLowerCase()]);
    });

    // Check if any incorrect gap is a participle / main verb form
    const isParticipleError = incorrectGapIndices.some(idx => {
      const gap = currentExercise.gaps[idx];
      return gap && !AUXILIARY_DISTRACTORS_MAP[gap.correctValue.toLowerCase()];
    });

    const correctAuxiliaryForm =
      currentExercise.gaps
        .map(gap => gap.correctValue)
        .find(val => val && Boolean(AUXILIARY_DISTRACTORS_MAP[val.toLowerCase()])) || '';

    if (tense === 'Präsens' && verbCard.conjugation?.present) {
      return <ConjugationHintTable conjugation={verbCard.conjugation.present} embedded />;
    }

    if (tense === 'Perfekt') {
      const showAux = isAuxiliaryError;
      const showParticiple = isParticipleError || !showAux;

      return (
        <View testID="perfekt-hints-container">
          {showAux && (
            <AuxiliaryHintCard
              infinitive={verbCard.infinitive}
              auxiliary={verbCard.auxiliary}
              correctForm={correctAuxiliaryForm}
              embedded
            />
          )}
          {showParticiple && verbCard.principal_parts && (
            <PrincipalPartsHintTable
              principalParts={verbCard.principal_parts}
              auxiliary={verbCard.auxiliary}
              conjugation={verbCard.conjugation}
              sentenceText={currentExercise.sentence?.german}
              embedded
            />
          )}
        </View>
      );
    }

    if (tense === 'Präteritum' && verbCard.principal_parts) {
      return (
        <PrincipalPartsHintTable
          principalParts={verbCard.principal_parts}
          auxiliary={verbCard.auxiliary}
          conjugation={verbCard.conjugation}
          sentenceText={currentExercise.sentence?.german}
          embedded
        />
      );
    }

    return null;
  }, [status, currentExercise, userAnswers]);

  const animatedProgress = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const targetPercent =
      totalQuestions > 0 ? ((currentExerciseIndex + 1) / totalQuestions) * 100 : 0;
    Animated.timing(animatedProgress, {
      toValue: targetPercent,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [currentExerciseIndex, totalQuestions, animatedProgress]);

  const animatedProgressWidth = useMemo(
    () =>
      animatedProgress.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
      }),
    [animatedProgress],
  );

  const screenTitle = useMemo(() => {
    if (prefixLevelId) {
      const match = prefixLevelId.match(/prefix_([a-z0-9]+)_([a-z]+)_([0-9]+)/);
      if (match) {
        const [, , , num] = match;
        return intl.formatMessage({ id: 'prefixPractice.levelTitle' }, { number: num });
      }
      return intl.formatMessage({ id: 'prefixPractice.title' });
    }
    if (isPrefixCheckpoint) {
      return intl.formatMessage(
        { id: 'prefixPractice.checkpointTitle' },
        { level: prefixCefrLevel || level },
      );
    }
    if (isSmartQuiz) {
      return intl.formatMessage({ id: 'verbQuizScreen.smartQuizTitle' });
    }
    if (isCheckpoint) {
      if (categoryId) {
        return intl.formatMessage({ id: 'verbsPracticeListScreen.finalTestTitle' });
      }
      return intl.formatMessage({ id: 'verbQuizScreen.checkpointQuizTitle' });
    }
    if (isCategoryQuiz && categoryTitle) {
      return categoryTitle;
    }
    return intl.formatMessage({ id: 'verbQuizScreen.title' });
  }, [
    prefixLevelId,
    isPrefixCheckpoint,
    prefixCefrLevel,
    isSmartQuiz,
    isCheckpoint,
    isCategoryQuiz,
    categoryId,
    categoryTitle,
    level,
    intl,
  ]);

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header with Back Button and Progress Counter */}
      <ScreenHeader
        title={screenTitle}
        showBackButton
        onBackPress={() => {
          const isPrefixQuiz = Boolean(prefixLevelId || isPrefixCheckpoint);
          const quizType = resolveQuizType(isSmartQuiz, isCheckpoint, isCategoryQuiz, isPrefixQuiz);
          trackEvent('quiz_interrupted', {
            quiz_type: quizType,
            infinitive,
            questions_answered: currentExerciseIndex,
            total_questions: totalQuestions,
          });
          navigation.goBack();
        }}
        showStreak={false}
        rightContent={
          <Text style={styles.headerRightText} testID="quiz-progress-counter">
            {currentExerciseIndex + 1}/{totalQuestions}
          </Text>
        }
      />

      {/* Linear Gradient Progress Bar with Smooth Animation */}
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFillContainer, { width: animatedProgressWidth }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary || '#7c4dff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressFill}
          />
        </Animated.View>
      </View>

      <Pressable style={styles.content} onPress={handleScreenPress} testID="quiz-content-pressable">
        {/* Scrollable Central Content */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={styles.topSection} onPress={handleScreenPress}>
            {/* Sentence Card Block */}
            <View style={styles.sentenceCard} testID="quiz-sentence-card">
              <View style={styles.cardHeader}>
                <Text style={styles.sentenceCardLabel}>
                  {intl.formatMessage({ id: 'verbQuizScreen.fillCard' })}
                </Text>
                <TouchableOpacity
                  style={styles.cardSettingsButton}
                  onPress={() => setIsSettingsModalVisible(true)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  testID="quiz-settings-button"
                >
                  <FontAwesome5 name="cog" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {currentExercise.type === 'prefix_dual_slot' ? (
                <PrefixDualSlotExercise
                  exercise={currentExercise}
                  activeGapIndex={activeGapIndex}
                  userAnswers={userAnswers}
                  status={status}
                  pulseAnim={pulseAnim}
                />
              ) : (
                <SentenceFillExercise
                  exercise={currentExercise}
                  activeGapIndex={activeGapIndex}
                  userAnswers={userAnswers}
                  status={status}
                  pulseAnim={pulseAnim}
                />
              )}

              {/* Translation Container inside Card */}
              <View style={styles.sentenceTranslationContainer}>
                <Ionicons name="language-outline" size={16} color={colors.textMuted} />
                <Text style={styles.sentenceTranslationText}>
                  {currentExercise.translation[languageCode] ||
                    currentExercise.translation.en ||
                    ''}
                </Text>
              </View>
            </View>

            {/* Unified Feedback Card shown on incorrect response */}
            {status === 'incorrect' && (
              <View style={styles.correctAnswerCard} testID="quiz-correct-answer-card">
                <View style={styles.correctAnswerHeader}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.primary}
                    style={styles.correctAnswerHeaderIcon}
                  />
                  <Text style={styles.correctAnswerLabel}>
                    {intl.formatMessage({ id: 'verbQuizScreen.correctAnswer' })}
                  </Text>
                </View>
                <Text style={styles.correctAnswerSentenceText}>
                  {currentExercise.segments.map((segment, idx) => {
                    if (typeof segment.gapIndex === 'number') {
                      const correctVal = currentExercise.gaps[segment.gapIndex]?.correctValue || '';
                      if (correctVal === '—') return null;
                      const prefixSpace = idx > 0 ? ' ' : '';
                      return (
                        <Text key={`corr_${idx}`} style={styles.correctAnswerHighlightText}>
                          {prefixSpace}
                          {correctVal}
                        </Text>
                      );
                    }
                    const isPunct = Boolean(
                      segment.text && /^[.,!?:;]+$/.test(segment.text.trim()),
                    );
                    const prefixSpace = idx > 0 && !isPunct ? ' ' : '';
                    return (
                      <Text key={`corr_${idx}`} style={styles.correctAnswerWord}>
                        {prefixSpace}
                        {segment.text}
                      </Text>
                    );
                  })}
                </Text>
                {renderGrammarHint()}
              </View>
            )}
          </Pressable>
        </ScrollView>

        {/* Bottom Options 2x2 Grid - only visible while filling */}
        <View style={[styles.bottomSection, { paddingBottom: bottomPadding }]}>
          {status === 'idle' ? (
            <View style={styles.optionsGrid}>
              {currentGap?.options.map((option, optIdx) => (
                <TouchableOpacity
                  key={optIdx}
                  style={styles.optionButton}
                  activeOpacity={0.8}
                  onPress={() => handleOptionPress(option)}
                  testID={`option-button-${option}`}
                >
                  <Text style={styles.optionButtonText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.tapToContinueContainer}>
              <MaterialIcons
                name="touch-app"
                size={20}
                color={colors.textMuted}
                style={styles.tapToContinueIcon}
              />
              <Text style={styles.tapToContinueText}>
                {intl.formatMessage({ id: 'verbQuizScreen.tapToContinue' })}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      <QuizSettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        speakOnCorrectAnswer={speakOnCorrectAnswer}
        onToggleSpeakOnCorrectAnswer={handleToggleSpeakOnCorrectAnswer}
        ttsVoiceGender={ttsVoiceGender}
        onToggleTtsVoiceGender={handleToggleTtsVoiceGender}
      />
    </ScreenBackground>
  );
}
