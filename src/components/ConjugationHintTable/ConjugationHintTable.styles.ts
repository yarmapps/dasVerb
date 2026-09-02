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
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      padding: Spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
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
