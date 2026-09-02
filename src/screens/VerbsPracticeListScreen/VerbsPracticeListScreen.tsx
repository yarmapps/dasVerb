import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, InteractionManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { RootStackParamList, PracticeStackParamList } from '../../types/navigation';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { verbDataService } from '../../services/verbDataService';
import {
  progressService,
  VerbProgressStatus,
  calculateVerbStatus,
} from '../../services/progressService';
import { useNavigateToQuiz } from '../../hooks/useNavigateToQuiz';
import { VerbCard } from '../../../docs/verb.types';
import { createStyles } from './VerbsPracticeListScreen.styles';

interface VerbPracticeLevelItem {
  infinitive: string;
  level: string;
  translation: string;
  variants: VerbCard[];
  globalIndex: number;
  score: number;
  status: VerbProgressStatus;
}

interface LevelGroup {
  level: string;
  verbs: VerbPracticeLevelItem[];
}

interface CheckpointPracticeItem {
  id: string;
  checkpointNumber: number;
  fromIndex: number;
  toIndex: number;
  verbs: VerbPracticeLevelItem[];
  score: number;
  status: VerbProgressStatus;
}

type PracticeListItem =
  | { type: 'header'; id: string; level: string; isFirst: boolean }
  | { type: 'verb'; id: string; item: VerbPracticeLevelItem }
  | { type: 'checkpoint'; id: string; item: CheckpointPracticeItem };

type NavigationProp = NativeStackNavigationProp<PracticeStackParamList & RootStackParamList>;

