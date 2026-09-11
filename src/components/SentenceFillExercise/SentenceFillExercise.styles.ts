import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    sentenceRow: {
      paddingHorizontal: 20,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    regularWord: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.textPrimary,
      marginHorizontal: 3,
      marginVertical: 4,
    },
    punctuationText: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.textPrimary,
      marginLeft: -1,
      marginRight: 3,
      marginVertical: 4,
    },
    atomicSlotGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    gapSlot: {
      minWidth: 64,
      height: 38,
      borderRadius: 8,
      marginHorizontal: 3,
      marginVertical: 4,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      borderWidth: 1.5,
      borderColor: `${colors.primary}40`,
      backgroundColor: 'transparent',
    },
    gapSlotActive: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}18`,
    },
    gapSlotFilled: {
      backgroundColor: `${colors.primary}15`,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    gapSlotCorrect: {
      backgroundColor: '#10B98122',
      borderWidth: 1.5,
      borderColor: '#10B981',
    },
    gapSlotIncorrect: {
      backgroundColor: '#EF444422',
      borderWidth: 1.5,
      borderColor: '#EF4444',
    },
    gapSlotText: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },
    gapSlotTextCorrect: {
      color: '#10B981',
    },
    gapSlotTextIncorrect: {
      color: '#EF4444',
    },
  });
}
