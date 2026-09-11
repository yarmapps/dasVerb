import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { ThematicCategory } from '../../config/categories';
import { createStyles } from './ThematicCategoryCard.styles';

export interface ThematicCategoryCardProps {
  category: ThematicCategory;
  onPress: () => void;
}

export function ThematicCategoryCard({
  category,
  onPress,
}: ThematicCategoryCardProps): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { iconName, color, titleKey, id } = category;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.categoryCard}
      testID={`thematic-category-card-${id}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color.slice(0, 7)}20` }]}>
        <FontAwesome5 name={iconName} size={22} color={color} />
      </View>

      <Text style={styles.categoryName} numberOfLines={2}>
        {intl.formatMessage({ id: titleKey })}
      </Text>
    </TouchableOpacity>
  );
}
