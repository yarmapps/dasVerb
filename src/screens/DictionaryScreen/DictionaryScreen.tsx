import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Keyboard,
  StyleProp,
  TextStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { useAppTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { FormInput } from '../../components/FormInput/FormInput';
import { VerbCardDetails } from '../../components/VerbCardDetails/VerbCardDetails';
import { verbDataService } from '../../services/verbDataService';
import { VerbCard } from '../../../docs/verb.types';
import { ThemeColors } from '../../styles/themeColors';
import { trackEvent } from '../../services/analyticsService';
import { createStyles } from './DictionaryScreen.styles';

interface VerbItemProps {
  verb: VerbCard;
  searchQuery: string;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  locale: string;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}

const VerbItem = memo(
  ({ verb, searchQuery, isExpanded, onToggleExpand, locale, styles, colors }: VerbItemProps) => {
    const languageCode = locale.split('-')[0];
    const translation = verb.translation?.[languageCode] || verb.translation?.en || '';

    const renderHighlightedText = (
      text: string,
      query: string,
      baseStyle: StyleProp<TextStyle>,
    ) => {
      const normalizedQuery = query.trim();
      if (!normalizedQuery) return <Text style={baseStyle}>{text}</Text>;

      const parts = text.split(new RegExp(`(${normalizedQuery})`, 'gi'));

      return (
        <Text style={baseStyle}>
          {parts.map((part, index) =>
            part.toLowerCase() === normalizedQuery.toLowerCase() ? (
              <Text key={index} style={styles.highlightText}>
                {part}
              </Text>
            ) : (
              part
            ),
          )}
        </Text>
      );
    };

    const getRektionBadges = (): { text: string; caseType: string }[] => {
      const caseAbbreviationMap: Record<string, string> = {
        Akkusativ: 'Akk',
        Dativ: 'Dat',
        Genitiv: 'Gen',
        Nominativ: 'Nom',
      };
      if (verb.rektion?.preposition) {
        if (verb.rektion.preposition_case === 'Akkusativ + Dativ') {
          return [
            { text: `${verb.rektion.preposition} + Akk`, caseType: 'Akkusativ' },
            { text: `${verb.rektion.preposition} + Dat`, caseType: 'Dativ' },
          ];
        }
        const prepositionCase = verb.rektion.preposition_case || 'Akkusativ';
        const formattedPrepositionCase = caseAbbreviationMap[prepositionCase] || prepositionCase;
        return [
          {
            text: `${verb.rektion.preposition} + ${formattedPrepositionCase}`,
            caseType: prepositionCase,
          },
        ];
      }
      if (verb.rektion?.direct_case) {
        if (verb.rektion.direct_case === 'Dativ + Akkusativ') {
          return [
            { text: '+ Dat', caseType: 'Dativ' },
            { text: '+ Akk', caseType: 'Akkusativ' },
          ];
        }
        const directCase = verb.rektion.direct_case;
        const formattedDirectCase = caseAbbreviationMap[directCase] || directCase;
        return [
          {
            text: `+ ${formattedDirectCase}`,
            caseType: directCase,
          },
        ];
      }
      return [];
    };

    const getRektionBadgeStyle = (caseType?: string) => {
      switch (caseType) {
        case 'Dativ':
          return {
            container: styles.rektionBadgeDativ,
            text: styles.rektionBadgeTextDativ,
          };
        case 'Genitiv':
          return {
            container: styles.rektionBadgeGenitiv,
            text: styles.rektionBadgeTextGenitiv,
          };
        case 'Akkusativ':
        default:
          return {
            container: styles.rektionBadgeAkkusativ,
            text: styles.rektionBadgeTextAkkusativ,
          };
      }
    };

    const rektionBadges = getRektionBadges();
    const pastFormsText = `${verb.principal_parts.praeteritum_3sg} · ${verb.auxiliary} ${verb.principal_parts.partizip_2}`;

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => onToggleExpand(verb.id)}
        activeOpacity={0.7}
        testID={`verb-item-${verb.id}`}
      >
        <View style={styles.rowTop}>
          <View style={styles.wordLeft}>
            {/* Row 1: Infinitive + Case Color-Coded Rektion badges */}
            <View style={styles.wordHeader}>
              {renderHighlightedText(verb.infinitive, searchQuery, styles.infinitiveText)}
              {rektionBadges.map((badge, badgeIndex) => {
                const badgeStyle = getRektionBadgeStyle(badge.caseType);
                return (
                  <View key={badgeIndex} style={[styles.rektionBadge, badgeStyle.container]}>
                    <Text style={badgeStyle.text}>{badge.text}</Text>
                  </View>
                );
              })}
            </View>

            {/* Row 2: Präteritum & Perfekt forms */}
            <View style={styles.formsRow}>
              {renderHighlightedText(pastFormsText, searchQuery, styles.formsText)}
            </View>

            {/* Row 3: Translation */}
            {translation ? (
              renderHighlightedText(translation, searchQuery, styles.translationText)
            ) : (
              <Text style={styles.translationText}>—</Text>
            )}
          </View>

          <View style={styles.arrowContainer}>
            <FontAwesome5
              name={isExpanded ? 'chevron-down' : 'chevron-right'}
              size={14}
              color={colors.textMutedInverted}
            />
          </View>
        </View>

        {isExpanded && <VerbCardDetails verb={verb} locale={locale} />}
      </TouchableOpacity>
    );
  },
);

