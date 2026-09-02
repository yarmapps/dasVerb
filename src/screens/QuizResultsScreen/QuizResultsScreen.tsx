import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
    results = [],
  } = route.params || {};

  const [nextTarget, setNextTarget] = useState<PracticeNextTarget | null>(null);
  const [isNewStreakDay, setIsNewStreakDay] = useState(false);

  const correctCount = useMemo(() => results.filter(result => result.isCorrect).length, [results]);
  const defaultTotalCount = useMemo(() => {
    if (isSmartQuiz) return 50;
    if (isCheckpoint) return 10;
    return 6;
  }, [isSmartQuiz, isCheckpoint]);
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
    if (isSmartQuiz) return;
    let isMounted = true;
    getNextPracticeTarget({ infinitive, level, isCheckpoint, checkpointId }).then(target => {
      if (isMounted) {
        setNextTarget(target);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [infinitive, level, isCheckpoint, checkpointId, isSmartQuiz]);

  useEffect(() => {
    if (isSmartQuiz) return;
    if (isCheckpoint && checkpointId) {
      progressService.setCheckpointProgress(checkpointId, percentage);
    } else if (infinitive) {
      progressService.setVerbProgress(infinitive, percentage);
    }
  }, [infinitive, percentage, isCheckpoint, checkpointId, isSmartQuiz]);

  const handleTryAgain = () => {
    if (isSmartQuiz) {
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

  const handleGoToVerbsList = () => {
    navigation.navigate('MainTabs', {
      screen: 'Practice',
      params: { screen: 'VerbsPracticeList' },
    });
  };

  const handleGoToPractice = () => {
    navigation.navigate('MainTabs', {
      screen: 'Practice',
      params: { screen: 'PracticeHome' },
    });
  };

  const handleNextLevel = () => {
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
      } else {
        navigateToQuiz(
          {
            infinitive: nextTarget.infinitive,
            level: nextTarget.level,
          },
          'replace',
        );
      }
    } else {
      handleGoToVerbsList();
    }
  };

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
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={handleGoToPractice}
            testID="back-to-practice-button"
          >
            <Text style={styles.secondaryButtonText}>
              {intl.formatMessage({ id: 'quizResultsScreen.backToPractice' })}
            </Text>
          </TouchableOpacity>
        </>
      );
    }

    const isGoldOrSilver = status === 'trophy' || status === 'silver';

    if (isGoldOrSilver) {
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
      </>
    );
  };

  const renderReviewItem = ({
    item,
    index,
  }: {
    item: VerbQuizQuestionResult;
    index: number;
  }): React.JSX.Element => {
    const isLast = index === results.length - 1;
    const translationText = item.translation[languageCode] || item.translation.en || '';

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
    if (isCheckpoint) {
      return intl.formatMessage({ id: 'quizResultsScreen.checkpointResultsTitle' });
    }
    return intl.formatMessage({ id: 'quizResultsScreen.title' });
  }, [isSmartQuiz, isCheckpoint, intl]);

  const handleBack = () => {
    if (isSmartQuiz) {
      handleGoToPractice();
    } else {
      handleGoToVerbsList();
    }
  };

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
                data={results}
                keyExtractor={(_, index) => `result-${index}`}
                renderItem={renderReviewItem}
                showsVerticalScrollIndicator={false}
                style={styles.reviewList}
                contentContainerStyle={styles.reviewListContent}
              />
            </View>
          </View>
        )}

        {/* Action Buttons (Fixed at bottom) */}
        <View style={styles.bottomActions}>{renderActionButtons()}</View>
      </View>
      {dailyQuizLimitModalUI}
    </ScreenBackground>
  );
}
