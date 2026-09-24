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
import { verbDataService, PrefixLevelData } from '../../services/verbDataService';
import { progressService, VerbProgress } from '../../services/progressService';
import { useNavigateToQuiz } from '../../hooks/useNavigateToQuiz';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { soundService } from '../../services/soundService';
import { PracticeCheckpointCard } from '../../components/PracticeCheckpointCard/PracticeCheckpointCard';
import { createStyles } from './PrefixPracticeListScreen.styles';

type NavigationProp = NativeStackNavigationProp<PracticeStackParamList & RootStackParamList>;

const CEFR_TABS = ['A1', 'A2', 'B1', 'B2'] as const;
type CefrTab = (typeof CEFR_TABS)[number];

export function PrefixPracticeListScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isPremium = usePremiumStatus();
  const { navigateToQuiz, openPaywall, dailyQuizLimitModalUI } = useNavigateToQuiz(navigation);

  const [activeCefr, setActiveCefr] = useState<CefrTab>('A1');
  const [levels, setLevels] = useState<PrefixLevelData[]>([]);
  const [checkpoint, setCheckpoint] = useState<PrefixLevelData | null>(null);
  const [levelProgressMap, setLevelProgressMap] = useState<Record<string, VerbProgress>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const itemPositionsRef = useRef<Record<string, number>>({});

  const loadData = useCallback(
    async (targetCefr?: CefrTab) => {
      try {
        const levelToLoad = targetCefr || activeCefr;
        const loadedLevels = await verbDataService.getPrefixLevelsByCefr(levelToLoad);
        const standardLevels = loadedLevels.filter(lvl => lvl.subgroupType !== 'checkpoint');
        const cp = loadedLevels.find(lvl => lvl.subgroupType === 'checkpoint') || null;

        setLevels(standardLevels);
        setCheckpoint(cp);

        const progressMap: Record<string, VerbProgress> = {};
        standardLevels.forEach(lvl => {
          progressMap[lvl.id] = progressService.getPrefixLevelProgress(lvl.id);
        });
        if (cp) {
          progressMap[cp.id] = progressService.getPrefixLevelProgress(cp.id);
        }
        setLevelProgressMap(progressMap);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[PrefixPracticeListScreen] Failed to load prefix levels:', error);
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

  const handleLevelPress = (level: PrefixLevelData) => {
    soundService.playTapSound();
    if (isLocked) {
      openPaywall('level_lock');
      return;
    }
    navigateToQuiz({
      prefixLevelId: level.id,
      prefixCefrLevel: activeCefr,
    });
  };

  const handleCheckpointPress = () => {
    if (!checkpoint) return;
    soundService.playTapSound();
    if (isLocked) {
      openPaywall('level_lock');
      return;
    }
    navigateToQuiz({
      prefixLevelId: checkpoint.id,
      isPrefixCheckpoint: true,
      prefixCefrLevel: activeCefr,
    });
  };

  // Group levels by subgroup type
  const groupedLevels = useMemo(() => {
    const groups: Array<{ type: string; titleKey: string; items: PrefixLevelData[] }> = [];

    const subgroupsInOrder = ['opposites', 'dual', 'separable', 'inseparable'] as const;

    subgroupsInOrder.forEach(sg => {
      const items = levels.filter(lvl => lvl.subgroupType === sg);
      if (items.length > 0) {
        let titleKey = 'prefixPracticeListScreen.subgroupSeparable';
        if (sg === 'inseparable') {
          titleKey = 'prefixPracticeListScreen.subgroupInseparable';
        } else if (sg === 'opposites') {
          titleKey = 'prefixPracticeListScreen.subgroupOpposites';
        } else if (sg === 'dual') {
          titleKey = 'prefixPracticeListScreen.subgroupDual';
        }

        groups.push({
          type: sg,
          titleKey,
          items,
        });
      }
    });

    return groups;
  }, [levels]);

  const allLevelsInOrder = useMemo(() => {
    const list: PrefixLevelData[] = [];
    groupedLevels.forEach(group => {
      group.items.forEach(item => {
        list.push(item);
      });
    });
    if (checkpoint) {
      list.push(checkpoint);
    }
    return list;
  }, [groupedLevels, checkpoint]);

  const furthestCompletedPrefixId = useMemo(() => {
    let lastCompletedIndex = -1;
    allLevelsInOrder.forEach((lvl, index) => {
      const progress = levelProgressMap[lvl.id];
      if (progress && progress.status !== 'uncompleted') {
        lastCompletedIndex = index;
      }
    });

    if (lastCompletedIndex >= 0 && lastCompletedIndex < allLevelsInOrder.length - 1) {
      return allLevelsInOrder[lastCompletedIndex + 1].id;
    }
    if (lastCompletedIndex >= 0) {
      return allLevelsInOrder[lastCompletedIndex].id;
    }
    return null;
  }, [allLevelsInOrder, levelProgressMap]);

  const scrollToTargetForPrefix = useCallback(() => {
    if (!scrollViewRef.current) return;

    if (
      furthestCompletedPrefixId &&
      typeof itemPositionsRef.current[furthestCompletedPrefixId] === 'number'
    ) {
      const targetY = itemPositionsRef.current[furthestCompletedPrefixId];
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
  }, [furthestCompletedPrefixId]);

  useEffect(() => {
    if (allLevelsInOrder.length === 0) return;

    const timer = setTimeout(() => {
      scrollToTargetForPrefix();
    }, 150);

    return () => clearTimeout(timer);
  }, [activeCefr, allLevelsInOrder, scrollToTargetForPrefix]);

  const renderStatusIcon = (status: VerbProgress['status'], index: number) => {
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
        title={intl.formatMessage({ id: 'prefixPracticeListScreen.title' })}
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
              testID={`prefix-tab-${tab}`}
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
        {groupedLevels.map((group, groupIdx) => (
          <View key={group.type}>
            <View style={[styles.subgroupHeader, groupIdx === 0 && styles.subgroupHeaderFirst]}>
              <Text style={styles.subgroupTitle}>{intl.formatMessage({ id: group.titleKey })}</Text>
              <View style={styles.subgroupDivider} />
            </View>

            {group.items.map((lvl, idx) => {
              const progress = levelProgressMap[lvl.id] || { score: 0, status: 'uncompleted' };
              const verbsString = lvl.verbs.join(', ');

              return (
                <TouchableOpacity
                  key={lvl.id}
                  style={styles.levelCard}
                  activeOpacity={0.7}
                  onPress={() => handleLevelPress(lvl)}
                  onLayout={e => {
                    itemPositionsRef.current[lvl.id] = e.nativeEvent.layout.y;
                  }}
                  testID={`prefix-level-${lvl.id}`}
                >
                  {renderStatusIcon(progress.status, idx)}
                  <View style={styles.levelInfo}>
                    <View style={styles.levelTitleRow}>
                      <Text style={styles.levelTitle}>
                        {intl.formatMessage(
                          { id: 'prefixPracticeListScreen.levelNumber' },
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
          </View>
        ))}

        {/* Section Checkpoint Card */}
        {checkpoint && (
          <View
            onLayout={e => {
              if (checkpoint) {
                itemPositionsRef.current[checkpoint.id] = e.nativeEvent.layout.y;
              }
            }}
          >
            <PracticeCheckpointCard
              title={intl.formatMessage(
                { id: 'prefixPracticeListScreen.checkpointTitle' },
                { level: activeCefr },
              )}
              subtitle={intl.formatMessage({ id: 'prefixPracticeListScreen.checkpointSubtitle' })}
              status={levelProgressMap[checkpoint.id]?.status || 'uncompleted'}
              isFinal={true}
              isLocked={isLocked}
              onPress={handleCheckpointPress}
              testID={`prefix-checkpoint-${activeCefr}`}
            />
          </View>
        )}
      </ScrollView>

      {dailyQuizLimitModalUI}
    </ScreenBackground>
  );
}
