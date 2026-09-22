import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './VerbFormsPracticeCard.styles';

export interface VerbFormsPracticeCardProps {
  onPress: () => void;
}

export function VerbFormsPracticeCard({ onPress }: VerbFormsPracticeCardProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.cardContainer}
      testID="verb-forms-practice-card"
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name="history" size={18} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {intl.formatMessage({ id: 'practiceScreen.verbFormsBannerTitle' })}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {intl.formatMessage({ id: 'practiceScreen.verbFormsBannerSubtitle' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
