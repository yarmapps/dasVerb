import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.xxl,
    },
    levelSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.xl,
      marginBottom: Spacing.md,
    },
    levelSectionFirst: {
      marginTop: Spacing.sm,
    },
    levelSectionBadge: {
      paddingHorizontal: Spacing.md,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: colors.primary,
      marginRight: Spacing.md,
    },
    levelSectionBadgeText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.8,
    },
    levelDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.blockBorder,
    },
    levelCountText: {
      fontSize: Typography.fontSize.xs,
      color: colors.textMuted,
      marginLeft: Spacing.md,
      fontWeight: '500',
    },
    verbCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.blockBackground,
      borderRadius: 16,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    statusBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
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
      backgroundColor: '#F59E0B18',
      borderColor: '#F59E0B',
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
    scoreText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
      marginRight: Spacing.xs,
    },
    scoreTextTrophy: {
      color: '#F59E0B',
    },
    scoreTextDefault: {
      color: colors.primary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing.xxl,
    },
    emptyText: {
      fontSize: Typography.fontSize.md,
      color: colors.textSecondary,
      marginTop: Spacing.md,
    },
  });
