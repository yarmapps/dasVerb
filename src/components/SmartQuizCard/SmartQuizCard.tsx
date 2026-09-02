import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './SmartQuizCard.styles';

export interface SmartQuizCardProps {
  onPress: () => void;
}

export function SmartQuizCard({ onPress }: SmartQuizCardProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.cardContainer}
      testID="smart-quiz-card"
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name="bullseye" size={20} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {intl.formatMessage({ id: 'practiceScreen.smartQuizTitle' })}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {intl.formatMessage({ id: 'practiceScreen.smartQuizSubtitle' })}
        </Text>
      </View>
      <View style={styles.actionArrow}>
        <FontAwesome5 name="chevron-right" size={14} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}
