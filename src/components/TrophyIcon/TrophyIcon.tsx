import React from 'react';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export interface TrophyIconProps {
  size?: number;
  isRanked?: boolean;
  isDark?: boolean;
  inactiveColor?: string;
}

export function TrophyIcon({
  size = 21,
  isRanked = true,
  inactiveColor = '#94A3B8',
}: TrophyIconProps): React.JSX.Element {
  const trophyPath =
    'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z';

  if (!isRanked) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d={trophyPath} fill={inactiveColor} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="trophyPremiumGold" x1="0%" y1="0%" x2="40%" y2="100%">
          <Stop offset="0%" stopColor="#FDE047" />
          <Stop offset="50%" stopColor="#EAB308" />
          <Stop offset="100%" stopColor="#CA8A04" />
        </LinearGradient>
      </Defs>
      <Path d={trophyPath} fill="url(#trophyPremiumGold)" />
    </Svg>
  );
}
