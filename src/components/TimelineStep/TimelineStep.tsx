import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { createStyles } from './TimelineStep.styles';

export type TimelineIconName =
  | 'gem'
  | 'bell'
  | 'hourglass-half'
  | 'clock'
  | 'calendar-alt'
  | 'envelope'
  | 'credit-card'
  | 'calendar-check'
  | 'lock-open';

export interface TimelineStepProps {
  icon: TimelineIconName;
  iconColor: string;
  iconBgColor: string;
  iconBorderColor?: string;
  connectorColor: string;
  showConnector: boolean;
  day: string;
  headline: string;
  subline?: string;
  description?: string;
  children?: React.ReactNode;
}

export function TimelineStep({
  icon,
  iconColor,
  iconBgColor,
  iconBorderColor,
  connectorColor,
  showConnector,
  day,
  headline,
  subline,
  description,
  children,
}: TimelineStepProps): React.JSX.Element {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: iconBgColor },
            iconBorderColor ? styles.iconBadgeBordered : null,
            iconBorderColor ? { borderColor: iconBorderColor } : null,
          ]}
        >
          <FontAwesome5 name={icon} size={22} color={iconColor} solid />
        </View>
        {showConnector ? (
          <View
            testID="timeline-connector"
            style={[styles.connector, { backgroundColor: connectorColor }]}
          />
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.day}>{day}</Text>
        <Text style={styles.headline}>{headline}</Text>
        {subline ? <Text style={styles.subline}>{subline}</Text> : null}
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {children ? <View style={styles.extra}>{children}</View> : null}
      </View>
    </View>
  );
}
