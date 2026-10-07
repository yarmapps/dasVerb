const { withDangerousMod, withAppBuildGradle, withInfoPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to inject Google AdMob Meta Audience Network (Facebook) Mediation Adapter
 * into Android build.gradle, iOS Podfile, and Info.plist during expo prebuild.
 */
const withMetaMediation = (config) => {
  // 1. Android: inject into app/build.gradle dependencies
  config = withAppBuildGradle(config, (config) => {
    const dependency = "    implementation 'com.google.ads.mediation:facebook:6.19.0.0'";
    if (!config.modResults.contents.includes('com.google.ads.mediation:facebook')) {
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
        const podSnippet = "  # Google AdMob Mediation Adapter for Meta Audience Network (Facebook)\n  pod 'GoogleMobileAdsMediationFacebook'\n";
        if (!podfile.includes('GoogleMobileAdsMediationFacebook')) {
          podfile = podfile.replace(
            /(use_react_native![\s\S]*?\n\s*\))/m,
            `$1\n\n${podSnippet}`,
          );
          fs.writeFileSync(podfilePath, podfile);
        }
      }
      return config;
    },
  ]);

  // 3. iOS: inject Meta SKAdNetwork identifiers into Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults.SKAdNetworkItems = config.modResults.SKAdNetworkItems || [];
    const metaSkAdNetworks = ['v9wttpbfk9.skadnetwork', 'n38lu8286q.skadnetwork'];
    const existing = new Set(
      config.modResults.SKAdNetworkItems.map((item) => item.SKAdNetworkIdentifier),
    );
    for (const id of metaSkAdNetworks) {
      if (!existing.has(id)) {
        config.modResults.SKAdNetworkItems.push({ SKAdNetworkIdentifier: id });
      }
    }
    return config;
  });

  return config;
};

module.exports = withMetaMediation;
