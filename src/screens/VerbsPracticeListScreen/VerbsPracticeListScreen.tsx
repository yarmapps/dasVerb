import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { verbDataService } from '../../services/verbDataService';
import {
  progressService,
  VerbProgressStatus,
  calculateVerbStatus,
} from '../../services/progressService';
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

export function VerbsPracticeListScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();
  const { locale } = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const languageCode = locale.split('-')[0];

  const [isLoading, setIsLoading] = useState(true);
  const [levelGroups, setLevelGroups] = useState<LevelGroup[]>([]);

  const loadVerbsAndProgress = useCallback(async () => {
    setIsLoading(true);
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

          // Расчет среднего прогресса по всем вариациям глагола
          const scores = variants.map(v => progressService.getVerbProgress(v.id).score);
          const averageScore = Math.round(
            scores.reduce((total, score) => total + score, 0) / scores.length,
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
    } finally {
      setIsLoading(false);
    }
  }, [languageCode]);

  useEffect(() => {
    loadVerbsAndProgress();
  }, [loadVerbsAndProgress]);

  const renderStatusBadge = (status: VerbProgressStatus, globalIndex: number) => {
    switch (status) {
      case 'trophy':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeTrophy]}>
            <FontAwesome5 name="trophy" size={18} color="#F59E0B" />
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
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={intl.formatMessage({ id: 'verbsPracticeListScreen.title' })}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {levelGroups.map((group, groupIndex) => (
            <View key={group.level}>
              {/* Section Header with Badge and Divider Line */}
              <View
                style={[styles.levelSectionHeader, groupIndex === 0 && styles.levelSectionFirst]}
              >
                <View style={styles.levelSectionBadge}>
                  <Text style={styles.levelSectionBadgeText}>
                    {intl.formatMessage({ id: 'verbsPracticeListScreen.levelHeader' })}{' '}
                    {group.level}
                  </Text>
                </View>
                <View style={styles.levelDividerLine} />
                <Text style={styles.levelCountText}>
                  {group.verbs.length}{' '}
                  {intl.formatMessage({ id: 'verbsPracticeListScreen.verbCount' })}
                </Text>
              </View>

              {/* List of Verbs in this level */}
              {group.verbs.map(item => (
                <TouchableOpacity
                  key={`${item.level}-${item.infinitive}`}
                  style={styles.verbCard}
                  activeOpacity={0.7}
                  testID={`verb-practice-level-${item.infinitive}`}
                >
                  {/* Status Badge (Circle / Medal / Trophy) */}
                  {renderStatusBadge(item.status, item.globalIndex)}

                  {/* Verb Details: Infinitive & Translation */}
                  <View style={styles.verbInfo}>
                    <Text style={styles.infinitiveText}>{item.infinitive}</Text>
                    <Text style={styles.translationText}>{item.translation}</Text>
                  </View>

                  {/* Right Arrow / Progress */}
                  <View style={styles.rightAction}>
                    {item.score > 0 && (
                      <Text
                        style={[
                          styles.scoreText,
                          item.status === 'trophy'
                            ? styles.scoreTextTrophy
                            : styles.scoreTextDefault,
                        ]}
                      >
                        {item.score}%
                      </Text>
                    )}
                    <FontAwesome5 name="chevron-right" size={14} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
