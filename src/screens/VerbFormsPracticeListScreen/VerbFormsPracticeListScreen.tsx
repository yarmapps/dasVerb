import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { RootStackParamList, PracticeStackParamList } from '../../types/navigation';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { verbDataService, VerbFormsLevelData } from '../../services/verbDataService';
import { progressService, VerbProgress } from '../../services/progressService';
import { useNavigateToQuiz } from '../../hooks/useNavigateToQuiz';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { soundService } from '../../services/soundService';
import { PracticeCheckpointCard } from '../../components/PracticeCheckpointCard/PracticeCheckpointCard';
import { createStyles } from './VerbFormsPracticeListScreen.styles';

type NavigationProp = NativeStackNavigationProp<PracticeStackParamList & RootStackParamList>;

const CEFR_TABS = ['A1', 'A2', 'B1', 'B2'] as const;
type CefrTab = (typeof CEFR_TABS)[number];

export function VerbFormsPracticeListScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isPremium = usePremiumStatus();
  const { navigateToQuiz, openPaywall, dailyQuizLimitModalUI } = useNavigateToQuiz(navigation);

  const [activeCefr, setActiveCefr] = useState<CefrTab>('A1');
  const [levels, setLevels] = useState<VerbFormsLevelData[]>([]);
  const [levelProgressMap, setLevelProgressMap] = useState<Record<string, VerbProgress>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const itemPositionsRef = useRef<Record<string, number>>({});

  const loadData = useCallback(
    async (targetCefr?: CefrTab) => {
      try {
        const levelToLoad = targetCefr || activeCefr;
        const loadedLevels = await verbDataService.getVerbFormsLevelsByCefr(levelToLoad);
        setLevels(loadedLevels);

        const progressMap: Record<string, VerbProgress> = {};
        loadedLevels.forEach(lvl => {
          progressMap[lvl.id] = progressService.getVerbFormsLevelProgress(lvl.id);
        });
        setLevelProgressMap(progressMap);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[VerbFormsPracticeListScreen] Failed to load verb forms levels:', error);
      }
    },
    [activeCefr],
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleTabChange = (tab: CefrTab) => {
    soundService.playTapSound();
    setActiveCefr(tab);
    itemPositionsRef.current = {};
    loadData(tab);
  };

  const isLocked = activeCefr !== 'A1' && !isPremium;

  const handleLevelPress = (level: VerbFormsLevelData) => {
    soundService.playTapSound();
    if (isLocked) {
      openPaywall('level_lock');
      return;
    }
    navigateToQuiz({
      verbFormsLevelId: level.id,
      isVerbFormsQuiz: true,
      level: activeCefr,
    });
  };

  const furthestCompletedLevelId = useMemo(() => {
    let lastCompletedIndex = -1;
    levels.forEach((lvl, index) => {
      const progress = levelProgressMap[lvl.id];
      if (progress && progress.status !== 'uncompleted') {
        lastCompletedIndex = index;
      }
    });

    if (lastCompletedIndex >= 0 && lastCompletedIndex < levels.length - 1) {
      return levels[lastCompletedIndex + 1].id;
    }
    if (lastCompletedIndex >= 0) {
      return levels[lastCompletedIndex].id;
    }
    return null;
  }, [levels, levelProgressMap]);

  const scrollToTarget = useCallback(() => {
    if (!scrollViewRef.current) return;

    if (
      furthestCompletedLevelId &&
      typeof itemPositionsRef.current[furthestCompletedLevelId] === 'number'
    ) {
      const targetY = itemPositionsRef.current[furthestCompletedLevelId];
      scrollViewRef.current.scrollTo({
        y: Math.max(0, targetY - 120),
        animated: true,
      });
    } else {
      scrollViewRef.current.scrollTo({
        y: 0,
        animated: true,
      });
    }
  }, [furthestCompletedLevelId]);

  useEffect(() => {
    if (levels.length === 0) return;

    const timer = setTimeout(() => {
      scrollToTarget();
    }, 150);

    return () => clearTimeout(timer);
  }, [activeCefr, levels, scrollToTarget]);

  const renderStatusBadge = (status: VerbProgress['status'], index: number) => {
    if (isLocked) {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeUncompleted]}>
          <FontAwesome5 name="lock" size={14} color={colors.textMuted} />
        </View>
      );
    }

    if (status === 'trophy') {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeTrophy]}>
          <FontAwesome5 name="trophy" size={18} color="#EAB308" />
        </View>
      );
    }
    if (status === 'silver') {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeSilver]}>
          <FontAwesome5 name="medal" size={18} color="#94A3B8" />
        </View>
      );
    }
    if (status === 'bronze') {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeBronze]}>
          <FontAwesome5 name="medal" size={18} color="#CD7F32" />
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, styles.statusBadgeUncompleted]}>
        <Text style={styles.levelNumberText}>{index + 1}</Text>
      </View>
    );
  };

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={intl.formatMessage({ id: 'verbFormsPracticeListScreen.title' })}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showStreak={false}
      />

      {/* CEFR Level Tabs: A1, A2, B1, B2 */}
      <View style={styles.tabsContainer}>
        {CEFR_TABS.map(tab => {
          const isActive = tab === activeCefr;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              activeOpacity={0.7}
              onPress={() => handleTabChange(tab)}
              testID={`verb-forms-tab-${tab}`}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {levels.map((lvl, _index) => {
          if (!lvl) return null;
          const progress = levelProgressMap[lvl.id] || { score: 0, status: 'uncompleted' };

          if (lvl.subgroupType === 'checkpoint') {
            return (
              <View
                key={lvl.id}
                onLayout={e => {
                  itemPositionsRef.current[lvl.id] = e.nativeEvent.layout.y;
                }}
              >
                <PracticeCheckpointCard
                  title={intl.formatMessage(
                    { id: 'verbFormsPracticeListScreen.checkpointTitle' },
                    { number: lvl.levelNumber },
                  )}
                  subtitle={intl.formatMessage({
                    id: 'verbFormsPracticeListScreen.checkpointSubtitle',
                  })}
                  status={progress.status}
                  isFinal={false}
                  isLocked={isLocked}
                  onPress={() => handleLevelPress(lvl)}
                  testID={`verb-forms-checkpoint-${lvl.id}`}
                />
              </View>
            );
          }

          if (lvl.subgroupType === 'final_test') {
            return (
              <View
                key={lvl.id}
                onLayout={e => {
                  itemPositionsRef.current[lvl.id] = e.nativeEvent.layout.y;
                }}
              >
                <PracticeCheckpointCard
                  title={intl.formatMessage(
                    { id: 'verbFormsPracticeListScreen.finalTestTitle' },
                    { level: activeCefr },
                  )}
                  subtitle={intl.formatMessage({
                    id: 'verbFormsPracticeListScreen.finalTestSubtitle',
                  })}
                  status={progress.status}
                  isFinal={true}
                  isLocked={isLocked}
                  onPress={() => handleLevelPress(lvl)}
                  testID={`verb-forms-final-${activeCefr}`}
                />
              </View>
            );
          }

          const verbsString = Array.isArray(lvl.verbs) ? lvl.verbs.join(', ') : '';

          return (
            <TouchableOpacity
              key={lvl.id}
              style={styles.levelCard}
              activeOpacity={0.7}
              onPress={() => handleLevelPress(lvl)}
              onLayout={e => {
                itemPositionsRef.current[lvl.id] = e.nativeEvent.layout.y;
              }}
              testID={`verb-forms-level-${lvl.id}`}
            >
              {renderStatusBadge(progress.status, (lvl.levelNumber || 1) - 1)}
              <View style={styles.levelInfo}>
                <View style={styles.levelTitleRow}>
                  <Text style={styles.levelTitle}>
                    {intl.formatMessage(
                      { id: 'verbFormsPracticeListScreen.levelNumber' },
                      { number: lvl.levelNumber },
                    )}
                  </Text>
                </View>
                <Text style={styles.verbsText} numberOfLines={2}>
                  {verbsString}
                </Text>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color={colors.textMutedInverted} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {dailyQuizLimitModalUI}
    </ScreenBackground>
  );
}
