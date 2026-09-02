/**
 * Feature flags for the app.
 *
 * ENABLE_ADS:
 *   - false → Expo Go works (simulated ads with Alert), no native TurboModule crashes
 *   - true  → requires custom dev build (npx expo run:android / npx expo run:ios)
 */
module.exports = {
  ENABLE_ADS: false,
};
