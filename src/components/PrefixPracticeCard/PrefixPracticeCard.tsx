import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './PrefixPracticeCard.styles';

export interface PrefixPracticeCardProps {
  onPress: () => void;
}

export function PrefixPracticeCard({ onPress }: PrefixPracticeCardProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.cardContainer}
      testID="prefix-practice-card"
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name="puzzle-piece" size={16} color={colors.primary} />
      </View>
      <Text style={styles.title}>
        {intl.formatMessage({ id: 'practiceScreen.prefixBannerTitle' })}
      </Text>
      <Text style={styles.subtitle}>
        {intl.formatMessage({ id: 'practiceScreen.prefixBannerSubtitle' })}
      </Text>
    </TouchableOpacity>
  );
}
