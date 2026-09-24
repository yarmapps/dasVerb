import React, { useMemo, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { VerbProgressStatus } from '../../services/progressService';
import { createStyles } from './PracticeCheckpointCard.styles';

export interface PracticeCheckpointCardProps {
  title: string;
  subtitle?: string;
  status: VerbProgressStatus;
  isFinal?: boolean;
  isLocked?: boolean;
  onPress: () => void;
  testID?: string;
}

function PracticeCheckpointCardComponent({
  title,
  subtitle,
  status,
  isFinal = false,
  isLocked = false,
  onPress,
  testID,
}: PracticeCheckpointCardProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderBadge = () => {
    if (isLocked) {
      return (
        <View style={[styles.badge, styles.badgeIntermediary]}>
          <FontAwesome5 name="lock" size={16} color={colors.textMuted} />
        </View>
      );
    }

    switch (status) {
      case 'trophy':
        return (
          <View style={[styles.badge, styles.badgeTrophy]}>
            <FontAwesome5 name="trophy" size={18} color="#FFD700" />
          </View>
        );
      case 'silver':
        return (
          <View style={[styles.badge, styles.badgeSilver]}>
            <FontAwesome5 name="medal" size={18} color="#94A3B8" />
          </View>
        );
      case 'bronze':
        return (
          <View style={[styles.badge, styles.badgeBronze]}>
            <FontAwesome5 name="medal" size={18} color="#CD7F32" />
          </View>
        );
      case 'uncompleted':
      default:
        return (
          <View style={[styles.badge, !isFinal && styles.badgeIntermediary]}>
            <FontAwesome5
              name={isFinal ? 'flag-checkered' : 'flag'}
              size={isFinal ? 20 : 16}
              color={colors.primary}
            />
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.cardContainer, isFinal && styles.cardContainerFinal]}
      activeOpacity={0.7}
      onPress={onPress}
      testID={testID}
    >
      {renderBadge()}

      <View style={styles.textContainer}>
        <Text style={[styles.title, isFinal && styles.titleFinal]} numberOfLines={1}>
          {title}
        </Text>
        {Boolean(subtitle) && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.actionArrow}>
        <FontAwesome5 name="chevron-right" size={14} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

export const PracticeCheckpointCard = memo(PracticeCheckpointCardComponent);
