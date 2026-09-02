import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ENABLE_ADS } = require('../config/features');

export { ENABLE_ADS };

/**
 * Google AdMob Rewarded Ad Unit IDs
 */
export const AD_UNIT_IDS = {
  rewarded: {
    android: 'ca-app-pub-7651822935774581/6092061746',
    ios: 'ca-app-pub-7651822935774581/7022000038',
  },
};

export const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : Platform.select({
      android: AD_UNIT_IDS.rewarded.android,
      ios: AD_UNIT_IDS.rewarded.ios,
      default: TestIds.REWARDED,
    });
