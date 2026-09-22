import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: Spacing.xl,
      marginTop: Spacing.md,
      backgroundColor: colors.blockBackground,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      padding: Spacing.xl,
    },
    embeddedContainer: {
      marginTop: Spacing.lg,
      paddingTop: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.blockBorder,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    title: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    vowelChangeBadge: {
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    vowelChangeText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
      color: colors.primary,
    },
    grid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
    },
    column: {
      flex: 1,
      gap: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.blockBorder,
    },
    pronoun: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textMuted,
    },
    form: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
  });
