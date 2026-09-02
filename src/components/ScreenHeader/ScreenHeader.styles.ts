import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../styles/themeColors';
import { Spacing } from '../../styles/spacing';
import { Typography } from '../../styles/typography';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerContainer: {
      width: '100%',
      paddingBottom: Spacing.md,
    },
    headerContent: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
      height: 48,
      width: '100%',
    },
    leftContainer: {
      position: 'absolute',
      left: Spacing.xl,
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    centerContainer: {
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 48,
    },
    rightContainer: {
      position: 'absolute',
      right: Spacing.xl,
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: Spacing.sm,
      zIndex: 2,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.headerButtonBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.headerButtonBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      includeFontPadding: false,
    },
  });
