import { StyleSheet } from 'react-native';

export const createStyles = () =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 42,
      left: -100,
      right: -100,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
    },
    arrow: {
      width: 0,
      height: 0,
      borderLeftWidth: 6,
      borderRightWidth: 6,
      borderBottomWidth: 7,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      alignSelf: 'center',
      marginBottom: -1,
    },
    bubble: {
      minWidth: 72,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 12,
    },
    text: {
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'center',
    },
  });
