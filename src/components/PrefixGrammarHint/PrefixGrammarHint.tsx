import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { FontAwesome5 } from '@expo/vector-icons';
import { PrefixGrammarHintData } from '../../services/quizGeneratorService';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './PrefixGrammarHint.styles';

export interface PrefixGrammarHintProps {
  hint: PrefixGrammarHintData;
  embedded?: boolean;
}

export function PrefixGrammarHint({
  hint,
  embedded = false,
}: PrefixGrammarHintProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const typeTitleKey = useMemo(() => {
    switch (hint.prefixType) {
      case 'separable':
        return 'prefixGrammarHint.separableTitle';
      case 'inseparable':
        return 'prefixGrammarHint.inseparableTitle';
      case 'dual':
      default:
        return 'prefixGrammarHint.dualTitle';
    }
  }, [hint.prefixType]);

  const prefixDisplay = hint.prefix ? `${hint.prefix}-` : '';

  return (
    <View
      style={embedded ? styles.embeddedContainer : styles.container}
      testID="prefix-grammar-hint"
    >
      <View style={styles.headerRow}>
        <View style={styles.prefixInfoLeft}>
          <FontAwesome5 name="info-circle" size={14} color={colors.primary} />
          {prefixDisplay ? (
            <View style={styles.prefixBadge}>
              <Text style={styles.prefixBadgeText}>{prefixDisplay}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>{intl.formatMessage({ id: typeTitleKey })}</Text>
        </View>
      </View>
      <Text style={styles.explanationText}>
        {intl.formatMessage({ id: hint.ruleExplanationKey })}
      </Text>
    </View>
  );
}
