import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { LocaleProvider } from './src/context/LocaleContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function AppContent(): React.JSX.Element {
  const { colors, isDark } = useAppTheme();

  const navigationTheme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: colors.background,
        card: colors.blockBackground,
        text: colors.textPrimary,
        border: colors.blockBorder,
        primary: colors.primary,
      },
    };
  }, [colors, isDark]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <AppContent />
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
