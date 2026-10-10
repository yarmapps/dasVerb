import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../../styles/themeColors';
import { Spacing } from '../../../styles/spacing';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    cardContainer: {
      backgroundColor: colors.blockBackground,
      borderColor: colors.blockBorder,
      borderWidth: 1,
      borderRadius: 16,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      width: '100%',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.headerButtonBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.sm + 2,
    },
    textColumn: {
      flex: 1,
    },
    titleText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    descText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    freezeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.primary,
      paddingVertical: Spacing.sm + 2,
      paddingHorizontal: Spacing.md,
      borderRadius: 14,
      marginTop: Spacing.sm,
      minHeight: 50,
    },
    freezeButtonDisabled: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    freezeButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: Spacing.xs,
    },
    freezeButtonTextDisabled: {
      color: colors.textSecondary,
      fontWeight: '600',
    },
    iconSpacer: {
      width: 18,
    },
  });
