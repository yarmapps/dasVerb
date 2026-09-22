import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ENABLE_ADS } = require('../config/features');

export { ENABLE_ADS };

/**
 * Google AdMob Ad Unit IDs
 */
export const AD_UNIT_IDS = {
  rewarded: {
    android: 'ca-app-pub-7651822935774581/6092061746',
    ios: 'ca-app-pub-7651822935774581/7022000038',
  },
  interstitial: {
    android: 'ca-app-pub-7651822935774581/2478369345',
    ios: 'ca-app-pub-7651822935774581/4306456331',
  },
  native: {
    android: 'ca-app-pub-7651822935774581/6918895974',
    ios: 'ca-app-pub-7651822935774581/9043777697',
  },
};

export const REWARDED_AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : Platform.select({
      android: AD_UNIT_IDS.rewarded.android,
      ios: AD_UNIT_IDS.rewarded.ios,
      default: TestIds.REWARDED,
    });

export const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      android: AD_UNIT_IDS.interstitial.android,
      ios: AD_UNIT_IDS.interstitial.ios,
      default: TestIds.INTERSTITIAL,
    });

export const NATIVE_AD_UNIT_ID = __DEV__
  ? TestIds.NATIVE
  : Platform.select({
      android: AD_UNIT_IDS.native.android,
      ios: AD_UNIT_IDS.native.ios,
      default: TestIds.NATIVE,
    });
