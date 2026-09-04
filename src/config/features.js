/**
 * Feature flags for the app.
 *
 * ENABLE_ADS:
 *   - false → Expo Go works (simulated ads with Alert), no native TurboModule crashes
 *   - true  → requires custom dev build (npx expo run:android / npx expo run:ios)
 *
 * ENABLE_ANALYTICS:
 *   - false → Expo Go works (simulated analytics with console logs), no native Firebase crashes
 *   - true  → requires custom dev build with google-services.json / GoogleService-Info.plist
 */
module.exports = {
  ENABLE_ADS: true,
  ENABLE_ANALYTICS: true,
};
