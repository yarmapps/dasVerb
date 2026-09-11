import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    cardContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.blockBackground,
      borderRadius: BorderRadius.xl,
      height: 76,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1.5,
      borderColor: `${colors.primary}40`,
    },
    cardContainerFinal: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}0D`,
    },
    badge: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
      backgroundColor: `${colors.primary}15`,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    badgeIntermediary: {
      backgroundColor: `${colors.primary}0A`,
      borderColor: `${colors.primary}60`,
      borderStyle: 'dashed',
    },
    badgeTrophy: {
      backgroundColor: '#FFD70020',
      borderColor: '#FFD700',
      borderStyle: 'solid',
    },
    badgeSilver: {
      backgroundColor: '#94A3B820',
      borderColor: '#94A3B8',
      borderStyle: 'solid',
    },
    badgeBronze: {
      backgroundColor: '#CD7F3220',
      borderColor: '#CD7F32',
      borderStyle: 'solid',
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
      marginRight: Spacing.sm,
    },
    title: {
      fontSize: Typography.fontSize.md,
      fontWeight: '700',
      color: colors.primary,
    },
    titleFinal: {
      fontWeight: '800',
    },
    subtitle: {
      fontSize: Typography.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 16,
    },
    actionArrow: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.headerButtonBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
