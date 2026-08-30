import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getIsLanguageSelected } from '../services/settingsService';
import { LanguageSelectorScreen } from '../screens/LanguageSelectorScreen/LanguageSelectorScreen';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';
import { VerbsPracticeListScreen } from '../screens/VerbsPracticeListScreen/VerbsPracticeListScreen';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const isLanguageSelected = getIsLanguageSelected();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
      initialRouteName={isLanguageSelected ? 'MainTabs' : 'LanguageSelector'}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="LanguageSelector" component={LanguageSelectorScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="VerbsPracticeList" component={VerbsPracticeListScreen} />
    </Stack.Navigator>
  );
}
