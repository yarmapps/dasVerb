import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './FeaturedStartCard.styles';

export interface FeaturedStartCardProps {
  onPress: () => void;
}

export function FeaturedStartCard({ onPress }: FeaturedStartCardProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.featuredCard}
      testID="featured-practice-card"
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary || '#7c4dff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featuredBackground}
      />
      <View>
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>
            {intl.formatMessage({ id: 'practiceScreen.featuredBadge' })}
          </Text>
        </View>
        <Text style={styles.featuredTitle}>
          {intl.formatMessage({ id: 'practiceScreen.levelsButtonTitle' })}
        </Text>
        <Text style={styles.featuredSubtitle} numberOfLines={3}>
          {intl.formatMessage({ id: 'practiceScreen.levelsButtonSubtitle' })}
        </Text>
      </View>
      <View style={styles.startButton}>
        <FontAwesome5 name="play-circle" size={14} color={colors.primary} solid />
        <Text style={styles.startButtonText}>
          {intl.formatMessage({ id: 'practiceScreen.startNow' })}
        </Text>
      </View>
      <View style={styles.decorativeIconContainer}>
        <FontAwesome5 name="layer-group" size={90} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}
