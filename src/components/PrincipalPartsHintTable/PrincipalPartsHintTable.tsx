import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { PrincipalParts, AuxiliaryVerb, VerbConjugation } from '../../../docs/verb.types';
import { createStyles } from './PrincipalPartsHintTable.styles';

type ConjugationGroup = 'ich' | 'du' | 'er_sie_es' | 'wir' | 'ihr' | 'sie_Sie';

interface DetectedPronounInfo {
  displayPronoun: string;
  group: ConjugationGroup;
}

const SEIN_AUX_MAP: Record<ConjugationGroup, string> = {
  ich: 'bin',
  du: 'bist',
  er_sie_es: 'ist',
  wir: 'sind',
  ihr: 'seid',
  sie_Sie: 'sind',
};

const HABEN_AUX_MAP: Record<ConjugationGroup, string> = {
  ich: 'habe',
  du: 'hast',
  er_sie_es: 'hat',
  wir: 'haben',
  ihr: 'habt',
  sie_Sie: 'haben',
};

function detectPronounInfo(
  sentenceText?: string,
  principalParts?: PrincipalParts,
): DetectedPronounInfo {
  if (!sentenceText) {
    return {
      displayPronoun: 'er/sie/es',
      group: 'er_sie_es',
    };
  }

  const cleaned = sentenceText.replace(/[.,!?:;]/g, ' ');
  const words = cleaned.split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const rawWord = words[i];
    const lower = rawWord.toLowerCase();

    if (lower === 'ich') {
      return { displayPronoun: 'ich', group: 'ich' };
    }
    if (lower === 'du') {
      return { displayPronoun: 'du', group: 'du' };
    }
    if (lower === 'er') {
      return { displayPronoun: 'er', group: 'er_sie_es' };
    }
    if (lower === 'es') {
      return { displayPronoun: 'es', group: 'er_sie_es' };
    }
    if (lower === 'wir') {
      return { displayPronoun: 'wir', group: 'wir' };
    }
    if (lower === 'ihr') {
      return { displayPronoun: 'ihr', group: 'ihr' };
    }

    // Distinguish "sie" (3. Sg. "она") vs "sie" (3. Pl. "они") vs "Sie" (Höflichkeitsform "Вы")
    if (lower === 'sie') {
      const isFormalCapitalized = rawWord === 'Sie' && i > 0;
      const lowerSentence = sentenceText.toLowerCase();

      // Check for 3. Sg. indicators (hat, ist, present_3sg word, etc.)
      const pres3sgWord = principalParts?.present_3sg?.toLowerCase()?.split(' ')[0] || '';
      const praet3sgWord = principalParts?.praeteritum_3sg?.toLowerCase()?.split(' ')[0] || '';

      const hasSingularAux = /\b(hat|ist|wird|war)\b/i.test(sentenceText);
      const hasSingularVerb =
        (pres3sgWord && lowerSentence.includes(pres3sgWord)) ||
        (praet3sgWord && lowerSentence.includes(praet3sgWord));

      const hasPluralAux = /\b(haben|sind|werden|waren)\b/i.test(sentenceText);

      if (hasSingularAux || (hasSingularVerb && !hasPluralAux)) {
        // "sie" as singular 3. Sg. ("она")
        return {
          displayPronoun: 'sie',
          group: 'er_sie_es',
        };
      }

      if (isFormalCapitalized) {
        // "Sie" as formal polite ("Вы")
        return {
          displayPronoun: 'Sie',
          group: 'sie_Sie',
        };
      }

      // Default plural "sie" ("они")
      return {
        displayPronoun: 'sie',
        group: 'sie_Sie',
      };
    }
  }

  return {
    displayPronoun: 'er/sie/es',
    group: 'er_sie_es',
  };
}

export interface PrincipalPartsHintTableProps {
  principalParts: PrincipalParts;
  auxiliary?: AuxiliaryVerb;
  conjugation?: VerbConjugation;
  sentenceText?: string;
  embedded?: boolean;
}

export function PrincipalPartsHintTable({
  principalParts,
  auxiliary,
  conjugation,
  sentenceText,
  embedded = false,
}: PrincipalPartsHintTableProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { displayPronoun, group } = useMemo(
    () => detectPronounInfo(sentenceText, principalParts),
    [sentenceText, principalParts],
  );

  const {
    infinitive,
    present_3sg: present3sg,
    praeteritum_3sg: praeteritum3sg,
    partizip_2: partizip2,
  } = principalParts;

  // Present Form for pronoun group
  const presentForm = useMemo(() => {
    if (conjugation?.present) {
      return conjugation.present[group] || present3sg || infinitive;
    }
    return present3sg || infinitive;
  }, [conjugation, group, present3sg, infinitive]);

  // Präteritum Form for pronoun group
  const praeteritumForm = useMemo(() => {
    if (conjugation?.praeteritum) {
      return conjugation.praeteritum[group] || praeteritum3sg;
    }
    return praeteritum3sg;
  }, [conjugation, group, praeteritum3sg]);

  // Perfekt Form for pronoun group
  const auxWord = auxiliary === 'sein' ? SEIN_AUX_MAP[group] : HABEN_AUX_MAP[group];
  const perfektForm = `${auxWord} ${partizip2}`;

  return (
    <View
      style={embedded ? styles.embeddedContainer : styles.container}
      testID="principal-parts-hint-table"
    >
      <View style={styles.header}>
        <Ionicons name="layers-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.title}>
          {intl.formatMessage({ id: 'verbQuizScreen.principalParts' })}
        </Text>
      </View>

      <View style={styles.table}>
        {/* Präsens */}
        <View style={styles.row}>
          <View style={styles.tenseTag}>
            <Text style={styles.tenseTagText}>Präsens</Text>
          </View>
          <View style={styles.formContent}>
            <Text style={styles.pronounText}>{displayPronoun}</Text>
            <Text style={styles.formText}>{presentForm}</Text>
          </View>
        </View>

        {/* Präteritum */}
        <View style={styles.row}>
          <View style={styles.tenseTag}>
            <Text style={styles.tenseTagText}>Präteritum</Text>
          </View>
          <View style={styles.formContent}>
            <Text style={styles.pronounText}>{displayPronoun}</Text>
            <Text style={styles.formText}>{praeteritumForm}</Text>
          </View>
        </View>

        {/* Perfekt */}
        <View style={[styles.row, styles.rowLast]}>
          <View style={styles.tenseTag}>
            <Text style={styles.tenseTagText}>Perfekt</Text>
          </View>
          <View style={styles.formContent}>
            <Text style={styles.pronounText}>{displayPronoun}</Text>
            <Text style={styles.formText}>{perfektForm}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
