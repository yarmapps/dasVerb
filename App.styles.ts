import { StyleSheet } from 'react-native';
import { ThemeColors } from './src/styles/themeColors';
import { Spacing, BorderRadius } from './src/styles/spacing';
import { Typography } from './src/styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: Spacing.xl,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerBadge: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.primaryLight,
      marginBottom: Spacing.md,
    },
    headerBadgeText: {
      color: colors.primary,
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      fontSize: Typography.fontSize.display,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: Typography.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xxl,
      lineHeight: 22,
    },
    card: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    cardTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semiBold,
      color: colors.textPrimary,
      marginBottom: Spacing.sm,
    },
    cardDescription: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });
