import React from 'react';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export interface DiamondIconProps {
  size?: number;
}

export function DiamondIcon({ size = 52 }: DiamondIconProps): React.JSX.Element {
  // FontAwesome 5 "gem" solid exact path (viewBox 0 0 576 512)
  const gemPath =
    'M485.5 0L576 160H474.9L405.7 0h79.8zm-128 0l69.2 160H149.3L218.5 0h139zm-267 0h79.8l-69.2 160H0L90.5 0zM0 192h100.7l123 251.7c1.5 3.1-2.7 5.9-5 3.3L0 192zm148.2 0h279.6l-137 318.2c-1 2.4-4.5 2.4-5.5 0L148.2 192zm204.1 251.7l123-251.7H576L357.3 446.9c-2.3 2.7-6.5-.1-5-3.2z';

  const width = size;
  const height = (size * 512) / 576;

  return (
    <Svg width={width} height={height} viewBox="0 0 576 512" fill="none">
      <Defs>
        <LinearGradient id="diamondPurpleGradient" x1="0%" y1="0%" x2="60%" y2="100%">
          <Stop offset="0%" stopColor="#E9D5FF" />
          <Stop offset="30%" stopColor="#C084FC" />
          <Stop offset="70%" stopColor="#9333EA" />
          <Stop offset="100%" stopColor="#7C3AED" />
        </LinearGradient>
      </Defs>
      <Path d={gemPath} fill="url(#diamondPurpleGradient)" />
    </Svg>
  );
}
