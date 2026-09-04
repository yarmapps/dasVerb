const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { ENABLE_ADS, ENABLE_ANALYTICS } = require('./src/config/features');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('db');

// Redirect native libraries to mocks when disabled (e.g. Expo Go)
// so the app runs without missing native TurboModule crashes
if (!ENABLE_ADS || !ENABLE_ANALYTICS) {
  const originalResolveRequest = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (!ENABLE_ADS && moduleName === 'react-native-google-mobile-ads') {
      return {
        filePath: path.resolve(__dirname, 'src/ads/mock.ts'),
        type: 'sourceFile',
      };
    }

    if (
      !ENABLE_ANALYTICS &&
      (moduleName === '@react-native-firebase/analytics' ||
        moduleName === '@react-native-firebase/app')
    ) {
      return {
        filePath: path.resolve(__dirname, 'src/analytics/mock.ts'),
        type: 'sourceFile',
      };
    }

    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
