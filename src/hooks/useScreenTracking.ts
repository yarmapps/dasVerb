import { useRef, useCallback } from 'react';
import { useNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { trackScreenView } from '../services/analyticsService';

/**
 * Hook for automatic screen view tracking in React Navigation.
 * Mounts on NavigationContainer using onReady and onStateChange.
 */
export function useScreenTracking() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const routeNameRef = useRef<string | undefined>(undefined);

  const onNavigationReady = useCallback(() => {
    const currentRoute = navigationRef.getCurrentRoute();
    const currentRouteName = currentRoute?.name as string | undefined;
    if (currentRouteName) {
      routeNameRef.current = currentRouteName;
      trackScreenView(currentRouteName);
    }
  }, [navigationRef]);

  const onNavigationStateChange = useCallback(() => {
    const previousRouteName = routeNameRef.current;
    const currentRoute = navigationRef.getCurrentRoute();
    const currentRouteName = currentRoute?.name as string | undefined;

    if (currentRouteName && previousRouteName !== currentRouteName) {
      routeNameRef.current = currentRouteName;
      trackScreenView(currentRouteName);
    }
  }, [navigationRef]);

  return {
    navigationRef,
    onNavigationReady,
    onNavigationStateChange,
  };
}
