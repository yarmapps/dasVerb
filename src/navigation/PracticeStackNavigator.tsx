import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../types/navigation';
import { useAppTheme } from '../context/ThemeContext';
import { PracticeScreen } from '../screens/PracticeScreen/PracticeScreen';
import { VerbsPracticeListScreen } from '../screens/VerbsPracticeListScreen/VerbsPracticeListScreen';

import { PrefixPracticeListScreen } from '../screens/PrefixPracticeListScreen/PrefixPracticeListScreen';
import { ConjugationPracticeListScreen } from '../screens/ConjugationPracticeListScreen/ConjugationPracticeListScreen';

const Stack = createNativeStackNavigator<PracticeStackParamList>();

export function PracticeStackNavigator(): React.JSX.Element {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 280,
        gestureEnabled: true,
        freezeOnBlur: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName="PracticeHome"
    >
      <Stack.Screen name="PracticeHome" component={PracticeScreen} />
      <Stack.Screen name="VerbsPracticeList" component={VerbsPracticeListScreen} />
      <Stack.Screen name="PrefixPracticeList" component={PrefixPracticeListScreen} />
      <Stack.Screen name="ConjugationPracticeList" component={ConjugationPracticeListScreen} />
    </Stack.Navigator>
  );
}
