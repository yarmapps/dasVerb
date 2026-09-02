const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { ENABLE_ADS } = require('./src/config/features');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('db');

// When ads are disabled (e.g. Expo Go), redirect the ads library to our mock
// so the app runs in Expo Go without missing native TurboModule crashes
if (!ENABLE_ADS) {
  const originalResolveRequest = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'react-native-google-mobile-ads') {
      return {
        filePath: path.resolve(__dirname, 'src/ads/mock.ts'),
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
