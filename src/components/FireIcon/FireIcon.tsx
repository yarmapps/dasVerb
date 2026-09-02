import React from 'react';
import { View } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { createStyles } from './FireIcon.styles';

export interface FireIconProps {
  size?: number;
  isActive?: boolean;
  inactiveColor?: string;
}

export function FireIcon({
  size = 18,
  isActive = true,
  inactiveColor = '#64748B',
}: FireIconProps): React.JSX.Element {
  const styles = createStyles();

  if (!isActive) {
    return (
      <View style={styles.container} testID="fire-icon-inactive">
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22C16.4183 22 20 18.4183 20 14C20 10.5 17.8 7.5 15.8 5.6C15.3 5.1 14.4 5.4 14.5 6.1C14.7 7.5 13.8 8.8 12.3 8.8C10.8 8.8 9.6 7.5 9.8 6.1C10 4.3 11.2 2.8 12.1 1.5C12.5 0.9 11.9 0.1 11.1 0.4C7.4 1.5 4 5.3 4 11C4 17.0751 7.58172 22 12 22Z"
            fill={inactiveColor}
          />
        </Svg>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="fire-icon-active">
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
          <LinearGradient id="fireOuterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFF44F" />
            <Stop offset="30%" stopColor="#FF7A00" />
            <Stop offset="70%" stopColor="#FF2E00" />
            <Stop offset="100%" stopColor="#CC0000" />
          </LinearGradient>
          <LinearGradient id="fireInnerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="40%" stopColor="#FFEE55" />
            <Stop offset="100%" stopColor="#FF9900" />
          </LinearGradient>
        </Defs>
        {/* Outer Flame */}
        <Path
          d="M12 22C16.4183 22 20 18.4183 20 14C20 10.5 17.8 7.5 15.8 5.6C15.3 5.1 14.4 5.4 14.5 6.1C14.7 7.5 13.8 8.8 12.3 8.8C10.8 8.8 9.6 7.5 9.8 6.1C10 4.3 11.2 2.8 12.1 1.5C12.5 0.9 11.9 0.1 11.1 0.4C7.4 1.5 4 5.3 4 11C4 17.0751 7.58172 22 12 22Z"
          fill="url(#fireOuterGradient)"
        />
        {/* Inner Intense Core */}
        <Path
          d="M12 20C14.2091 20 16 18.2091 16 16C16 14.1 14.8 12.5 13.7 11.4C13.4 11.1 12.8 11.3 12.9 11.7C13 12.4 12.4 13.1 11.5 13.1C10.6 13.1 10 12.4 10.1 11.7C10.2 10.7 10.9 9.8 11.4 9C11.6 8.6 11.1 8.2 10.7 8.4C8.7 9.2 7 11.6 7 14.5C7 17.5376 9.23858 20 12 20Z"
          fill="url(#fireInnerGradient)"
          opacity={0.95}
        />
      </Svg>
    </View>
  );
}
