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
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.headerButtonBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.xs,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.xl,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xxl,
      paddingVertical: Spacing.xxl,
    },
    emptyText: {
      marginTop: Spacing.md,
      fontSize: Typography.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    resultItem: {
      backgroundColor: colors.blockBackground,
      borderRadius: 14,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    wordLeft: {
      flex: 1,
      marginRight: Spacing.sm,
    },
    wordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 5,
      marginBottom: 4,
    },
    infinitiveText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    highlightText: {
      color: colors.primary,
      fontWeight: '800',
    },
    rektionBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 5,
    },
    rektionBadgeAkkusativ: {
      backgroundColor: `${colors.primary}18`,
    },
    rektionBadgeTextAkkusativ: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    rektionBadgeDativ: {
      backgroundColor: `${colors.secondary}18`,
    },
    rektionBadgeTextDativ: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.secondary,
    },
    rektionBadgeGenitiv: {
      backgroundColor: `${colors.tertiary}18`,
    },
    rektionBadgeTextGenitiv: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.tertiary,
    },
    formsRow: {
      marginBottom: 3,
    },
    formsText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    translationText: {
      fontSize: Typography.fontSize.sm,
      color: colors.textSecondary,
    },
    arrowContainer: {
      marginLeft: Spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
