import { StyleSheet } from 'react-native';
import { ThemeColors } from '../styles/themeColors';
import { Typography } from '../styles/typography';

export const createStyles = (colors: ThemeColors, tabBarHeight: number, bottomPadding: number) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.blockBackground,
      borderTopColor: colors.blockBorder,
      borderTopWidth: 1,
      height: tabBarHeight,
      paddingBottom: bottomPadding,
      paddingTop: 8,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    tabIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabBarLabel: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.semiBold,
      marginTop: 4,
    },
  });
