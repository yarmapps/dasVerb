import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    verbCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.blockBackground,
      borderRadius: BorderRadius.xl,
      height: 70,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    statusBadge: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.lg,
      borderWidth: 1.5,
    },
    statusBadgeUncompleted: {
      backgroundColor: colors.background,
      borderColor: colors.blockBorder,
    },
    statusBadgeBronze: {
      backgroundColor: '#CD7F3218',
      borderColor: '#CD7F32',
    },
    statusBadgeSilver: {
      backgroundColor: '#94A3B818',
      borderColor: '#94A3B8',
    },
    statusBadgeTrophy: {
      backgroundColor: '#FFD70020',
      borderColor: '#FFD700',
    },
    levelIndexText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '700',
      color: colors.textMuted,
    },
    verbInfo: {
      flex: 1,
      justifyContent: 'center',
      marginRight: Spacing.sm,
    },
    infinitiveText: {
      fontSize: Typography.fontSize.md,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 3,
    },
    translationText: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    rightAction: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: Spacing.xs,
    },
  });
