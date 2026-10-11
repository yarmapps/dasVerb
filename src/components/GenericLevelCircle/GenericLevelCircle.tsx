import React, { useMemo } from 'react';
import { View, TouchableOpacity, Platform, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './GenericLevelCircle.styles';

export interface GenericLevelCircleProps {
  size: number;
  outerBorderColor: string;
  outerBorderWidth?: number;
  innerBackgroundColor?: string;
  fillPercentage?: number;
  fillColor?: string;
  fillOpacity?: number;
  hasGlow?: boolean;
  children?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  useGradientFill?: boolean;
  gradientColors?: string[];
  testID?: string;
}

export function GenericLevelCircle({
  size,
  outerBorderColor,
  outerBorderWidth = 6,
  innerBackgroundColor,
  fillPercentage = 0,
  fillColor,
  fillOpacity = 0.3,
  hasGlow = false,
  children,
  onPress,
  onLongPress,
  disabled = false,
  style,
  useGradientFill = false,
  gradientColors,
  testID,
}: GenericLevelCircleProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(), []);

  const finalInnerBackgroundColor = innerBackgroundColor || colors.blockBackground;
  const finalGradientColors = gradientColors || ['#EAB308', '#FFA500', '#FF8C00'];

  const gap = 8;
  const innerSize = size - outerBorderWidth * 2 - gap * 2;
  const innerRadius = innerSize / 2;
  const effectiveFillColor = fillColor || outerBorderColor;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, { width: size, height: size }, style]}
      testID={testID}
    >
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: outerBorderWidth,
            borderColor: outerBorderColor,
          },
          hasGlow && {
            shadowColor: outerBorderColor,
            shadowOpacity: 0.6,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            elevation: 5,
          },
        ]}
      />

      <View
        style={[
          styles.innerCircleWrapper,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerRadius,
          },
        ]}
        {...(Platform.OS === 'android' && {
          renderToHardwareTextureAndroid: true,
          needsOffscreenAlphaCompositing: true,
        })}
      >
        <View
          style={[
            styles.innerBackground,
            {
              borderRadius: innerRadius,
              backgroundColor: finalInnerBackgroundColor,
            },
          ]}
        />

        {fillPercentage > 0 &&
          (useGradientFill ? (
            <>
              <LinearGradient
                colors={finalGradientColors as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[
                  styles.fillLayer,
                  {
                    height: `${Math.min(100, Math.max(0, fillPercentage))}%`,
                    opacity: fillOpacity,
                  },
                ]}
              />
              <LinearGradient
                colors={['transparent', 'transparent', 'rgba(0,0,0,0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.fillLayer, { height: '100%' }]}
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.2)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.shineLayer, { width: innerSize * 0.6, height: innerSize * 0.6 }]}
              />
              <LinearGradient
                colors={['rgba(255,255,255,0.4)', 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={styles.topShineLayer}
              />
            </>
          ) : (
            <View
              style={[
                styles.fillLayer,
                {
                  height: `${Math.min(100, Math.max(0, fillPercentage))}%`,
                  backgroundColor: effectiveFillColor,
                  opacity: fillOpacity,
                },
              ]}
            />
          ))}

        <View style={styles.contentLayer}>{children}</View>
      </View>
    </TouchableOpacity>
  );
}
