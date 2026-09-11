import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { soundService } from '../../services/soundService';
import { useNavigateToQuiz } from '../../hooks/useNavigateToQuiz';
import { PracticeCheckpointCard } from '../../components/PracticeCheckpointCard/PracticeCheckpointCard';
import { PracticeVerbCard } from '../../components/PracticeVerbCard/PracticeVerbCard';
import { VerbCard } from '../../../docs/verb.types';
import { createStyles } from './VerbsPracticeListScreen.styles';

export const VERB_ITEM_HEIGHT = 78;
export const CHECKPOINT_ITEM_HEIGHT = 88;
const LIST_PADDING_TOP = 8;

const CEFR_TABS = ['A1', 'A2', 'B1', 'B2'] as const;
type CefrTab = (typeof CEFR_TABS)[number];

interface BaseVerbPracticeItem {
  infinitive: string;
  level: string;
  translation: string;
  variants: VerbCard[];
  globalIndex: number;
}

interface BaseLevelGroup {
  level: string;
  verbs: BaseVerbPracticeItem[];
}

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
  isFinal?: boolean;
}

type PracticeListItem =
  | { type: 'header'; id: string; level: string; isFirst: boolean }
  | { type: 'verb'; id: string; item: VerbPracticeLevelItem }
  | { type: 'checkpoint'; id: string; item: CheckpointPracticeItem };

type NavigationProp = NativeStackNavigationProp<PracticeStackParamList & RootStackParamList>;
type VerbsPracticeListRouteProp = RouteProp<PracticeStackParamList, 'VerbsPracticeList'>;

