import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { PresentConjugation } from '../../../docs/verb.types';
import { createStyles } from './ConjugationHintTable.styles';

interface ConjugationHintTableProps {
  conjugation: PresentConjugation;
  embedded?: boolean;
}

export function ConjugationHintTable({
  conjugation,
  embedded = false,
}: ConjugationHintTableProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    ich,
    du,
    er_sie_es: erSieEs,
    wir,
    ihr,
    sie_Sie: sieSie,
    root_vowel_change: rootVowelChange,
  } = conjugation;

  return (
    <View
      style={embedded ? styles.embeddedContainer : styles.container}
      testID="conjugation-hint-table"
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="list-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.title}>
            {intl.formatMessage({ id: 'verbQuizScreen.conjugationPräsens' })}
          </Text>
        </View>
        {rootVowelChange ? (
          <View style={styles.vowelChangeBadge}>
            <Text style={styles.vowelChangeText}>{rootVowelChange}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.grid}>
        {/* Singular column */}
        <View style={styles.column}>
          <View style={styles.row}>
            <Text style={styles.pronoun}>ich</Text>
            <Text style={styles.form}>{ich}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.pronoun}>du</Text>
            <Text style={styles.form}>{du}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.pronoun}>er/sie/es</Text>
            <Text style={styles.form}>{erSieEs}</Text>
          </View>
        </View>

        {/* Plural column */}
        <View style={styles.column}>
          <View style={styles.row}>
            <Text style={styles.pronoun}>wir</Text>
            <Text style={styles.form}>{wir}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.pronoun}>ihr</Text>
            <Text style={styles.form}>{ihr}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.pronoun}>sie/Sie</Text>
            <Text style={styles.form}>{sieSie}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
