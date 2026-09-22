import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export interface ThematicCategoryCardStyles {
  categoryCard: ViewStyle;
  iconContainer: ViewStyle;
  categoryName: TextStyle;
}

export function createStyles(colors: ThemeColors): ThematicCategoryCardStyles {
  return StyleSheet.create<ThematicCategoryCardStyles>({
    categoryCard: {
      width: '48%',
      backgroundColor: colors.blockBackground,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    categoryName: {
      color: colors.textPrimary,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semiBold,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
}
