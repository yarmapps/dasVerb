import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    cardContainer: {
      flex: 1,
      backgroundColor: colors.blockBackground,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      padding: Spacing.lg,
      justifyContent: 'flex-start',
      minHeight: 145,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      backgroundColor: `${colors.primary}18`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    title: {
      color: colors.textPrimary,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      marginBottom: 4,
      lineHeight: 18,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.xs,
      lineHeight: 16,
    },
  });
