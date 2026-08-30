import React, { useMemo } from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useIntl } from 'react-intl';
import { MainTabParamList } from '../types/navigation';
import { useAppTheme } from '../context/ThemeContext';
import { PracticeScreen } from '../screens/PracticeScreen/PracticeScreen';
import { DictionaryScreen } from '../screens/DictionaryScreen/DictionaryScreen';
import { createStyles } from './MainTabs.styles';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs(): React.JSX.Element {
  const intl = useIntl();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 10) : insets.bottom + 10;
  const tabBarHeight = 60 + bottomPadding;

  const styles = useMemo(
    () => createStyles(colors, tabBarHeight, bottomPadding),
    [colors, tabBarHeight, bottomPadding],
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          if (route.name === 'Practice') {
            iconName = 'layer-group';
          } else if (route.name === 'Dictionary') {
            iconName = 'book';
          } else {
            iconName = 'circle';
          }

          return (
            <View style={styles.tabIconContainer}>
              <FontAwesome5 name={iconName} size={size - 2} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          tabBarLabel: intl.formatMessage({ id: 'navigation.practice' }),
        }}
      />
      <Tab.Screen
        name="Dictionary"
        component={DictionaryScreen}
        options={{
          tabBarLabel: intl.formatMessage({ id: 'navigation.dictionary' }),
        }}
      />
    </Tab.Navigator>
  );
}
