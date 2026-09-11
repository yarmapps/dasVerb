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
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xxl,
    },
    levelSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.xl,
      marginBottom: Spacing.md,
    },
    levelSectionFirst: {
      marginTop: Spacing.xs,
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
