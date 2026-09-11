import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { THEMATIC_CATEGORIES, ThematicCategory } from '../../config/categories';
import { ThematicCategoryCard } from '../ThematicCategoryCard/ThematicCategoryCard';
import { createStyles } from './ThematicCategoriesSection.styles';

export interface ThematicCategoriesSectionProps {
  onSelectCategory: (category: ThematicCategory) => void;
}

export function ThematicCategoriesSection({
  onSelectCategory,
}: ThematicCategoriesSectionProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container} testID="thematic-categories-section">
      <View style={styles.categoriesGrid}>
        {THEMATIC_CATEGORIES.map(category => (
          <ThematicCategoryCard
            key={category.id}
            category={category}
            onPress={() => onSelectCategory(category)}
          />
        ))}
      </View>
    </View>
  );
}
