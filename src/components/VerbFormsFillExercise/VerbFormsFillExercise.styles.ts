import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing, BorderRadius } from '../../styles/spacing';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 20,
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.xl,
      alignItems: 'center',
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    infinitiveText: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    formContainer: {
      width: '100%',
    },
    formBlock: {
      marginBottom: Spacing.md,
    },
    formBlockLast: {
      marginBottom: Spacing.none,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.xs,
    },
    labelText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      color: colors.textSecondary,
      letterSpacing: 0.8,
    },
    slotWrapper: {
      width: '100%',
    },
    slot: {
      height: 48,
      borderRadius: BorderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      borderWidth: 1.5,
      borderColor: `${colors.primary}35`,
      backgroundColor: colors.background,
    },
    slotActive: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}15`,
    },
    slotFilled: {
      backgroundColor: `${colors.primary}10`,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    slotCorrect: {
      backgroundColor: '#10B98118',
      borderWidth: 1.5,
      borderColor: '#10B981',
    },
    slotIncorrect: {
      backgroundColor: '#EF444415',
      borderWidth: 1.5,
      borderColor: '#EF4444',
    },
    slotText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },
    slotTextCorrect: {
      color: '#10B981',
    },
    slotTextIncorrect: {
      color: '#EF4444',
      textDecorationLine: 'line-through',
    },
    perfektRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.sm,
    },
    auxSlotWrapper: {
      width: 90,
    },
    partizipSlotWrapper: {
      flex: 1,
    },
  });
}
