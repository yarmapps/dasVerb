import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import * as Application from 'expo-application';
import { compareVersions } from 'compare-versions';
import { APP_VERSION } from '../constants/version';
import { fetchRemoteConfig, getAppConfig } from '../services/appConfigService';

export type UpdateType = 'none' | 'soft' | 'force';

export interface AppUpdateState {
  updateType: UpdateType;
  updateUrl: string | null;
  isLoading: boolean;
}

type DebugUpdateListener = (state: AppUpdateState | null) => void;
const debugListeners = new Set<DebugUpdateListener>();
let currentDebugOverride: AppUpdateState | null = null;

export function triggerDebugAppUpdate(type: UpdateType | null): void {
  if (type === null || type === 'none') {
    currentDebugOverride = null;
  } else {
    currentDebugOverride = {
      updateType: type,
      updateUrl:
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/id6742338662'
          : 'https://play.google.com/store/apps/details?id=com.yarm.apps.dasverb',
      isLoading: false,
    };
  }
  debugListeners.forEach(listener => listener(currentDebugOverride));
}

export function useAppUpdate(): AppUpdateState {
  const [updateState, setUpdateState] = useState<AppUpdateState>(() => {
    if (currentDebugOverride) {
      return currentDebugOverride;
    }
    return {
      updateType: 'none',
      updateUrl: null,
      isLoading: true,
    };
  });

  const checkUpdate = useCallback(async () => {
    if (currentDebugOverride) {
      setUpdateState(currentDebugOverride);
      return;
    }

    try {
      const config = await fetchRemoteConfig();
      const currentVersion = Application.nativeApplicationVersion || APP_VERSION;
      const platformConfig = Platform.OS === 'ios' ? config.ios : config.android;

      if (!platformConfig) {
        setUpdateState({ updateType: 'none', updateUrl: null, isLoading: false });
        return;
      }

      let updateType: UpdateType = 'none';

      if (compareVersions(currentVersion, platformConfig.minimum_version) < 0) {
        updateType = 'force';
      } else if (compareVersions(currentVersion, platformConfig.latest_version) < 0) {
        updateType = 'soft';
      }

      setUpdateState({
        updateType,
        updateUrl: platformConfig.update_url,
        isLoading: false,
      });
    } catch {
      const fallbackConfig = getAppConfig();
      const currentVersion = Application.nativeApplicationVersion || APP_VERSION;
      const platformConfig = Platform.OS === 'ios' ? fallbackConfig.ios : fallbackConfig.android;

      let updateType: UpdateType = 'none';
      if (platformConfig) {
        if (compareVersions(currentVersion, platformConfig.minimum_version) < 0) {
          updateType = 'force';
        } else if (compareVersions(currentVersion, platformConfig.latest_version) < 0) {
          updateType = 'soft';
        }
      }

      setUpdateState({
        updateType,
        updateUrl: platformConfig ? platformConfig.update_url : null,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    const handleDebugChange = (override: AppUpdateState | null) => {
      if (override) {
        setUpdateState(override);
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkUpdate();
      }
    };

    debugListeners.add(handleDebugChange);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkUpdate();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkUpdate();
      }
    });

    return () => {
      debugListeners.delete(handleDebugChange);
      subscription.remove();
    };
  }, [checkUpdate]);

  return updateState;
}
