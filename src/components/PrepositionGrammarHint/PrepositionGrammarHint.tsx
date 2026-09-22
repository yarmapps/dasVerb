import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { FontAwesome5 } from '@expo/vector-icons';
import { PrepositionGrammarHintData } from '../../services/quizGeneratorService';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './PrepositionGrammarHint.styles';

export interface PrepositionGrammarHintProps {
  hint: PrepositionGrammarHintData;
  embedded?: boolean;
}

export function PrepositionGrammarHint(props: PrepositionGrammarHintProps): React.JSX.Element {
  const { hint, embedded = false } = props;
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { infinitive, preposition, prepositionCase, questions } = hint;
  const badgeLabel = `${preposition} + ${prepositionCase}`;

  return (
    <View
      style={embedded ? styles.embeddedContainer : styles.container}
      testID="preposition-grammar-hint"
    >
      <View style={styles.headerRow}>
        <View style={styles.infoLeft}>
          <FontAwesome5 name="info-circle" size={14} color={colors.primary} />
          <View style={styles.prepBadge}>
            <Text style={styles.prepBadgeText}>{badgeLabel}</Text>
          </View>
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>
            {intl.formatMessage({ id: 'prepositionGrammarHint.ruleTag' })}
          </Text>
        </View>
      </View>

      <View style={styles.ruleRow}>
        <Text style={styles.ruleMainText}>
          {infinitive} {preposition} + {prepositionCase}
        </Text>
      </View>

      {questions ? (
        <View style={styles.questionsRow}>
          <Text style={styles.questionLabel}>
            {intl.formatMessage({ id: 'prepositionGrammarHint.questionLabel' })}
          </Text>
          <Text style={styles.questionsText}>{questions}</Text>
        </View>
      ) : null}
    </View>
  );
}
