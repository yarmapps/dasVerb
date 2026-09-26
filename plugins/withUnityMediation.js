const { withDangerousMod, withAppBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to inject Google AdMob Unity Mediation Adapter
 * into Android build.gradle and iOS Podfile during expo prebuild.
 */
const withUnityMediation = (config) => {
  // 1. Android: inject into app/build.gradle dependencies
  config = withAppBuildGradle(config, (config) => {
    const dependency = "    implementation 'com.google.ads.mediation:unity:4.12.5.0'\n    implementation 'com.unity3d.ads:unity-ads:4.12.5'";
    if (!config.modResults.contents.includes('com.google.ads.mediation:unity')) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n${dependency}`,
      );
    }
    return config;
  });

  // 2. iOS: inject into Podfile target
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      if (fs.existsSync(podfilePath)) {
        let podfile = fs.readFileSync(podfilePath, 'utf8');
        const podSnippet = "  pod 'GoogleMobileAdsMediationUnity'\n";
        if (!podfile.includes('GoogleMobileAdsMediationUnity')) {
          podfile = podfile.replace(
            /(use_react_native![\s\S]*?\n\s*\))/m,
            `$1\n\n  # Google AdMob Mediation Adapter for Unity Ads\n${podSnippet}`,
          );
          fs.writeFileSync(podfilePath, podfile);
        }
      }
      return config;
    },
  ]);

  return config;
};

module.exports = withUnityMediation;