export function VerbsPracticeListScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VerbsPracticeListRouteProp>();
  const { colors, isDark } = useAppTheme();
  const { locale } = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { navigateToQuiz, dailyQuizLimitModalUI } = useNavigateToQuiz(navigation);

  const { categoryId, categoryTitle, infinitives, initialLevel } = route.params || {};

  const languageCode = locale.split('-')[0];

  const [activeCefr, setActiveCefr] = useState<CefrTab>(
    initialLevel && (CEFR_TABS as readonly string[]).includes(initialLevel)
      ? (initialLevel as CefrTab)
      : 'A1',
  );
  const [levelGroups, setLevelGroups] = useState<LevelGroup[]>([]);
  const baseGroupsRef = useRef<BaseLevelGroup[] | null>(null);
  const lastCacheKeyRef = useRef<string>('');
  const flatListRef = useRef<FlatList<PracticeListItem>>(null);
  const hasAutoScrolledRef = useRef(false);

  const handleTabChange = useCallback((tab: CefrTab) => {
    soundService.playTapSound();
    setActiveCefr(tab);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const flatListItems = useMemo<PracticeListItem[]>(() => {
    const list: PracticeListItem[] = [];

    if (categoryId) {
      const allCategoryVerbs: VerbPracticeLevelItem[] = [];
      let catIndex = 1;
      levelGroups.forEach(group => {
        group.verbs.forEach(verbItem => {
          const catItem = { ...verbItem, globalIndex: catIndex };
          catIndex += 1;
          allCategoryVerbs.push(catItem);
          list.push({
            type: 'verb',
            id: `verb-${verbItem.level}-${verbItem.infinitive}`,
            item: catItem,
          });
        });
      });

      if (allCategoryVerbs.length > 0) {
        const checkpointId = `category-${categoryId}-final`;
        const checkpointProgress = progressService.getCheckpointProgress(checkpointId);
        list.push({
          type: 'checkpoint',
          id: checkpointId,
          item: {
            id: checkpointId,
            checkpointNumber: 1,
            fromIndex: 1,
            toIndex: allCategoryVerbs.length,
            verbs: allCategoryVerbs,
            score: checkpointProgress.score,
            status: checkpointProgress.status,
            isFinal: true,
          },
        });
      }

      return list;
    }

    const currentGroup = levelGroups.find(group => group.level === activeCefr);
    if (!currentGroup) {
      return list;
    }

    let currentBatch: VerbPracticeLevelItem[] = [];

    currentGroup.verbs.forEach(verbItem => {
      list.push({
        type: 'verb',
        id: `verb-${verbItem.level}-${verbItem.infinitive}`,
        item: verbItem,
      });

      currentBatch.push(verbItem);

      if (verbItem.globalIndex % 10 === 0) {
        const checkpointNumber = verbItem.globalIndex / 10;
        const checkpointId = `checkpoint-${verbItem.level.toLowerCase()}-${checkpointNumber}`;
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
            isFinal: false,
          },
        });

        currentBatch = [];
      }
    });

    if (currentGroup.verbs.length > 0) {
      const finalCheckpointId = `checkpoint-${activeCefr.toLowerCase()}-final`;
      const finalCheckpointProgress = progressService.getCheckpointProgress(finalCheckpointId);
      list.push({
        type: 'checkpoint',
        id: finalCheckpointId,
        item: {
          id: finalCheckpointId,
          checkpointNumber: Math.ceil(currentGroup.verbs.length / 10),
          fromIndex: 1,
          toIndex: currentGroup.verbs.length,
          verbs: currentGroup.verbs,
          score: finalCheckpointProgress.score,
          status: finalCheckpointProgress.status,
          isFinal: true,
        },
      });
    }

    return list;
  }, [levelGroups, categoryId, activeCefr]);

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

  const itemLayouts = useMemo(() => {
    const layouts: Array<{ length: number; offset: number }> = [];
    let currentOffset = LIST_PADDING_TOP;

    for (let i = 0; i < flatListItems.length; i++) {
      const item = flatListItems[i];
      const length = item.type === 'checkpoint' ? CHECKPOINT_ITEM_HEIGHT : VERB_ITEM_HEIGHT;
      layouts.push({ length, offset: currentOffset });
      currentOffset += length;
    }

    return layouts;
  }, [flatListItems]);

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => {
      const layout = itemLayouts[index];
      if (layout) {
        return { length: layout.length, offset: layout.offset, index };
      }
      return {
        length: VERB_ITEM_HEIGHT,
        offset: LIST_PADDING_TOP + VERB_ITEM_HEIGHT * index,
        index,
      };
    },
    [itemLayouts],
  );

  const scrollTargetToCenter = useCallback(() => {
    if (furthestCompletedIndex > 0 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index: furthestCompletedIndex,
          viewPosition: 0.5,
          animated: true,
        });
      } catch {
        const targetOffset = itemLayouts[furthestCompletedIndex]?.offset;
        if (typeof targetOffset === 'number') {
          flatListRef.current.scrollToOffset({
            offset: targetOffset,
            animated: true,
          });
        }
      }
    }
  }, [furthestCompletedIndex, itemLayouts]);

  useEffect(() => {
    if (!hasAutoScrolledRef.current && furthestCompletedIndex > 0 && flatListItems.length > 0) {
      hasAutoScrolledRef.current = true;
      const timer = setTimeout(() => {
        scrollTargetToCenter();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [furthestCompletedIndex, flatListItems.length, scrollTargetToCenter]);

  const handleVerbPress = useCallback(
    (infinitive: string, level: string) => {
      navigateToQuiz({
        infinitive,
        level,
      });
    },
    [navigateToQuiz],
  );

  const loadVerbsAndProgress = useCallback(async () => {
    try {
      const currentCacheKey = `${languageCode}_${(infinitives || []).join(',')}`;
      let baseGroups = baseGroupsRef.current;

      if (!baseGroups || lastCacheKeyRef.current !== currentCacheKey) {
        const allVerbs = await verbDataService.getVerbsOrderedByDifficulty();

        let targetVerbs = allVerbs;
        if (infinitives && infinitives.length > 0) {
          const infLowerSet = new Set(
            infinitives.map(inf => inf.toLowerCase().replace('sich ', '').trim()),
          );
          targetVerbs = allVerbs.filter(verb => {
            const clean = verb.infinitive.toLowerCase().replace('sich ', '').trim();
            return infLowerSet.has(clean);
          });
        }

        // Группировка по уровню сложности и уникальному инфинитиву
        const levelMap = new Map<string, Map<string, VerbCard[]>>();

        targetVerbs.forEach(verb => {
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

        const newBaseGroups: BaseLevelGroup[] = [];
        levelMap.forEach((infinitiveMap, level) => {
          let currentIndex = 1;
          const baseVerbItems: BaseVerbPracticeItem[] = [];

          infinitiveMap.forEach((variants, infinitive) => {
            const primaryVariant = variants[0];
            const rawTranslation =
              primaryVariant.translation?.[languageCode] || primaryVariant.translation?.en || '';

            // Очистка перевода от грамматических скобок
            const cleanTranslation = rawTranslation.split('(')[0].trim() || rawTranslation;

            baseVerbItems.push({
              infinitive,
              level,
              translation: cleanTranslation,
              variants,
              globalIndex: currentIndex,
            });

            currentIndex += 1;
          });

          newBaseGroups.push({
            level,
            verbs: baseVerbItems,
          });
        });

        baseGroups = newBaseGroups;
        baseGroupsRef.current = newBaseGroups;
        lastCacheKeyRef.current = currentCacheKey;
      }

      const structuredGroups: LevelGroup[] = baseGroups.map(group => ({
        level: group.level,
        verbs: group.verbs.map(baseItem => {
          const progressList = baseItem.variants.map(v => {
            const byId = progressService.getVerbProgress(v.id);
            const byInfinitive = progressService.getVerbProgress(v.infinitive);
            return byId.score >= byInfinitive.score ? byId : byInfinitive;
          });

          const averageScore = Math.round(
            progressList.reduce((total, p) => total + p.score, 0) / progressList.length,
          );
          const status = calculateVerbStatus(averageScore);

          return {
            ...baseItem,
            score: averageScore,
            status,
          };
        }),
      }));

      setLevelGroups(structuredGroups);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[VerbsPracticeListScreen] Error loading verbs:', error);
    }
  }, [languageCode, infinitives]);

  useFocusEffect(
    useCallback(() => {
      loadVerbsAndProgress();
    }, [loadVerbsAndProgress]),
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
        const isCategoryFinal = Boolean(categoryId);
        const isFinal = Boolean(checkpointItem.isFinal || isCategoryFinal);

        let title = intl.formatMessage({ id: 'verbsPracticeListScreen.checkpointTitle' });
        let subtitle: string | undefined = intl.formatMessage(
          { id: 'verbsPracticeListScreen.checkpointSubtitle' },
          { from: checkpointItem.fromIndex, to: checkpointItem.toIndex },
        );

        if (isCategoryFinal) {
          title = intl.formatMessage({ id: 'verbsPracticeListScreen.finalTestTitle' });
          subtitle = intl.formatMessage({
            id: 'verbsPracticeListScreen.categoryFinalTestSubtitle',
          });
        } else if (isFinal) {
          title = intl.formatMessage(
            { id: 'verbsPracticeListScreen.finalTestTitleWithLevel' },
            { level: activeCefr },
          );
          subtitle = intl.formatMessage({ id: 'verbsPracticeListScreen.finalTestSubtitle' });
        }

        let testID = `checkpoint-card-${checkpointItem.checkpointNumber}`;
        if (isCategoryFinal) {
          testID = `category-final-test-${categoryId}`;
        } else if (isFinal) {
          testID = `level-final-test-${activeCefr}`;
        }

        return (
          <PracticeCheckpointCard
            title={title}
            subtitle={subtitle}
            status={checkpointItem.status}
            isFinal={isFinal}
            onPress={() =>
              navigateToQuiz({
                isCheckpoint: true,
                checkpointId: checkpointItem.id,
                checkpointNumber: checkpointItem.checkpointNumber,
                fromIndex: checkpointItem.fromIndex,
                toIndex: checkpointItem.toIndex,
                infinitives: checkpointItem.verbs.map(v => v.infinitive),
                level: checkpointItem.verbs[0]?.level || activeCefr,
                categoryId,
              })
            }
            testID={testID}
          />
        );
      }

      const verbItem = item.item;
      return (
        <PracticeVerbCard
          infinitive={verbItem.infinitive}
          translation={verbItem.translation}
          level={verbItem.level}
          globalIndex={verbItem.globalIndex}
          status={verbItem.status}
          onPress={handleVerbPress}
        />
      );
    },
    [activeCefr, categoryId, handleVerbPress, intl, navigateToQuiz, styles],
  );

  const handleBackToMain = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('PracticeHome');
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onHardwareBack = () => {
        handleBackToMain();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
      return () => subscription.remove();
    }, [handleBackToMain]),
  );

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={categoryTitle || intl.formatMessage({ id: 'verbsPracticeListScreen.title' })}
        showBackButton
        onBackPress={handleBackToMain}
      />

      {/* CEFR Level Tabs: A1, A2, B1, B2 */}
      {!categoryId && (
        <View style={styles.tabsContainer}>
          {CEFR_TABS.map(tab => {
            const isActive = tab === activeCefr;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                activeOpacity={0.7}
                onPress={() => handleTabChange(tab)}
                testID={`verbs-tab-${tab}`}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={flatListItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        onScrollToIndexFailed={info => {
          const targetOffset =
            itemLayouts[info.index]?.offset ?? LIST_PADDING_TOP + info.index * VERB_ITEM_HEIGHT;
          flatListRef.current?.scrollToOffset({
            offset: targetOffset,
            animated: false,
          });
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
