import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    cardContainer: {
      backgroundColor: colors.blockBackground,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      padding: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.full,
      backgroundColor: `${colors.primary}18`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: Spacing.sm,
    },
    title: {
      color: colors.textPrimary,
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.bold,
      marginBottom: 2,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.xs,
      lineHeight: 16,
    },
    actionArrow: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.headerButtonBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