VerbItem.displayName = 'VerbItem';

export function DictionaryScreen(): React.JSX.Element {
  const intl = useIntl();
  const { colors, isDark } = useAppTheme();
  const { locale } = useLocale();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [searchQuery, setSearchQuery] = useState('');
  const [verbs, setVerbs] = useState<VerbCard[]>([]);
  const [expandedVerbId, setExpandedVerbId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVerbs = useCallback(
    async (query: string) => {
      setIsLoading(true);
      try {
        const data = await verbDataService.searchVerbs(query, locale, 50);
        setVerbs(data);
        const trimmed = query.trim();
        if (trimmed.length > 0) {
          trackEvent('dictionary_search', {
            search_term: trimmed,
            query_length: trimmed.length,
            results_count: data.length,
          });
          if (data.length === 0) {
            trackEvent('dictionary_search_no_results', {
              search_term: trimmed,
              query_length: trimmed.length,
            });
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[DictionaryScreen] Error searching verbs:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [locale],
  );

  useEffect(() => {
    fetchVerbs(searchQuery);
  }, [searchQuery, fetchVerbs]);

  const handleToggleExpand = useCallback(
    (id: string) => {
      setExpandedVerbId(prevId => {
        const willExpand = prevId !== id;
        const targetVerb = verbs.find(v => v.id === id);
        if (targetVerb) {
          if (willExpand) {
            trackEvent('dictionary_verb_expanded', {
              infinitive: targetVerb.infinitive,
              level: targetVerb.level,
            });
          } else {
            trackEvent('dictionary_verb_collapsed', {
              infinitive: targetVerb.infinitive,
            });
          }
        }
        return willExpand ? id : null;
      });
    },
    [verbs],
  );

  const handleClearSearch = () => {
    trackEvent('dictionary_search_cleared', {});
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const emptySearchMessage = intl.formatMessage({ id: 'dictionaryScreen.emptySearch' });

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={intl.formatMessage({ id: 'dictionaryScreen.title' })}
        showBackButton={false}
      />

      <View style={styles.searchContainer}>
        <FormInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={intl.formatMessage({ id: 'dictionaryScreen.searchPlaceholder' })}
          leftIcon={<FontAwesome5 name="search" size={14} color={colors.textMuted} />}
          rightIcon={
            searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={handleClearSearch}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <FontAwesome5 name="times-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null
          }
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={verbs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <VerbItem
            verb={item}
            searchQuery={searchQuery}
            isExpanded={expandedVerbId === item.id}
            onToggleExpand={handleToggleExpand}
            locale={locale}
            styles={styles}
            colors={colors}
          />
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="search" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? `${emptySearchMessage}: «${searchQuery}»`
                  : emptySearchMessage}
              </Text>
            </View>
          ) : null
        }
      />
    </ScreenBackground>
  );
}
