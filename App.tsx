import React, { useMemo, useEffect } from 'react';
import { LogBox } from 'react-native';
import { enableFreeze } from 'react-native-screens';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import mobileAds from 'react-native-google-mobile-ads';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { LocaleProvider } from './src/context/LocaleContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ENABLE_ADS } from './src/ads/adConfig';
import { preloadRewardedAdOnAppStart } from './src/ads/useRewardedAd';
import { fetchRemoteConfig } from './src/services/appConfigService';

enableFreeze(false);

LogBox.ignoreLogs([
  "Passing an object as the argument to 'navigate' is deprecated",
]);

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
  useEffect(() => {
    fetchRemoteConfig().catch(() => {});

    if (ENABLE_ADS) {
      try {
        mobileAds()
          .initialize()
          .then(() => {
            preloadRewardedAdOnAppStart();
          })
          .catch(() => {});
      } catch {
        // ignore
      }
    }
  }, []);

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
