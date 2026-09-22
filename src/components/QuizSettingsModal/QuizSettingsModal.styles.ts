import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.blockBackground,
      borderRadius: 20,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.blockBorder,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    headerTitle: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.headerButtonBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.md,
      minHeight: 52,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: Spacing.md,
    },
    iconContainer: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    rowLabel: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.textPrimary,
      flex: 1,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
