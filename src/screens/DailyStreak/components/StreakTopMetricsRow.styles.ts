import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../../styles/themeColors';
import { Spacing } from '../../../styles/spacing';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      gap: Spacing.sm,
      width: '100%',
      marginBottom: Spacing.md,
    },
    metricCard: {
      flex: 1,
      backgroundColor: colors.blockBackground,
      borderColor: colors.blockBorder,
      borderWidth: 1,
      borderRadius: 16,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xs,
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 104,
    },
    topContent: {
      alignItems: 'center',
      width: '100%',
    },
    iconWrapper: {
      marginBottom: Spacing.xs,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    valueText: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    labelContainer: {
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
      flex: 1,
      marginTop: Spacing.xs,
    },
    labelText: {
      fontSize: 10,
      lineHeight: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
