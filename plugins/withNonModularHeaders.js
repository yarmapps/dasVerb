const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withNonModularHeaders = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      // pre_install: disable DEFINES_MODULE for all RNFB pods
      // This prevents them from being treated as framework modules,
      // which causes the non-modular header import errors
      const preInstallSnippet = `
pre_install do |installer|
  installer.pod_targets.each do |pod|
    if pod.name.start_with?('RNFB') || pod.name.start_with?('RNFBApp')
      def pod.build_type
        Pod::BuildType.static_library
      end
    end
  end
end

`;

      if (!podfile.includes('pre_install do |installer|')) {
        // Insert before the first target line
        podfile = podfile.replace(/^(target\s)/m, `${preInstallSnippet}$1`);
      }

      // post_install: belt and suspenders
      const postInstallSnippet = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end`;

      if (podfile.includes('post_install do |installer|')) {
        if (!podfile.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
          podfile = podfile.replace(
            'post_install do |installer|',
            `post_install do |installer|${postInstallSnippet}`,
          );
        }
      } else {
        podfile += `\npost_install do |installer|${postInstallSnippet}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};

module.exports = withNonModularHeaders;
