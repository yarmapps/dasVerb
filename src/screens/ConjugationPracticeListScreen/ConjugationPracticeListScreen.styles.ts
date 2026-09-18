import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.blockBorder,
      gap: Spacing.sm,
    },
    tabButton: {
      flex: 1,
      paddingVertical: Spacing.sm,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.blockBackground,
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    tabButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    listContent: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.xxl,
    },
    levelCard: {
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
      marginRight: Spacing.md,
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
      backgroundColor: '#EAB30818',
      borderColor: '#EAB308',
    },
    levelNumberText: {
      fontSize: Typography.fontSize.md,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    levelInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    levelTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    levelTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    verbsText: {
      fontSize: Typography.fontSize.xs,
      color: colors.textSecondary,
      lineHeight: 17,
    },
  });
}
