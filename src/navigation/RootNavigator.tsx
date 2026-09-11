import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getIsLanguageSelected } from '../services/settingsService';
import { LanguageSelectorScreen } from '../screens/LanguageSelectorScreen/LanguageSelectorScreen';
import { FirstOpenPaywallScreen } from '../screens/FirstOpenPaywallScreen/FirstOpenPaywallScreen';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';
import { DebugScreen } from '../screens/DebugScreen/DebugScreen';
import { VerbQuizScreen } from '../screens/VerbQuizScreen/VerbQuizScreen';
import { QuizResultsScreen } from '../screens/QuizResultsScreen/QuizResultsScreen';
import { useAppTheme } from '../context/ThemeContext';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const isLanguageSelected = getIsLanguageSelected();
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
      initialRouteName={isLanguageSelected ? 'MainTabs' : 'LanguageSelector'}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="LanguageSelector" component={LanguageSelectorScreen} />
      <Stack.Screen name="FirstOpenPaywall" component={FirstOpenPaywallScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Debug" component={DebugScreen} />
      <Stack.Screen name="VerbQuiz" component={VerbQuizScreen} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
    </Stack.Navigator>
  );
}
