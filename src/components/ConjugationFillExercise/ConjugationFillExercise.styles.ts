import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingVertical: 2,
      width: '100%',
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 5,
      minHeight: 34,
    },
    pronounContainer: {
      width: 78,
      justifyContent: 'center',
      paddingRight: Spacing.xs,
    },
    pronounText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    pronounTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    slotWrapper: {
      flex: 1,
      alignItems: 'flex-end',
    },
    gapSlot: {
      width: 156,
      maxWidth: '100%',
      height: 34,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xs,
      borderWidth: 1.5,
      borderColor: `${colors.primary}35`,
      backgroundColor: 'transparent',
    },
    gapSlotActive: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}18`,
    },
    gapSlotFilled: {
      backgroundColor: `${colors.primary}12`,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    gapSlotCorrect: {
      backgroundColor: '#10B98120',
      borderWidth: 1.5,
      borderColor: '#10B981',
    },
    gapSlotIncorrect: {
      backgroundColor: '#EF444418',
      borderWidth: 1.5,
      borderColor: '#EF4444',
    },
    gapSlotText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },
    gapSlotTextCorrect: {
      color: '#10B981',
    },
    gapSlotTextIncorrect: {
      color: '#EF4444',
      textDecorationLine: 'line-through',
    },
    reflexiveContainer: {
      width: 48,
      justifyContent: 'center',
      paddingLeft: Spacing.xs,
    },
    reflexiveText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
  });
}
