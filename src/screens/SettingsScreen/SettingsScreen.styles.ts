import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
    },
    scrollContent: {
      paddingBottom: Spacing.xxl,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: Spacing.xl,
      marginBottom: Spacing.sm,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    sectionContainer: {
      backgroundColor: colors.blockBackground,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      backgroundColor: 'transparent',
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: Spacing.md,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: `${colors.primary}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
      overflow: 'hidden',
    },
    dangerIconContainer: {
      backgroundColor: '#EF444420',
    },
    rowLabel: {
      fontSize: Typography.fontSize.sm,
      color: colors.textPrimary,
      fontWeight: '500',
      flex: 1,
    },
    dangerRowLabel: {
      color: '#EF4444',
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowRightContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowValue: {
      fontSize: Typography.fontSize.sm,
      color: colors.textMutedInverted,
      marginRight: Spacing.xs,
    },
    separator: {
      height: 1,
      backgroundColor: colors.blockBorder,
      marginLeft: Spacing.lg + 32 + Spacing.md,
    },
    modeSegmentContainer: {
      flexDirection: 'row',
      backgroundColor: colors.headerButtonBackground,
      borderRadius: 12,
      padding: 3,
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    modeSegmentButton: {
      width: 36,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9,
    },
    modeSegmentButtonActive: {
      backgroundColor: colors.primary,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    versionText: {
      textAlign: 'center',
      fontSize: Typography.fontSize.xs,
      color: colors.textMuted,
      marginTop: Spacing.xl,
      marginBottom: Spacing.xl,
    },
  });
