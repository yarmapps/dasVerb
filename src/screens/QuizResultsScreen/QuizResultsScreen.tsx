import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  BackHandler,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { RootStackParamList, VerbQuizQuestionResult } from '../../types/navigation';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { AnimatedRewardCircle } from '../../components/AnimatedRewardCircle/AnimatedRewardCircle';
import { progressService, calculateVerbStatus } from '../../services/progressService';
import { tryRequestReview } from '../../services/reviewService';
import { soundService } from '../../services/soundService';
import { incrementDailyCompletedQuizzes } from '../../services/usageService';
import { recordStreakActivity } from '../../services/streakService';
import { getNextPracticeTarget, PracticeNextTarget } from '../../services/practiceSequenceService';
import { useNavigateToQuiz } from '../../hooks/useNavigateToQuiz';
import { createStyles } from './QuizResultsScreen.styles';

type QuizResultsRouteProp = RouteProp<RootStackParamList, 'QuizResults'>;
type QuizResultsNavProp = NativeStackNavigationProp<RootStackParamList, 'QuizResults'>;

export function QuizResultsScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<QuizResultsNavProp>();
  const route = useRoute<QuizResultsRouteProp>();
  const { colors, isDark } = useAppTheme();
  const { locale } = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { navigateToQuiz, dailyQuizLimitModalUI } = useNavigateToQuiz(navigation);
  const insets = useSafeAreaInsets();

  const bottomPadding = useMemo(() => {
    if (Platform.OS === 'android') {
      return Math.max(insets.bottom, 20) + 16;
    }
    return Math.max(insets.bottom, 16) + 8;
  }, [insets.bottom]);

  const languageCode = locale.split('-')[0];
  const {
    infinitive = 'anrufen',
    level = 'A1',
    isCheckpoint = false,
    checkpointId,
    checkpointNumber,
    fromIndex,
    toIndex,
    isSmartQuiz = false,
    categoryId,
    prefixLevelId,
    isPrefixCheckpoint = false,
    prefixCefrLevel,
    conjugationLevelId,
    isConjugationQuiz = false,
    verbFormsLevelId,
    isVerbFormsQuiz = false,
    prepositionLevelId,
    isPrepositionQuiz = false,
    nextQuizParams,
    returnRouteName,
    results = [],
  } = route.params || {};

  const [nextTarget, setNextTarget] = useState<PracticeNextTarget | null>(null);
  const [isTargetChecked, setIsTargetChecked] = useState(false);
  const [isNewStreakDay, setIsNewStreakDay] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const hasErrors = useMemo(() => results.some(result => !result.isCorrect), [results]);
  const displayedResults = useMemo(() => {
    if (!hasErrors || showAllAnswers) {
      return results;
    }
    return results.filter(result => !result.isCorrect);
  }, [results, hasErrors, showAllAnswers]);

  const correctCount = useMemo(() => results.filter(result => result.isCorrect).length, [results]);
  const defaultTotalCount = useMemo(() => {
    if (isSmartQuiz) return 50;
    if (isCheckpoint || isPrefixCheckpoint) return 20;
    if (prepositionLevelId || isPrepositionQuiz) return 5;
    if (prefixLevelId || verbFormsLevelId || isVerbFormsQuiz) return 10;
    if (conjugationLevelId || isConjugationQuiz) return 30;
    return 6;
  }, [
    isSmartQuiz,
    isCheckpoint,
    isPrefixCheckpoint,
    prefixLevelId,
    conjugationLevelId,
    isConjugationQuiz,
    verbFormsLevelId,
    isVerbFormsQuiz,
    prepositionLevelId,
    isPrepositionQuiz,
  ]);
  const totalCount = results.length || defaultTotalCount;
  const percentage = Math.round((correctCount / totalCount) * 100);
  const status = calculateVerbStatus(percentage);

  useEffect(() => {
    soundService.playLevelFinishedSound();
    incrementDailyCompletedQuizzes();

    const streakResult = recordStreakActivity();
    if (streakResult.isNewDay) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsNewStreakDay(true);
    }
  }, []);

  useEffect(() => {
    if (
      isSmartQuiz ||
      prefixLevelId ||
      isPrefixCheckpoint ||
      conjugationLevelId ||
      isConjugationQuiz ||
      verbFormsLevelId ||
      isVerbFormsQuiz ||
      prepositionLevelId ||
      isPrepositionQuiz
    )
      return;
    let isMounted = true;
    getNextPracticeTarget({ infinitive, level, isCheckpoint, checkpointId }).then(target => {
      if (isMounted) {
        setNextTarget(target);
        setIsTargetChecked(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [
    infinitive,
    level,
    isCheckpoint,
    checkpointId,
    isSmartQuiz,
    prefixLevelId,
    isPrefixCheckpoint,
    conjugationLevelId,
    isConjugationQuiz,
    verbFormsLevelId,
    isVerbFormsQuiz,
    prepositionLevelId,
    isPrepositionQuiz,
  ]);

  useEffect(() => {
    if (isSmartQuiz) return;
    if (prepositionLevelId) {
      progressService.setPrepositionLevelProgress(prepositionLevelId, percentage);
    } else if (verbFormsLevelId) {
      progressService.setVerbFormsLevelProgress(verbFormsLevelId, percentage);
    } else if (conjugationLevelId) {
      progressService.setConjugationLevelProgress(conjugationLevelId, percentage);
    } else if (prefixLevelId) {
      progressService.setPrefixLevelProgress(prefixLevelId, percentage);
    } else if (isPrefixCheckpoint && (checkpointId || prefixCefrLevel)) {
      const id = checkpointId || `prefix_checkpoint_${(prefixCefrLevel || 'a1').toLowerCase()}`;
      progressService.setPrefixLevelProgress(id, percentage);
    } else if (isCheckpoint && checkpointId) {
      progressService.setCheckpointProgress(checkpointId, percentage);
    } else if (infinitive) {
      progressService.setVerbProgress(infinitive, percentage);
    }
  }, [
    infinitive,
    percentage,
    isCheckpoint,
    checkpointId,
    isSmartQuiz,
    prefixLevelId,
    isPrefixCheckpoint,
    prefixCefrLevel,
    conjugationLevelId,
    verbFormsLevelId,
    prepositionLevelId,
  ]);

  useEffect(() => {
    const verbStatus = calculateVerbStatus(percentage);
    tryRequestReview(verbStatus).catch(() => {});
  }, [percentage]);

  const handleTryAgain = () => {
    if (prepositionLevelId || isPrepositionQuiz) {
      navigateToQuiz(
        {
          prepositionLevelId,
          isPrepositionQuiz: true,
          level,
        },
        'replace',
      );
    } else if (verbFormsLevelId || isVerbFormsQuiz) {
      navigateToQuiz(
        {
          verbFormsLevelId,
          isVerbFormsQuiz: true,
          level,
        },
        'replace',
      );
    } else if (conjugationLevelId || isConjugationQuiz) {
      navigateToQuiz(
        {
          conjugationLevelId,
          isConjugationQuiz: true,
          level,
        },
        'replace',
      );
    } else if (prefixLevelId || isPrefixCheckpoint) {
      navigateToQuiz(
        {
          prefixLevelId,
          isPrefixCheckpoint,
          prefixCefrLevel,
        },
        'replace',
      );
    } else if (isSmartQuiz) {
      navigateToQuiz({ isSmartQuiz: true }, 'replace');
    } else if (isCheckpoint) {
      navigateToQuiz(
        {
          isCheckpoint: true,
          checkpointId,
          checkpointNumber,
          fromIndex,
          toIndex,
          level,
        },
        'replace',
      );
    } else {
      navigateToQuiz({ infinitive, level }, 'replace');
    }
  };

  const handleGoToList = useCallback(() => {
    if (returnRouteName === 'PrepositionsPracticeList') {
      if (navigation.canGoBack()) {
        navigation.popToTop();
      } else {
        navigation.navigate('MainTabs', {
          screen: 'Practice',
          params: { screen: 'PrepositionsPracticeList' },
        });
      }
      return;
    }
    if (returnRouteName === 'VerbFormsPracticeList') {
      if (navigation.canGoBack()) {
        navigation.popToTop();
      } else {
        navigation.navigate('MainTabs', {
          screen: 'Practice',
          params: { screen: 'VerbFormsPracticeList' },
        });
      }
      return;
    }
    if (returnRouteName === 'ConjugationPracticeList') {
      if (navigation.canGoBack()) {
        navigation.popToTop();
      } else {
        navigation.navigate('MainTabs', {
          screen: 'Practice',
          params: { screen: 'ConjugationPracticeList' },
        });
      }
      return;
    }
    if (returnRouteName === 'PrefixPracticeList') {
      if (navigation.canGoBack()) {
        navigation.popToTop();
      } else {
        navigation.navigate('MainTabs', {
          screen: 'Practice',
          params: { screen: 'PrefixPracticeList' },
        });
      }
      return;
    }
    if (navigation.canGoBack()) {
      navigation.popToTop();
    } else {
      navigation.navigate('MainTabs', {
        screen: 'Practice',
        params: { screen: 'VerbsPracticeList' },
      });
    }
  }, [navigation, returnRouteName]);

  const handleGoToPractice = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.popToTop();
    } else {
      navigation.navigate('MainTabs', {
        screen: 'Practice',
        params: { screen: 'PracticeHome' },
      });
    }
  }, [navigation]);

  const handleNextLevel = () => {
    if (nextQuizParams) {
      navigateToQuiz(nextQuizParams, 'replace');
      return;
    }
    if (nextTarget) {
      if (nextTarget.type === 'checkpoint') {
        navigateToQuiz(
          {
            isCheckpoint: true,
            checkpointId: nextTarget.checkpointId,
            checkpointNumber: nextTarget.checkpointNumber,
            fromIndex: nextTarget.fromIndex,
            toIndex: nextTarget.toIndex,
            level: nextTarget.level,
            infinitives: nextTarget.infinitives,
          },
          'replace',
        );
      } else if (nextTarget.type === 'verb') {
        navigateToQuiz(
          {
            infinitive: nextTarget.infinitive,
            level: nextTarget.level,
          },
          'replace',
        );
      }
    } else {
      handleGoToList();
    }
  };

  const hasNext = useMemo(() => {
    if (isSmartQuiz) return false;
    if (
      prefixLevelId ||
      isPrefixCheckpoint ||
      conjugationLevelId ||
      isConjugationQuiz ||
      verbFormsLevelId ||
      isVerbFormsQuiz ||
      prepositionLevelId ||
      isPrepositionQuiz
    ) {
      return Boolean(nextQuizParams);
    }
    if (nextQuizParams) return true;
    if (isTargetChecked) {
      return Boolean(nextTarget);
    }
    return true;
  }, [
    isSmartQuiz,
    prefixLevelId,
    isPrefixCheckpoint,
    conjugationLevelId,
    isConjugationQuiz,
    verbFormsLevelId,
    isVerbFormsQuiz,
    prepositionLevelId,
    isPrepositionQuiz,
    nextQuizParams,
    isTargetChecked,
    nextTarget,
  ]);

  const headlineMessage = useMemo(() => {
    if (percentage >= 100) {
      return intl.formatMessage({ id: 'quizResultsScreen.youDidIt' });
    }
    if (percentage >= 80) {
      return intl.formatMessage({ id: 'quizResultsScreen.closeToPerfection' });
    }
    if (percentage >= 60) {
      return intl.formatMessage({ id: 'quizResultsScreen.almostThere' });
    }
    return intl.formatMessage({ id: 'quizResultsScreen.canDoBetter' });
  }, [percentage, intl]);

  const renderActionButtons = () => {
    if (isSmartQuiz) {
      return (
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={handleTryAgain}
          testID="try-again-button"
        >
          <Text style={styles.primaryButtonText}>
            {intl.formatMessage({ id: 'quizResultsScreen.tryAgain' })}
          </Text>
        </TouchableOpacity>
      );
    }

    const isGoldOrSilver = status === 'trophy' || status === 'silver';

    if (isGoldOrSilver) {
      if (!hasNext) {
        return (
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleTryAgain}
            testID="try-again-button"
          >
            <Text style={styles.primaryButtonText}>
              {intl.formatMessage({ id: 'quizResultsScreen.tryAgain' })}
            </Text>
          </TouchableOpacity>
        );
      }

      return (
        <>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleNextLevel}
            testID="next-level-button"
          >
            <Text style={styles.primaryButtonText}>
              {intl.formatMessage({ id: 'quizResultsScreen.nextLevel' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={handleTryAgain}
            testID="try-again-button"
          >
            <Text style={styles.secondaryButtonText}>
              {intl.formatMessage({ id: 'quizResultsScreen.tryAgain' })}
            </Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={handleTryAgain}
          testID="try-again-button"
        >
          <Text style={styles.primaryButtonText}>
            {intl.formatMessage({ id: 'quizResultsScreen.tryAgain' })}
          </Text>
        </TouchableOpacity>
        {hasNext ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={handleNextLevel}
            testID="next-level-button"
          >
            <Text style={styles.secondaryButtonText}>
              {intl.formatMessage({ id: 'quizResultsScreen.nextLevel' })}
            </Text>
          </TouchableOpacity>
        ) : null}
      </>
    );
  };

  const isConjugation = Boolean(conjugationLevelId || isConjugationQuiz);
  const isVerbForms = Boolean(verbFormsLevelId || isVerbFormsQuiz);
  const isPreposition = Boolean(prepositionLevelId || isPrepositionQuiz);

  const renderReviewItem = ({
    item,
    index,
  }: {
    item: VerbQuizQuestionResult;
    index: number;
  }): React.JSX.Element => {
    const isLast = index === displayedResults.length - 1;
    const translationText = !isConjugation
      ? item?.translation?.[languageCode] || item?.translation?.en || ''
      : '';

    if (isPreposition) {
      const userAns = item.userAnswers?.[0] || '—';
      const correctAns = item.correctAnswers?.[0] || '';
      let beforeText = '';
      let actualCorrect = '';
      let afterText = '';
      if (correctAns) {
        const lowerSentence = item.sentenceGerman.toLowerCase();
        const lowerCorrect = correctAns.toLowerCase();
        const correctIndex = lowerSentence.indexOf(lowerCorrect);
        if (correctIndex !== -1) {
          beforeText = item.sentenceGerman.slice(0, correctIndex);
          actualCorrect = item.sentenceGerman.slice(correctIndex, correctIndex + correctAns.length);
          afterText = item.sentenceGerman.slice(correctIndex + correctAns.length);
        } else {
          beforeText = item.sentenceGerman;
        }
      } else {
        beforeText = item.sentenceGerman;
      }

      if (item.isCorrect) {
        return (
          <View
            style={[styles.reviewItem, isLast && styles.reviewItemLast]}
            testID={`result-item-${index}`}
          >
            <View style={styles.reviewIconContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <View style={styles.reviewContent}>
              <Text style={styles.reviewGermanText}>
                {beforeText}
                {actualCorrect ? (
                  <Text style={styles.correctAnswerBold}>{actualCorrect}</Text>
                ) : null}
                {afterText}
              </Text>
              {item.prepositionRuleBadge ? (
                <View style={styles.ruleBadge}>
                  <Text style={styles.ruleBadgeText}>{item.prepositionRuleBadge}</Text>
                </View>
              ) : null}
              {translationText ? (
                <Text style={styles.reviewTranslationText}>{translationText}</Text>
              ) : null}
            </View>
          </View>
        );
      }

      return (
        <View
          style={[styles.reviewItem, isLast && styles.reviewItemLast]}
          testID={`result-item-${index}`}
        >
          <View style={styles.reviewIconContainer}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
          </View>
          <View style={styles.reviewContent}>
            <Text style={styles.reviewGermanText}>
              {beforeText}
              <Text style={styles.wrongAnswerStrikethrough}>{userAns}</Text>{' '}
              <Text style={styles.correctAnswerBold}>{actualCorrect || correctAns}</Text>
              {afterText}
            </Text>
            {item.prepositionRuleBadge ? (
              <View style={styles.ruleBadge}>
                <Text style={styles.ruleBadgeText}>{item.prepositionRuleBadge}</Text>
              </View>
            ) : null}
            {translationText ? (
              <Text style={styles.reviewTranslationText}>{translationText}</Text>
            ) : null}
          </View>
        </View>
      );
    }

    if (isVerbForms) {
      if (item.isCorrect) {
        const praet = item.correctAnswers?.[0] || '';
        const aux = item.correctAnswers?.[1] || '';
        const part2 = item.correctAnswers?.[2] || '';
        const chain = `${item.sentenceGerman} — ${praet} — ${aux} ${part2}`;

        return (
          <View
            style={[styles.reviewItem, isLast && styles.reviewItemLast]}
            testID={`result-item-${index}`}
          >
            <View style={styles.reviewIconContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <View style={styles.reviewContent}>
              <Text style={styles.reviewGermanText}>{chain}</Text>
              {translationText ? (
                <Text style={styles.reviewTranslationText}>{translationText}</Text>
              ) : null}
            </View>
          </View>
        );
      }

      const userPraet = item.userAnswers?.[0] || '—';
      const userAux = item.userAnswers?.[1] || '';
      const userPart2 = item.userAnswers?.[2] || '—';

      const correctPraet = item.correctAnswers?.[0] || '';
      const correctAux = item.correctAnswers?.[1] || '';
      const correctPart2 = item.correctAnswers?.[2] || '';

      const isPraetCorrect = userPraet === correctPraet;
      const isAuxCorrect = userAux === correctAux;
      const isPart2Correct = userPart2 === correctPart2;
      const isPerfektCorrect = isAuxCorrect && isPart2Correct;

      const userPerfekt = userAux ? `${userAux} ${userPart2}` : userPart2;
      const correctPerfekt = `${correctAux} ${correctPart2}`;

      return (
        <View
          style={[styles.reviewItem, isLast && styles.reviewItemLast]}
          testID={`result-item-${index}`}
        >
          <View style={styles.reviewIconContainer}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
          </View>
          <View style={styles.reviewContent}>
            <Text style={styles.reviewGermanText}>
              {item.sentenceGerman}
              {' — '}
              {isPraetCorrect ? (
                correctPraet
              ) : (
                <>
                  <Text style={styles.wrongAnswerStrikethrough}>{userPraet}</Text>{' '}
                  <Text style={styles.correctAnswerBold}>{correctPraet}</Text>
                </>
              )}
              {' — '}
              {isPerfektCorrect ? (
                correctPerfekt
              ) : (
                <>
                  <Text style={styles.wrongAnswerStrikethrough}>{userPerfekt}</Text>{' '}
                  <Text style={styles.correctAnswerBold}>{correctPerfekt}</Text>
                </>
              )}
            </Text>
            {translationText ? (
              <Text style={styles.reviewTranslationText}>{translationText}</Text>
            ) : null}
          </View>
        </View>
      );
    }

    if (isConjugation) {
      if (item.isCorrect) {
        return (
          <View
            style={[styles.reviewItem, isLast && styles.reviewItemLast]}
            testID={`result-item-${index}`}
          >
            <View style={styles.reviewIconContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <View style={styles.reviewContent}>
              <Text style={styles.reviewGermanText}>{item.sentenceGerman}</Text>
            </View>
          </View>
        );
      }

      const userAns = item.userAnswers?.[0] || '—';
      const correctAns = item.correctAnswers?.[0] || '';
      let pronoun = '';
      let afterCorrect = '';
      if (correctAns && item.sentenceGerman.includes(correctAns)) {
        const correctIndex = item.sentenceGerman.indexOf(correctAns);
        pronoun = item.sentenceGerman.slice(0, correctIndex);
        afterCorrect = item.sentenceGerman.slice(correctIndex + correctAns.length);
      } else {
        const words = item.sentenceGerman.split(' ');
        pronoun = words.length > 1 ? `${words[0]} ` : '';
      }

      return (
        <View
          style={[styles.reviewItem, isLast && styles.reviewItemLast]}
          testID={`result-item-${index}`}
        >
          <View style={styles.reviewIconContainer}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
          </View>
          <View style={styles.reviewContent}>
            <Text style={styles.reviewGermanText}>
              {pronoun}
              <Text style={styles.wrongAnswerStrikethrough}>{userAns}</Text>{' '}
              <Text style={styles.correctAnswerText}>{correctAns || item.sentenceGerman}</Text>
              {afterCorrect}
            </Text>
          </View>
        </View>
      );
    }

    const userAns = item.userAnswers?.filter(Boolean).join(' / ') || '';
    const correctAns = item.correctAnswers?.filter(Boolean).join(' / ') || '';

    return (
      <View
        style={[styles.reviewItem, isLast && styles.reviewItemLast]}
        testID={`result-item-${index}`}
      >
        <View style={styles.reviewIconContainer}>
          <Ionicons
            name={item.isCorrect ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={item.isCorrect ? '#10B981' : '#EF4444'}
          />
        </View>
        <View style={styles.reviewContent}>
          <Text style={styles.reviewGermanText}>{item.sentenceGerman}</Text>
          {!item.isCorrect && (userAns || correctAns) ? (
            <View style={styles.correctionRow}>
              {userAns ? <Text style={styles.wrongAnswerStrikethrough}>{userAns}</Text> : null}
              {userAns && correctAns ? (
                <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
              ) : null}
              {correctAns ? <Text style={styles.correctAnswerText}>{correctAns}</Text> : null}
            </View>
          ) : null}
          {translationText ? (
            <Text style={styles.reviewTranslationText}>{translationText}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  const headerTitle = useMemo(() => {
    if (isSmartQuiz) {
      return intl.formatMessage({ id: 'quizResultsScreen.smartQuizResultsTitle' });
    }
    if (isCheckpoint || isPrefixCheckpoint) {
      if (categoryId) {
        return intl.formatMessage({ id: 'verbsPracticeListScreen.finalTestTitle' });
      }
      return intl.formatMessage({ id: 'quizResultsScreen.checkpointResultsTitle' });
    }
    return intl.formatMessage({ id: 'quizResultsScreen.title' });
  }, [isSmartQuiz, isCheckpoint, isPrefixCheckpoint, categoryId, intl]);

  const handleBack = useCallback(() => {
    if (isSmartQuiz) {
      handleGoToPractice();
    } else {
      handleGoToList();
    }
  }, [isSmartQuiz, handleGoToPractice, handleGoToList]);

  useFocusEffect(
    useCallback(() => {
      const onHardwareBack = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
      return () => subscription.remove();
    }, [handleBack]),
  );

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScreenHeader
        title={headerTitle}
        showBackButton
        onBackPress={handleBack}
        animateStreak={isNewStreakDay}
      />

      <View style={styles.mainContent}>
        {/* Top Hero Reward Section (Fixed at top) */}
        <View style={styles.heroSection}>
          <AnimatedRewardCircle status={status} size={92} />
          <Text style={styles.headline}>{headlineMessage}</Text>
          <Text style={styles.scoreText}>
            {intl.formatMessage(
              { id: 'quizResultsScreen.scoreSummary' },
              { correct: correctCount, total: totalCount },
            )}
          </Text>
        </View>

        {/* Sentences Review Section (Takes remaining height, scrolls if needed) */}
        {results.length > 0 && (
          <View style={styles.reviewSection}>
            <View style={styles.reviewCard}>
              <FlatList
                data={displayedResults}
                keyExtractor={(_, index) => `result-${index}`}
                renderItem={renderReviewItem}
                showsVerticalScrollIndicator={false}
                style={styles.reviewList}
                contentContainerStyle={styles.reviewListContent}
              />
            </View>
            {hasErrors && (
              <View style={styles.toggleRowContainer}>
                <Text style={styles.toggleRowLabel}>
                  {intl.formatMessage({ id: 'quizResultsScreen.showCorrectAnswers' })}
                </Text>
                <Switch
                  value={showAllAnswers}
                  onValueChange={setShowAllAnswers}
                  trackColor={{ false: colors.blockBorder, true: colors.primary }}
                  thumbColor="#ffffff"
                  testID="toggle-answers-switch"
                />
              </View>
            )}
          </View>
        )}

        {/* Action Buttons (Fixed at bottom) */}
        <View style={[styles.bottomActions, { paddingBottom: bottomPadding }]}>
          {renderActionButtons()}
        </View>
      </View>
      {dailyQuizLimitModalUI}
    </ScreenBackground>
  );
}
