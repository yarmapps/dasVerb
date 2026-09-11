import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, Typography } from '../../styles/variables';

export const ICON_BADGE_SIZE = 48;

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    rail: {
      width: ICON_BADGE_SIZE,
      alignItems: 'center',
    },
    iconBadge: {
      width: ICON_BADGE_SIZE,
      height: ICON_BADGE_SIZE,
      borderRadius: ICON_BADGE_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBadgeBordered: {
      borderWidth: 1.5,
    },
    connector: {
      flex: 1,
      width: 2,
      marginTop: 4,
      marginBottom: 4,
      borderRadius: 1,
    },
    content: {
      flex: 1,
      paddingLeft: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    day: {
      color: colors.textDisabled,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: Spacing.xs,
    },
    headline: {
      color: colors.textPrimary,
      fontSize: Typography.fontSize.md,
      fontWeight: '800',
      marginBottom: Spacing.xs,
    },
    subline: {
      color: colors.textPrimary,
      fontSize: Typography.fontSize.xs,
      fontWeight: '700',
      marginBottom: Spacing.xs,
    },
    description: {
      color: colors.textSecondary,
      fontSize: Typography.fontSize.xs,
      lineHeight: 18,
    },
    extra: {
      marginTop: Spacing.xxl,
    },
  });
