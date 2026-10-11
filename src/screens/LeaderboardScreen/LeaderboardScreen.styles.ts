import { StyleSheet } from 'react-native';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';
import { ThemeColors } from '../../styles/themeColors';

export const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentWrapper: {
      flex: 1,
      paddingHorizontal: Spacing.md,
    },

    // Segmented Tabs
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.blockBackground,
      borderRadius: 16,
      padding: 4,
      marginVertical: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    tabItem: {
      flex: 1,
      paddingVertical: Spacing.sm,
      paddingHorizontal: 4,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    activeTabItem: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    activeTabText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    // Podium Section
    podiumContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginVertical: Spacing.md,
      gap: 10,
    },
    podiumCard: {
      flex: 1,
      alignItems: 'center',
      borderRadius: 16,
      padding: Spacing.sm,
      backgroundColor: colors.blockBackground,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      minHeight: 110,
      justifyContent: 'center',
    },
    firstPlaceCard: {
      paddingBottom: Spacing.md + 4,
      borderColor: '#FFD700',
      backgroundColor: isDark ? '#2A2400' : '#FFFDF0',
      minHeight: 130,
    },
    medalBadge: {
      fontSize: 26,
      marginBottom: 4,
    },
    podiumName: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 1,
    },
    podiumScore: {
      fontSize: Typography.fontSize.xxs,
      color: colors.textSecondary,
      fontWeight: '600',
      marginTop: 4,
    },

    // Leaderboard List
    list: {
      flex: 1,
    },
    listContainer: {
      flex: 1,
    },
    listContent: {
      paddingTop: Spacing.sm + 4,
      paddingBottom: Spacing.sm,
    },
    rankRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.blockBackground,
      borderRadius: 12,
      paddingVertical: Spacing.sm + 2,
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.xs + 2,
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    currentUserRow: {
      borderColor: colors.primary,
      backgroundColor: isDark ? '#1C2938' : '#F0F7FF',
    },
    highestScoreRow: {
      borderColor: '#FFD700',
      backgroundColor: isDark ? '#2A2400' : '#FFFDF0',
      marginTop: Spacing.md,
      marginBottom: Spacing.md + 3,
    },
    highestScoreBadgeContainer: {
      position: 'absolute',
      top: -10,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    highestScoreBadge: {
      backgroundColor: '#FFD700',
      paddingHorizontal: Spacing.xs + 2,
      paddingVertical: 2,
      borderRadius: 8,
    },
    highestScoreBadgeText: {
      color: '#1A1A1A',
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    rankNumber: {
      minWidth: 44,
      marginRight: Spacing.xs + 2,
      fontSize: Typography.fontSize.xxs,
      fontWeight: '600',
      color: colors.textMuted,
    },
    userNameContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    userName: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    userScore: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    historyMonthText: {
      marginRight: Spacing.sm,
      fontSize: Typography.fontSize.xxs,
      fontWeight: '600',
      color: colors.textMuted,
    },
    youPill: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: Spacing.xs,
    },
    youPillText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },

    // Sticky Bottom Bar
    stickyBottomBar: {
      marginTop: Spacing.xs,
      marginBottom: Spacing.xs,
    },
    skippedEllipsisContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xs + 2,
    },
    skippedEllipsisText: {
      fontSize: Typography.fontSize.sm,
      color: colors.textMuted,
      letterSpacing: 4,
      fontWeight: '600',
    },
    footerCountContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xs,
      marginBottom: Spacing.xs,
    },
    participantCountText: {
      fontSize: Typography.fontSize.xxs,
      color: colors.textMuted,
      fontWeight: '500',
    },

    // Empty State
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xxl,
    },
    emptyIconContainer: {
      marginBottom: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: Spacing.xl,
    },
  });
