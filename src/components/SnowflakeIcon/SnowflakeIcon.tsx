import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';

export interface SnowflakeIconProps {
  size?: number;
  isActive?: boolean;
  color?: string;
  inactiveColor?: string;
}

export function SnowflakeIcon({
  size = 18,
  isActive = true,
  color = '#38BDF8',
  inactiveColor = '#A0AEC0',
}: SnowflakeIconProps): React.JSX.Element {
  return (
    <FontAwesome5 name="snowflake" size={size} color={isActive ? color : inactiveColor} solid />
  );
}
