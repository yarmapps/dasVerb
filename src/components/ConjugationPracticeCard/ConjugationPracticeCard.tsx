import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './ConjugationPracticeCard.styles';

export interface ConjugationPracticeCardProps {
  onPress: () => void;
}

export function ConjugationPracticeCard({
  onPress,
}: ConjugationPracticeCardProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.cardContainer}
      testID="conjugation-practice-card"
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name="layer-group" size={16} color={colors.primary} />
      </View>
      <Text style={styles.title}>
        {intl.formatMessage({ id: 'practiceScreen.conjugationBannerTitle' })}
      </Text>
      <Text style={styles.subtitle}>
        {intl.formatMessage({ id: 'practiceScreen.conjugationBannerSubtitle' })}
      </Text>
    </TouchableOpacity>
  );
}
