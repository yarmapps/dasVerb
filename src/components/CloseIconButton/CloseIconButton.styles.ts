import { StyleSheet, ViewStyle } from 'react-native';

export interface CloseIconButtonStyles {
  closeButton: ViewStyle;
}

export const createStyles = (): CloseIconButtonStyles =>
  StyleSheet.create({
    closeButton: {
      position: 'absolute',
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
  });
