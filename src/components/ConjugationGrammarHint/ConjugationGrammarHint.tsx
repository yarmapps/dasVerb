import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { FontAwesome5 } from '@expo/vector-icons';
import { ConjugationGrammarHintData } from '../../services/quizGeneratorService';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './ConjugationGrammarHint.styles';

export interface ConjugationGrammarHintProps {
  hint: ConjugationGrammarHintData;
  embedded?: boolean;
}

export function ConjugationGrammarHint({
  hint,
  embedded = false,
}: ConjugationGrammarHintProps): React.JSX.Element | null {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { rootVowelChange, ruleExplanationKey } = hint;
  if (!rootVowelChange || !ruleExplanationKey) {
    return null;
  }

  return (
    <View
      style={embedded ? styles.embeddedContainer : styles.container}
      testID="conjugation-grammar-hint"
    >
      <View style={styles.headerRow}>
        <View style={styles.infoLeft}>
          <FontAwesome5 name="info-circle" size={14} color={colors.primary} />
          <View style={styles.vowelBadge}>
            <Text style={styles.vowelBadgeText}>{rootVowelChange}</Text>
          </View>
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>
            {intl.formatMessage({ id: 'conjugationGrammarHint.ruleTag' })}
          </Text>
        </View>
      </View>
      <Text style={styles.explanationText}>{intl.formatMessage({ id: ruleExplanationKey })}</Text>
    </View>
  );
}
