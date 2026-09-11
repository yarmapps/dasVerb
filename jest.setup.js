jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const MockIcon = (props) => React.createElement('Text', props, props.name);
  return {
    FontAwesome5: MockIcon,
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    AntDesign: MockIcon,
    Feather: MockIcon,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const insets = { top: 0, left: 0, right: 0, bottom: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(insets),
    SafeAreaView: ({ children, style }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn((key, value) => {
        store.set(key, String(value));
      }),
      getString: jest.fn(key => store.get(key)),
      getNumber: jest.fn(key => Number(store.get(key))),
      getBoolean: jest.fn(key => store.get(key) === 'true'),
      delete: jest.fn(key => {
        store.delete(key);
      }),
      clearAll: jest.fn(() => {
        store.clear();
      }),
    })),
  };
});

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn().mockReturnValue({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
      localUri: 'file:///mock/asset/main.db',
    }),
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/documents/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    execAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
    remove: jest.fn(),
  })),
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
  getAvailableVoicesAsync: jest.fn().mockResolvedValue([
    {
      identifier: 'com.apple.voice.compact.de-DE.Anna',
      name: 'Anna',
      language: 'de-DE',
      gender: 'female',
    },
    {
      identifier: 'com.apple.voice.compact.de-DE.Martin',
      name: 'Martin',
      language: 'de-DE',
      gender: 'male',
    },
  ]),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('react-intl', () => {
  const { getMessages } = require('./src/services/intlService');
  return {
    IntlProvider: ({ children }) => children,
    useIntl: () => {
      const messages = getMessages('ru');
      return {
        formatMessage: ({ id }, values) => {
          let message = messages[id] || id;
          if (values) {
            Object.keys(values).forEach(key => {
              message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(values[key]));
            });
          }
          return message;
        },
        locale: 'ru',
      };
    },
  };
});

jest.mock('react-native-google-mobile-ads', () => {
  const createMockAd = () => {
    const instanceListeners = new Map();
    let isLoaded = false;
    return {
      load: jest.fn(() => {
        isLoaded = true;
        const loadHandlers = instanceListeners.get('loaded') || [];
        loadHandlers.forEach(h => h());
      }),
      show: jest.fn(() => {
        const rewardHandlers = instanceListeners.get('rewarded_earned_reward') || [];
        rewardHandlers.forEach(h => h({ type: 'reward', amount: 1 }));
        const closeHandlers = instanceListeners.get('closed') || [];
        closeHandlers.forEach(h => h());
      }),
      addAdEventListener: jest.fn((event, handler) => {
        if (!instanceListeners.has(event)) {
          instanceListeners.set(event, []);
        }
        instanceListeners.get(event).push(handler);
        if (event === 'loaded' && isLoaded) {
          handler();
        }
        return jest.fn(() => {
          const handlers = instanceListeners.get(event) || [];
          instanceListeners.set(
            event,
            handlers.filter(h => h !== handler),
          );
        });
      }),
    };
  };

  return {
    TestIds: {
      INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
      REWARDED: 'ca-app-pub-3940256099942544/5224354917',
      BANNER: 'ca-app-pub-3940256099942544/6300978111',
    },
    AdEventType: {
      LOADED: 'loaded',
      CLOSED: 'closed',
      ERROR: 'error',
    },
    RewardedAdEventType: {
      LOADED: 'loaded',
      EARNED_REWARD: 'rewarded_earned_reward',
    },
    InterstitialAd: {
      createForAdRequest: jest.fn(() => createMockAd()),
    },
    RewardedAd: {
      createForAdRequest: jest.fn(() => createMockAd()),
    },
  };
});

const mockFirebaseAnalyticsInstance = {
  app: { name: '[DEFAULT]' },
};

jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: jest.fn(() => mockFirebaseAnalyticsInstance),
  logEvent: jest.fn().mockResolvedValue(undefined),
  logScreenView: jest.fn().mockResolvedValue(undefined),
  setUserId: jest.fn().mockResolvedValue(undefined),
  setUserProperty: jest.fn().mockResolvedValue(undefined),
  setUserProperties: jest.fn().mockResolvedValue(undefined),
  setAnalyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
  resetAnalyticsData: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
  initializeApp: jest.fn(() => ({ name: '[DEFAULT]' })),
}));

jest.mock('react-native-purchases', () => {
  const mockPurchases = {
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    getOfferings: jest.fn().mockResolvedValue({ current: null, all: {} }),
    getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
    addCustomerInfoUpdateListener: jest.fn(() => jest.fn()),
  };
  return {
    __esModule: true,
    default: mockPurchases,
    LOG_LEVEL: {
      VERBOSE: 'VERBOSE',
      DEBUG: 'DEBUG',
      INFO: 'INFO',
      WARN: 'WARN',
      ERROR: 'ERROR',
    },
    PACKAGE_TYPE: {
      UNKNOWN: 'UNKNOWN',
      CUSTOM: 'CUSTOM',
      LIFETIME: 'LIFETIME',
      ANNUAL: 'ANNUAL',
      SIX_MONTH: 'SIX_MONTH',
      THREE_MONTH: 'THREE_MONTH',
      TWO_MONTH: 'TWO_MONTH',
      MONTHLY: 'MONTHLY',
      WEEKLY: 'WEEKLY',
    },
  };
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    DATE: 'date',
  },
}));




