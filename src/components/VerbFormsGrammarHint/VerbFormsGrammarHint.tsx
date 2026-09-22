import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { FontAwesome5 } from '@expo/vector-icons';
import { VerbFormsGrammarHintData } from '../../services/quizGeneratorService';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './VerbFormsGrammarHint.styles';

export interface VerbFormsGrammarHintProps {
  hint: VerbFormsGrammarHintData;
  embedded?: boolean;
}

export function VerbFormsGrammarHint({
  hint,
  embedded = false,
}: VerbFormsGrammarHintProps): React.JSX.Element | null {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { verbClass, rootVowelPattern, ruleExplanationKey } = hint;

  if (!ruleExplanationKey && !rootVowelPattern) {
    return null;
  }

  const getVerbClassTag = (vClass: string): string => {
    switch (vClass) {
      case 'strong':
        return intl.formatMessage({ id: 'verbFormsGrammarHint.strongVerbTag' });
      case 'weak':
        return intl.formatMessage({ id: 'verbFormsGrammarHint.weakVerbTag' });
      case 'mixed':
        return intl.formatMessage({ id: 'verbFormsGrammarHint.mixedVerbTag' });
      case 'irregular':
        return intl.formatMessage({ id: 'verbFormsGrammarHint.irregularVerbTag' });
      case 'modal':
        return intl.formatMessage({ id: 'verbFormsGrammarHint.modalVerbTag' });
      default:
        return vClass.toUpperCase();
    }
  };

  return (
    <View
      style={embedded ? styles.embeddedContainer : styles.container}
      testID="verb-forms-grammar-hint"
    >
      <View style={styles.headerRow}>
        <View style={styles.infoLeft}>
          <FontAwesome5 name="info-circle" size={14} color={colors.primary} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getVerbClassTag(verbClass)}</Text>
          </View>
          {rootVowelPattern ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rootVowelPattern}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>
            {intl.formatMessage({ id: 'verbFormsGrammarHint.ruleTag' })}
          </Text>
        </View>
      </View>

      {ruleExplanationKey ? (
        <Text style={styles.explanationText}>{intl.formatMessage({ id: ruleExplanationKey })}</Text>
      ) : null}
    </View>
  );
}
