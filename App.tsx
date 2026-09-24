import React, { useMemo, useEffect, useState } from 'react';
import { LogBox, View, ActivityIndicator, StyleSheet } from 'react-native';
import { enableFreeze } from 'react-native-screens';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { LocaleProvider } from './src/context/LocaleContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppUpdateModal } from './src/components/AppUpdateModal/AppUpdateModal';
import { ENABLE_ADS } from './src/ads/adConfig';
import { adConsentService } from './src/ads/consentService';
import { adManager } from './src/ads/adManager';
import { preloadRewardedAdOnAppStart } from './src/ads/useRewardedAd';
import { appConfigService } from './src/services/appConfigService';
import { initializeAnalytics } from './src/services/analyticsService';
import { initRevenueCat } from './src/services/revenueCatService';
import { initializeNotifications } from './src/services/notificationService';
import { soundService } from './src/services/soundService';
import { PostHogProvider } from 'posthog-react-native';
import { useScreenTracking } from './src/hooks/useScreenTracking';

enableFreeze(false);

LogBox.ignoreLogs([
  "Passing an object as the argument to 'navigate' is deprecated",
]);

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

function LoadingFallback(): React.JSX.Element {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function AppContent(): React.JSX.Element {
  const { colors, isDark } = useAppTheme();
  const { navigationRef, onNavigationReady, onNavigationStateChange } = useScreenTracking();

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
    <NavigationContainer
      ref={navigationRef}
      onReady={onNavigationReady}
      onStateChange={onNavigationStateChange}
      theme={navigationTheme}
    >
      <RootNavigator />
      <AppUpdateModal />
    </NavigationContainer>
  );
}

function AppWrapper(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAppData = async () => {
      try {
        await initializeAnalytics().catch(() => {});
        await appConfigService.init(500).catch(() => {});
        await initRevenueCat().catch(() => {});
        await initializeNotifications().catch(() => {});
        await soundService.initialize().catch(() => {});

        if (ENABLE_ADS) {
          await adConsentService.initialize();
          adManager.init();
          preloadRewardedAdOnAppStart();
        }
      } catch (error) {
        if (__DEV__) {
          console.error('App initialization error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAppData();
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <LocaleProvider>
      <AppContent />
    </LocaleProvider>
  );
}

export function App(): React.JSX.Element {
  return (
    <PostHogProvider
      apiKey="phc_nkoZyjZMMbrP7RXzvDjtP3PTzmbjLAxSnJwyEEQdbJG4"
      options={{
        host: 'https://eu.i.posthog.com',
      }}
      autocapture={{
        captureScreens: false,
      }}
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <AppWrapper />
        </ThemeProvider>
      </SafeAreaProvider>
    </PostHogProvider>
  );
}

export default App;

