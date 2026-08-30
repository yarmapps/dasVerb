import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.xl * 3) / 2; // 2 columns with padding

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.md,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: Spacing.xl,
    },
    languageCard: {
      width: CARD_WIDTH,
      backgroundColor: colors.blockBackground,
      borderRadius: 16,
      padding: Spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.blockBorder,
    },
    languageCardSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}20`,
    },
    flag: {
      fontSize: 48,
      marginBottom: Spacing.sm,
    },
    languageName: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semiBold,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    languageNameSelected: {
      color: colors.textPrimary,
    },
    buttonContainer: {
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.xl,
    },
    continueButton: {
      backgroundColor: colors.primary,
      paddingVertical: Spacing.lg,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    continueButtonDisabled: {
      backgroundColor: colors.blockBackground,
      opacity: 0.7,
      shadowOpacity: 0,
      elevation: 0,
    },
    continueButtonText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: '#FFFFFF',
    },
  });
