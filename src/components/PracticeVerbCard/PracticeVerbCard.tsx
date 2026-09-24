import React, { useMemo, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { VerbProgressStatus } from '../../services/progressService';
import { createStyles } from './PracticeVerbCard.styles';

export interface PracticeVerbCardProps {
  infinitive: string;
  translation: string;
  level: string;
  globalIndex: number;
  status: VerbProgressStatus;
  isLocked?: boolean;
  onPress: (infinitive: string, level: string) => void;
  testID?: string;
}

function PracticeVerbCardComponent({
  infinitive,
  translation,
  level,
  globalIndex,
  status,
  isLocked = false,
  onPress,
  testID,
}: PracticeVerbCardProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = useCallback(() => {
    onPress(infinitive, level);
  }, [infinitive, level, onPress]);

  const renderStatusBadge = () => {
    if (isLocked) {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeUncompleted]}>
          <FontAwesome5 name="lock" size={14} color={colors.textMuted} />
        </View>
      );
    }

    switch (status) {
      case 'trophy':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeTrophy]}>
            <FontAwesome5 name="trophy" size={18} color="#FFD700" />
          </View>
        );
      case 'silver':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeSilver]}>
            <FontAwesome5 name="medal" size={18} color="#94A3B8" />
          </View>
        );
      case 'bronze':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeBronze]}>
            <FontAwesome5 name="medal" size={18} color="#CD7F32" />
          </View>
        );
      case 'uncompleted':
      default:
        return (
          <View style={[styles.statusBadge, styles.statusBadgeUncompleted]}>
            <Text style={styles.levelIndexText}>{globalIndex}</Text>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={styles.verbCard}
      activeOpacity={0.7}
      onPress={handlePress}
      testID={testID ?? `verb-practice-level-${infinitive}`}
    >
      {/* Status Badge (Circle / Medal / Trophy) */}
      {renderStatusBadge()}

      {/* Verb Details: Infinitive & Translation */}
      <View style={styles.verbInfo}>
        <Text style={styles.infinitiveText} numberOfLines={1}>
          {infinitive}
        </Text>
        <Text style={styles.translationText} numberOfLines={1}>
          {translation}
        </Text>
      </View>

      {/* Right Arrow */}
      <View style={styles.rightAction}>
        <FontAwesome5 name="chevron-right" size={14} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export const PracticeVerbCard = memo(PracticeVerbCardComponent);
