import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../../styles/themeColors';
import { Spacing } from '../../../styles/spacing';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sectionContainer: {
      marginBottom: Spacing.xl,
      width: '100%',
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    milestonesColumn: {
      gap: Spacing.sm,
    },
    milestoneCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.blockBackground,
      borderRadius: 12,
      padding: Spacing.sm + 2,
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    unlockedCard: {
      borderColor: colors.primary,
    },
    iconWrapper: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.headerButtonBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.sm + 2,
    },
    infoColumn: {
      flex: 1,
    },
    milestoneTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 1,
    },
    milestoneDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    progressBarBackground: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.headerButtonBackground,
      overflow: 'hidden',
      width: '100%',
    },
    progressBarFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
  });