export function VerbsPracticeListScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useAppTheme();
  const { locale } = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { navigateToQuiz, dailyQuizLimitModalUI } = useNavigateToQuiz(navigation);

  const languageCode = locale.split('-')[0];

  const [levelGroups, setLevelGroups] = useState<LevelGroup[]>([]);
  const flatListRef = useRef<FlatList<PracticeListItem>>(null);
  const hasAutoScrolledRef = useRef(false);

  const flatListItems = useMemo<PracticeListItem[]>(() => {
    const list: PracticeListItem[] = [];
    let currentBatch: VerbPracticeLevelItem[] = [];

    levelGroups.forEach((group, groupIndex) => {
      list.push({
        type: 'header',
        id: `header-${group.level}`,
        level: group.level,
        isFirst: groupIndex === 0,
      });

      group.verbs.forEach(verbItem => {
        list.push({
          type: 'verb',
          id: `verb-${verbItem.level}-${verbItem.infinitive}`,
          item: verbItem,
        });

        currentBatch.push(verbItem);

        if (verbItem.globalIndex % 10 === 0) {
          const checkpointNumber = verbItem.globalIndex / 10;
          const checkpointId = `checkpoint-${checkpointNumber}`;
          const checkpointProgress = progressService.getCheckpointProgress(checkpointId);
          const fromIndex = (checkpointNumber - 1) * 10 + 1;
          const toIndex = checkpointNumber * 10;

          list.push({
            type: 'checkpoint',
            id: checkpointId,
            item: {
              id: checkpointId,
              checkpointNumber,
              fromIndex,
              toIndex,
              verbs: [...currentBatch],
              score: checkpointProgress.score,
              status: checkpointProgress.status,
            },
          });

          currentBatch = [];
        }
      });
    });

    return list;
  }, [levelGroups]);

  const furthestCompletedIndex = useMemo(() => {
    let lastCompletedIndex = -1;
    flatListItems.forEach((item, index) => {
      if (item.type === 'verb' && item.item.status !== 'uncompleted') {
        lastCompletedIndex = index;
      } else if (item.type === 'checkpoint' && item.item.status !== 'uncompleted') {
        lastCompletedIndex = index;
      }
    });

    if (lastCompletedIndex >= 0 && lastCompletedIndex < flatListItems.length - 1) {
      return lastCompletedIndex + 1;
    }

    return lastCompletedIndex;
  }, [flatListItems]);

  const scrollTargetToCenter = useCallback(() => {
    if (furthestCompletedIndex >= 0 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index: furthestCompletedIndex,
          viewPosition: 0.5,
          animated: true,
        });
      } catch {
        // Fallback in onScrollToIndexFailed
      }
    }
  }, [furthestCompletedIndex]);

  useEffect(() => {
    if (!hasAutoScrolledRef.current && furthestCompletedIndex >= 0 && flatListItems.length > 0) {
      hasAutoScrolledRef.current = true;
      const interactionPromise = InteractionManager.runAfterInteractions(() => {
        const timer = setTimeout(() => {
          scrollTargetToCenter();
        }, 120);
        return () => clearTimeout(timer);
      });
      return () => {
        interactionPromise.cancel();
      };
    }
  }, [furthestCompletedIndex, flatListItems.length, scrollTargetToCenter]);

  const loadVerbsAndProgress = useCallback(async () => {
    try {
      const allVerbs = await verbDataService.getVerbsOrderedByDifficulty();

      // Группировка по уровню сложности и уникальному инфинитиву
      const levelMap = new Map<string, Map<string, VerbCard[]>>();

      allVerbs.forEach(verb => {
        const levelKey = verb.level;
        if (!levelMap.has(levelKey)) {
          levelMap.set(levelKey, new Map());
        }
        const infinitiveMap = levelMap.get(levelKey)!;
        if (!infinitiveMap.has(verb.infinitive)) {
          infinitiveMap.set(verb.infinitive, []);
        }
        infinitiveMap.get(verb.infinitive)?.push(verb);
      });

      let currentIndex = 1;
      const structuredGroups: LevelGroup[] = [];

      levelMap.forEach((infinitiveMap, level) => {
        const verbItems: VerbPracticeLevelItem[] = [];

        infinitiveMap.forEach((variants, infinitive) => {
          const primaryVariant = variants[0];
          const rawTranslation =
            primaryVariant.translation?.[languageCode] || primaryVariant.translation?.en || '';

          // Очистка перевода от грамматических скобок
          const cleanTranslation = rawTranslation.split('(')[0].trim() || rawTranslation;

          // Расчет максимального/среднего прогресса по всем вариациям глагола и его инфинитиву
          const progressList = variants.map(v => {
            const byId = progressService.getVerbProgress(v.id);
            const byInfinitive = progressService.getVerbProgress(v.infinitive);
            return byId.score >= byInfinitive.score ? byId : byInfinitive;
          });

          const averageScore = Math.round(
            progressList.reduce((total, p) => total + p.score, 0) / progressList.length,
          );
          const status = calculateVerbStatus(averageScore);

          verbItems.push({
            infinitive,
            level,
            translation: cleanTranslation,
            variants,
            globalIndex: currentIndex,
            score: averageScore,
            status,
          });

          currentIndex += 1;
        });

        structuredGroups.push({
          level,
          verbs: verbItems,
        });
      });

      setLevelGroups(structuredGroups);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[VerbsPracticeListScreen] Error loading verbs:', error);
    }
  }, [languageCode]);

  useFocusEffect(
    useCallback(() => {
      loadVerbsAndProgress();
    }, [loadVerbsAndProgress]),
  );

  const renderStatusBadge = useCallback(
    (status: VerbProgressStatus, globalIndex: number) => {
      switch (status) {
        case 'trophy':
          return (
            <View style={[styles.statusBadge, styles.statusBadgeTrophy]}>
              <FontAwesome5 name="trophy" size={18} color="#FFD700" />
            </View>
          );
        case 'silver':
          return (
            <View style={[styles.statusBadge, styles.statusBadgeSilver]}>
              <FontAwesome5 name="medal" size={18} color="#94A3B8" />
            </View>
          );
        case 'bronze':
          return (
            <View style={[styles.statusBadge, styles.statusBadgeBronze]}>
              <FontAwesome5 name="medal" size={18} color="#CD7F32" />
            </View>
          );
        case 'uncompleted':
        default:
          return (
            <View style={[styles.statusBadge, styles.statusBadgeUncompleted]}>
              <Text style={styles.levelIndexText}>{globalIndex}</Text>
            </View>
          );
      }
    },
    [styles],
  );

  const renderCheckpointStatusBadge = useCallback(
    (status: VerbProgressStatus) => {
      switch (status) {
        case 'trophy':
          return (
            <View style={[styles.statusBadge, styles.statusBadgeTrophy]}>
              <FontAwesome5 name="trophy" size={18} color="#FFD700" />
            </View>
          );
        case 'silver':
          return (
            <View style={[styles.statusBadge, styles.statusBadgeSilver]}>
              <FontAwesome5 name="medal" size={18} color="#94A3B8" />
            </View>
          );
        case 'bronze':
          return (
            <View style={[styles.statusBadge, styles.statusBadgeBronze]}>
              <FontAwesome5 name="medal" size={18} color="#CD7F32" />
            </View>
          );
        case 'uncompleted':
        default:
          return (
            <View style={[styles.statusBadge, styles.checkpointStatusBadgeUncompleted]}>
              <FontAwesome5 name="flag" size={15} color={colors.primary} />
            </View>
          );
      }
    },
    [colors.primary, styles],
  );

  const renderItem = useCallback(
    ({ item }: { item: PracticeListItem }) => {
      if (item.type === 'header') {
        return (
          <View style={[styles.levelSectionHeader, item.isFirst && styles.levelSectionFirst]}>
            <View style={styles.levelSectionBadge}>
              <Text style={styles.levelSectionBadgeText}>
                {intl.formatMessage({ id: 'verbsPracticeListScreen.levelHeader' })} {item.level}
              </Text>
            </View>
            <View style={styles.levelDividerLine} />
          </View>
        );
      }

      if (item.type === 'checkpoint') {
        const checkpointItem = item.item;
        return (
          <TouchableOpacity
            style={styles.checkpointCard}
            activeOpacity={0.7}
            onPress={() =>
              navigateToQuiz({
                isCheckpoint: true,
                checkpointId: checkpointItem.id,
                checkpointNumber: checkpointItem.checkpointNumber,
                fromIndex: checkpointItem.fromIndex,
                toIndex: checkpointItem.toIndex,
                infinitives: checkpointItem.verbs.map(v => v.infinitive),
                level: checkpointItem.verbs[0]?.level || 'A1',
              })
            }
            testID={`checkpoint-card-${checkpointItem.checkpointNumber}`}
          >
            {renderCheckpointStatusBadge(checkpointItem.status)}

            <View style={styles.checkpointInfo}>
              <Text style={styles.checkpointTitle}>
                {intl.formatMessage({ id: 'verbsPracticeListScreen.checkpointTitle' })}
              </Text>
            </View>

            <View style={styles.rightAction}>
              <FontAwesome5 name="chevron-right" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        );
      }

      const verbItem = item.item;
      return (
        <TouchableOpacity
          style={styles.verbCard}
          activeOpacity={0.7}
          onPress={() =>
            navigateToQuiz({
              infinitive: verbItem.infinitive,
              level: verbItem.level,
            })
          }
          testID={`verb-practice-level-${verbItem.infinitive}`}
        >
          {/* Status Badge (Circle / Medal / Trophy) */}
          {renderStatusBadge(verbItem.status, verbItem.globalIndex)}

          {/* Verb Details: Infinitive & Translation */}
          <View style={styles.verbInfo}>
            <Text style={styles.infinitiveText}>{verbItem.infinitive}</Text>
            <Text style={styles.translationText}>{verbItem.translation}</Text>
          </View>

          {/* Right Arrow */}
          <View style={styles.rightAction}>
            <FontAwesome5 name="chevron-right" size={14} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      );
    },
    [
      colors.primary,
      colors.textMuted,
      intl,
      navigateToQuiz,
      renderCheckpointStatusBadge,
      renderStatusBadge,
      styles,
    ],
  );

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={intl.formatMessage({ id: 'verbsPracticeListScreen.title' })}
        showBackButton
        onBackPress={() => {
          navigation.goBack();
        }}
      />

      <FlatList
        ref={flatListRef}
        data={flatListItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={10}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              viewPosition: 0.5,
              animated: true,
            });
          }, 100);
        }}
      />
      {dailyQuizLimitModalUI}
    </ScreenBackground>
  );
}
