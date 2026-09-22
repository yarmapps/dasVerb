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
  ActivityIndicator,
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
import { ConjugationFillExercise } from '../../components/ConjugationFillExercise/ConjugationFillExercise';
import { ConjugationGrammarHint } from '../../components/ConjugationGrammarHint/ConjugationGrammarHint';
import { VerbFormsFillExercise } from '../../components/VerbFormsFillExercise/VerbFormsFillExercise';
import { VerbFormsGrammarHint } from '../../components/VerbFormsGrammarHint/VerbFormsGrammarHint';
import { PrepositionGrammarHint } from '../../components/PrepositionGrammarHint/PrepositionGrammarHint';
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
import { CEFRLevel, VerbCard } from '../../../docs/verb.types';
import { RootStackParamList, VerbQuizQuestionResult } from '../../types/navigation';
import { trackEvent } from '../../services/analyticsService';
import { createStyles } from './VerbQuizScreen.styles';

type VerbQuizRouteProp = RouteProp<RootStackParamList, 'VerbQuiz'>;
type VerbQuizNavProp = NativeStackNavigationProp<RootStackParamList, 'VerbQuiz'>;

const EMPTY_INFINITIVES: string[] = [];

export function resolveQuizType(
  isSmartQuiz?: boolean,
  isCheckpoint?: boolean,
  isCategoryQuiz?: boolean,
  isPrefixQuiz?: boolean,
  isConjugationQuiz?: boolean,
  isVerbFormsQuiz?: boolean,
  isPrepositionQuiz?: boolean,
):
  | 'smart'
  | 'checkpoint'
  | 'category'
  | 'prefix'
  | 'conjugation'
  | 'verb_forms'
  | 'prepositions'
  | 'verb' {
  if (isPrepositionQuiz) {
    return 'prepositions';
  }
  if (isVerbFormsQuiz) {
    return 'verb_forms';
  }
  if (isConjugationQuiz) {
    return 'conjugation';
  }
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
    conjugationLevelId,
    isConjugationQuiz = false,
    verbFormsLevelId,
    isVerbFormsQuiz = false,
    prepositionLevelId,
    isPrepositionQuiz = false,
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
      sentences: [],
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
        if (prepositionLevelId) {
          const levelData = await verbDataService.getPrepositionLevelById(prepositionLevelId);
          if (levelData && isMounted) {
            const cards = await Promise.all(
              levelData.verbs.map(async item => {
                const exact = await verbDataService.getVerbById(item.id);
                if (exact) return exact;
                const byInf = await verbDataService.getVerbsByInfinitive(item.infinitive);
                return byInf[0];
              }),
            );
            const validCards = cards.filter(Boolean) as VerbCard[];
            const generated = quizGeneratorService.generatePrepositionExercises(validCards);
            if (generated.length > 0 && isMounted) {
              setExercises(generated);
            }
          }
        } else if (verbFormsLevelId) {
          const levelData = await verbDataService.getVerbFormsLevelById(verbFormsLevelId);
          if (levelData && isMounted) {
            const cards = await Promise.all(
              levelData.verbs.map(async inf => {
                const exact = await verbDataService.getVerbById(inf);
                if (exact) return exact;
                const byInf = await verbDataService.getVerbsByInfinitive(inf);
                if (byInf.length > 0) return byInf[0];
                const normalizedInf = inf.replace(/^(sich|mich|dich)\s+/i, '').trim();
                const fallbackByInf = await verbDataService.getVerbsByInfinitive(normalizedInf);
                return fallbackByInf[0];
              }),
            );
            const validCards = cards.filter(Boolean) as VerbCard[];
            const isCheckpointOrFinal =
              levelData.subgroupType === 'checkpoint' || levelData.subgroupType === 'final_test';
            const generated = quizGeneratorService.generateVerbFormsExercises(
              validCards,
              isCheckpointOrFinal,
            );
            if (generated.length > 0 && isMounted) {
              setExercises(generated);
            }
          }
        } else if (conjugationLevelId) {
          const levelData = await verbDataService.getConjugationLevelById(conjugationLevelId);
          if (levelData && isMounted) {
            const cards = await Promise.all(
              levelData.verbs.map(async inf => {
                const exact = await verbDataService.getVerbById(inf);
                if (exact) return exact;
                const byInf = await verbDataService.getVerbsByInfinitive(inf);
                if (byInf.length > 0) return byInf[0];
                const normalizedInf = inf.replace(/^(sich|mich|dich)\s+/i, '').trim();
                const fallbackByInf = await verbDataService.getVerbsByInfinitive(normalizedInf);
                return fallbackByInf[0];
              }),
            );
            const validCards = cards.filter(Boolean) as VerbCard[];
            const generated = quizGeneratorService.generateConjugationExercises(validCards);
            if (generated.length > 0 && isMounted) {
              setExercises(generated);
            }
          }
        } else if (prefixLevelId) {
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
    conjugationLevelId,
    verbFormsLevelId,
    prepositionLevelId,
  ]);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [activeGapIndex, setActiveGapIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [speakOnCorrectAnswer, setSpeakOnCorrectAnswer] = useState(
    () => getSettings().speakOnCorrectAnswer,
  );

  const handleToggleSpeakOnCorrectAnswer = useCallback((value: boolean) => {
    setSpeakOnCorrectAnswer(value);
    updateSettings({ speakOnCorrectAnswer: value });
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
    const isPrefixQuiz = Boolean(prefixLevelId || isPrefixCheckpoint);
    const isConjugation = Boolean(conjugationLevelId || isConjugationQuiz);
    const quizType = resolveQuizType(
      isSmartQuiz,
      isCheckpoint,
      isCategoryQuiz,
      isPrefixQuiz,
      isConjugation,
      isVerbFormsQuiz,
    );
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
      const isConjugation = Boolean(conjugationLevelId || isConjugationQuiz);
      const quizType = resolveQuizType(
        isSmartQuiz,
        isCheckpoint,
        isCategoryQuiz,
        isPrefixQuiz,
        isConjugation,
        isVerbFormsQuiz,
        isPrepositionQuiz,
      );
      const results = resultsRef.current;
      const correctCount = results.filter(r => r.isCorrect).length;
      const totalAnswersCount = results.length || totalQuestions;
      const percentage =
        totalAnswersCount > 0 ? Math.round((correctCount / totalAnswersCount) * 100) : 0;
      trackEvent('quiz_completed', {
        quiz_type: quizType,
        infinitive,
        level,
        score: correctCount,
        total_questions: totalAnswersCount,
        percentage,
        is_passed: percentage >= 80,
      });

      let nextQuizParams: RootStackParamList['VerbQuiz'] | null = null;
      let returnRouteName:
        | 'PrefixPracticeList'
        | 'VerbsPracticeList'
        | 'PracticeHome'
        | 'ConjugationPracticeList'
        | 'VerbFormsPracticeList'
        | 'PrepositionsPracticeList' = 'VerbsPracticeList';

      if (prepositionLevelId || isPrepositionQuiz) {
        returnRouteName = 'PrepositionsPracticeList';
        if (prepositionLevelId) {
          const nextLevel = await verbDataService.getNextPrepositionLevel(prepositionLevelId);
          if (nextLevel) {
            nextQuizParams = {
              prepositionLevelId: nextLevel.id,
              isPrepositionQuiz: true,
              level: nextLevel.cefrLevel,
            };
          }
        }
      } else if (verbFormsLevelId || isVerbFormsQuiz) {
        returnRouteName = 'VerbFormsPracticeList';
        if (verbFormsLevelId) {
          const nextLevel = await verbDataService.getNextVerbFormsLevel(verbFormsLevelId);
          if (nextLevel) {
            nextQuizParams = {
              verbFormsLevelId: nextLevel.id,
              isVerbFormsQuiz: true,
              level: nextLevel.cefrLevel,
            };
          }
        }
      } else if (conjugationLevelId || isConjugationQuiz) {
        returnRouteName = 'ConjugationPracticeList';
        if (conjugationLevelId) {
          const nextLevel = await verbDataService.getNextConjugationLevel(conjugationLevelId);
          if (nextLevel) {
            nextQuizParams = {
              conjugationLevelId: nextLevel.id,
              isConjugationQuiz: true,
              level: nextLevel.cefrLevel,
            };
          }
        }
      } else if (prefixLevelId || isPrefixCheckpoint) {
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
        conjugationLevelId,
        isConjugationQuiz,
        verbFormsLevelId,
        isVerbFormsQuiz,
        prepositionLevelId,
        isPrepositionQuiz,
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
    conjugationLevelId,
    isConjugationQuiz,
    verbFormsLevelId,
    isVerbFormsQuiz,
    prepositionLevelId,
    isPrepositionQuiz,
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

      if (currentExercise.type === 'verb_forms_fill') {
        const nextUnfilledIndex = currentExercise.gaps.findIndex(
          (_, idx) => idx !== activeGapIndex && !nextAnswers[idx],
        );
        if (nextUnfilledIndex !== -1) {
          setActiveGapIndex(nextUnfilledIndex);
          return;
        }
      } else {
        const hasNextGap = activeGapIndex + 1 < currentExercise.gaps.length;
        if (hasNextGap) {
          setActiveGapIndex(prev => prev + 1);
          return;
        }
      }

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

      if (currentExercise.type === 'verb_forms_fill') {
        resultsRef.current.push({
          sentenceGerman: currentExercise.verbCard.infinitive,
          isCorrect: allCorrect,
          userAnswers: nextAnswers,
          correctAnswers: currentExercise.gaps.map(gap => gap.correctValue),
          translation: currentExercise?.translation || {},
        });
      } else if (currentExercise.type === 'conjugation_fill' && currentExercise.conjugationRows) {
        currentExercise.conjugationRows.forEach(row => {
          const userAnswer = nextAnswers[row.gapIndex] || '';
          const isSlotCorrect = userAnswer === row.correctValue;
          const reflexive = row.reflexivePronoun ? ` ${row.reflexivePronoun}` : '';
          const rowGerman = `${row.pronoun} ${row.correctValue}${reflexive}`;

          resultsRef.current.push({
            sentenceGerman: rowGerman,
            isCorrect: isSlotCorrect,
            userAnswers: [userAnswer],
            correctAnswers: [row.correctValue],
            translation: currentExercise?.translation || {},
          });
        });
      } else if (currentExercise.type === 'preposition_fill') {
        const ruleBadge = currentExercise.prepositionGrammarHint
          ? `${currentExercise.prepositionGrammarHint.preposition} + ${currentExercise.prepositionGrammarHint.prepositionCase}`
          : undefined;

        resultsRef.current.push({
          sentenceGerman: currentExercise.sentence.german,
          isCorrect: allCorrect,
          userAnswers: nextAnswers,
          correctAnswers: currentExercise.gaps.map(gap => gap.correctValue),
          translation: currentExercise?.translation || {},
          prepositionRuleBadge: ruleBadge,
        });
      } else {
        resultsRef.current.push({
          sentenceGerman,
          isCorrect: allCorrect,
          userAnswers: nextAnswers,
          correctAnswers: currentExercise.gaps.map(gap => gap.correctValue),
          translation: currentExercise?.translation || {},
        });
      }

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

        if (
          speakOnCorrectAnswer &&
          currentExercise?.type !== 'conjugation_fill' &&
          currentExercise?.type !== 'verb_forms_fill'
        ) {
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
    },
    [status, userAnswers, activeGapIndex, currentExercise, speakOnCorrectAnswer],
  );

  const renderGrammarHint = useCallback(() => {
    if (status !== 'incorrect') return null;

    if (currentExercise?.type === 'preposition_fill' && currentExercise.prepositionGrammarHint) {
      return <PrepositionGrammarHint hint={currentExercise.prepositionGrammarHint} embedded />;
    }

    if (currentExercise?.type === 'verb_forms_fill' && currentExercise.verbFormsGrammarHint) {
      return <VerbFormsGrammarHint hint={currentExercise.verbFormsGrammarHint} embedded />;
    }

    if (currentExercise?.type === 'conjugation_fill' && currentExercise.conjugationGrammarHint) {
      return <ConjugationGrammarHint hint={currentExercise.conjugationGrammarHint} embedded />;
    }

    if (currentExercise?.grammarHint && currentExercise?.type === 'prefix_dual_slot') {
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
    if (prepositionLevelId) {
      const match = prepositionLevelId.match(/preposition_([a-z0-9]+)_(level|checkpoint)_([0-9]+)/);
      if (match) {
        const [, , type, num] = match;
        if (type === 'checkpoint') {
          return intl.formatMessage(
            { id: 'prepositionsPracticeListScreen.checkpointTitle' },
            { number: num },
          );
        }
        return intl.formatMessage(
          { id: 'prepositionsPracticeListScreen.levelNumber' },
          { number: num },
        );
      }
      if (prepositionLevelId.includes('_final')) {
        return intl.formatMessage(
          { id: 'prepositionsPracticeListScreen.finalTestTitle' },
          { level: level || 'A1' },
        );
      }
      return intl.formatMessage({ id: 'prepositionsPracticeListScreen.title' });
    }
    if (verbFormsLevelId) {
      const match = verbFormsLevelId.match(/verb_forms_([a-z0-9]+)_(level|checkpoint)_([0-9]+)/);
      if (match) {
        const [, , type, num] = match;
        if (type === 'checkpoint') {
          return intl.formatMessage(
            { id: 'verbFormsPracticeListScreen.checkpointTitle' },
            { number: num },
          );
        }
        return intl.formatMessage(
          { id: 'verbFormsPracticeListScreen.levelNumber' },
          { number: num },
        );
      }
      if (verbFormsLevelId.includes('_final')) {
        return intl.formatMessage(
          { id: 'verbFormsPracticeListScreen.finalTestTitle' },
          { level: level || 'A1' },
        );
      }
      return intl.formatMessage({ id: 'verbFormsPracticeListScreen.title' });
    }
    if (conjugationLevelId) {
      const match = conjugationLevelId.match(/conjugation_([a-z0-9]+)_(level|checkpoint)_([0-9]+)/);
      if (match) {
        const [, , type, num] = match;
        if (type === 'checkpoint') {
          return intl.formatMessage(
            { id: 'conjugationPracticeListScreen.checkpointTitle' },
            { number: num },
          );
        }
        return intl.formatMessage(
          { id: 'conjugationPracticeListScreen.levelNumber' },
          { number: num },
        );
      }
      if (conjugationLevelId.includes('_final')) {
        return intl.formatMessage(
          { id: 'conjugationPracticeListScreen.finalTestTitle' },
          { level: level || 'A1' },
        );
      }
      return intl.formatMessage({ id: 'conjugationPracticeListScreen.title' });
    }
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
    verbFormsLevelId,
    conjugationLevelId,
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
    prepositionLevelId,
  ]);

  const cardHeaderTitle = useMemo(() => {
    if (currentExercise?.type === 'conjugation_fill') {
      return intl.formatMessage(
        { id: 'verbQuizScreen.conjugateVerbTitle' },
        { verb: currentExercise.verbCard?.infinitive || '' },
      );
    }
    if (currentExercise?.type === 'preposition_fill') {
      return intl.formatMessage({ id: 'verbQuizScreen.prepositionTaskTitle' });
    }
    return intl.formatMessage({ id: 'verbQuizScreen.fillCard' });
  }, [currentExercise, intl]);

  const renderExerciseContent = () => {
    if (currentExercise?.type === 'verb_forms_fill') {
      return (
        <VerbFormsFillExercise
          exercise={currentExercise}
          activeSlotIndex={activeGapIndex}
          userAnswers={userAnswers}
          status={status}
          pulseAnim={pulseAnim}
          onSlotPress={setActiveGapIndex}
        />
      );
    }
    if (currentExercise?.type === 'conjugation_fill') {
      return (
        <ConjugationFillExercise
          exercise={currentExercise}
          activeGapIndex={activeGapIndex}
          userAnswers={userAnswers}
          status={status}
          pulseAnim={pulseAnim}
          onSlotPress={setActiveGapIndex}
        />
      );
    }
    if (currentExercise?.type === 'prefix_dual_slot') {
      return (
        <PrefixDualSlotExercise
          exercise={currentExercise}
          activeGapIndex={activeGapIndex}
          userAnswers={userAnswers}
          status={status}
          pulseAnim={pulseAnim}
        />
      );
    }
    return (
      <SentenceFillExercise
        exercise={currentExercise}
        activeGapIndex={activeGapIndex}
        userAnswers={userAnswers}
        status={status}
        pulseAnim={pulseAnim}
      />
    );
  };

  const renderFeedbackCard = () => {
    if (status !== 'incorrect') return null;

    if (currentExercise?.type === 'verb_forms_fill') {
      const vFormsData = currentExercise.verbFormsData;
      return (
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
            <Text style={styles.correctAnswerWord}>{vFormsData?.infinitive} — </Text>
            <Text style={styles.correctAnswerHighlightText}>{vFormsData?.correctPraeteritum}</Text>
            <Text style={styles.correctAnswerWord}> — </Text>
            <Text style={styles.correctAnswerHighlightText}>{vFormsData?.correctAuxiliary}</Text>
            <Text style={styles.correctAnswerWord}> </Text>
            <Text style={styles.correctAnswerHighlightText}>{vFormsData?.correctPartizipII}</Text>
          </Text>
          {renderGrammarHint()}
        </View>
      );
    }

    if (currentExercise?.type === 'conjugation_fill') {
      const rows = currentExercise.conjugationRows || [];
      const singularRows = rows.slice(0, 3);
      const pluralRows = rows.slice(3, 6);

      const renderConjugationItem = (row: (typeof rows)[0], keyPrefix: string) => {
        const isRowIncorrect = userAnswers[row.gapIndex] !== row.correctValue;
        return (
          <View key={`${keyPrefix}_${row.gapIndex}`} style={styles.correctConjugationRow}>
            <Text style={styles.correctConjugationPronoun} numberOfLines={1}>
              {row.pronoun}
            </Text>
            <Text
              style={isRowIncorrect ? styles.correctAnswerHighlightText : styles.correctAnswerWord}
              numberOfLines={1}
            >
              {row.correctValue}
              {row.reflexivePronoun ? ` ${row.reflexivePronoun}` : ''}
            </Text>
          </View>
        );
      };

      return (
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
          <View style={styles.correctConjugationContainer}>
            <View style={styles.correctConjugationColumn}>
              {singularRows.map(row => renderConjugationItem(row, 'sing'))}
            </View>
            <View style={styles.correctConjugationColumn}>
              {pluralRows.map(row => renderConjugationItem(row, 'plur'))}
            </View>
          </View>
          {renderGrammarHint()}
        </View>
      );
    }

    return (
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
            const isPunct = Boolean(segment.text && /^[.,!?:;]+$/.test(segment.text.trim()));
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
    );
  };

  if (!currentExercise || exercises.length === 0) {
    return (
      <ScreenBackground>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ScreenHeader
          title={screenTitle}
          showBackButton
          onBackPress={() => navigation.goBack()}
          showStreak={false}
        />
        <View style={styles.loadingContainer} testID="quiz-loading-indicator">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header with Back Button and Progress Counter */}
      <ScreenHeader
        title={screenTitle}
        showBackButton
        onBackPress={() => {
          const isPrefixQuiz = Boolean(prefixLevelId || isPrefixCheckpoint);
          const isConjugation = Boolean(conjugationLevelId || isConjugationQuiz);
          const quizType = resolveQuizType(
            isSmartQuiz,
            isCheckpoint,
            isCategoryQuiz,
            isPrefixQuiz,
            isConjugation,
            isVerbFormsQuiz,
            isPrepositionQuiz,
          );
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
                <Text style={styles.sentenceCardLabel}>{cardHeaderTitle}</Text>
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

              {renderExerciseContent()}

              {/* Translation Container inside Card */}
              {currentExercise?.type !== 'verb_forms_fill' && (
                <View style={styles.sentenceTranslationContainer}>
                  <Ionicons name="language-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.sentenceTranslationText}>
                    {currentExercise?.translation?.[languageCode] ||
                      currentExercise?.translation?.en ||
                      ''}
                  </Text>
                </View>
              )}
            </View>

            {/* Unified Feedback Card shown on incorrect response */}
            {renderFeedbackCard()}
          </Pressable>
        </ScrollView>

        {/* Bottom Options 2x2 Grid - only visible while filling */}
        <View style={[styles.bottomSection, { paddingBottom: bottomPadding }]}>
          {status === 'idle' ? (
            <View style={styles.optionsGrid}>
              {currentGap?.options.map((option, optIdx) => {
                const isFifthOfFive = currentGap.options.length === 5 && optIdx === 4;
                return (
                  <TouchableOpacity
                    key={optIdx}
                    style={[styles.optionButton, isFifthOfFive && styles.optionButtonFullWidth]}
                    activeOpacity={0.8}
                    onPress={() => handleOptionPress(option)}
                    testID={`option-button-${option}`}
                  >
                    <Text style={styles.optionButtonText}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
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
      />
    </ScreenBackground>
  );
}
