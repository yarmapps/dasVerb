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
