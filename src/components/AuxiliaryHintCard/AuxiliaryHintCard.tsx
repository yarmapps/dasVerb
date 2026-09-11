import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { AuxiliaryVerb } from '../../../docs/verb.types';
import { createStyles } from './AuxiliaryHintCard.styles';

interface AuxiliaryHintCardProps {
  infinitive: string;
  auxiliary: AuxiliaryVerb;
  correctForm: string;
  embedded?: boolean;
}

export function AuxiliaryHintCard({
  infinitive,
  auxiliary,
  correctForm,
  embedded = false,
}: AuxiliaryHintCardProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const explanationMessage =
    auxiliary === 'sein'
      ? intl.formatMessage(
          { id: 'verbQuizScreen.auxiliaryExplanationMovement' },
          { verb: infinitive, form: correctForm },
        )
      : intl.formatMessage(
          { id: 'verbQuizScreen.auxiliaryExplanationGeneral' },
          { verb: infinitive, form: correctForm },
        );

  return (
    <View
      style={embedded ? styles.embeddedContainer : styles.container}
      testID="auxiliary-hint-card"
    >
      <View style={styles.header}>
        <Ionicons name="information-circle" size={16} color={colors.primary} />
        <Text style={styles.title}>Perfekt · {auxiliary === 'sein' ? 'sein' : 'haben'}</Text>
      </View>
      <Text style={styles.explanationText}>{explanationMessage}</Text>
    </View>
  );
}
