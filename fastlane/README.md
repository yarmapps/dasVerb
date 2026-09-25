fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios download_metadata

```sh
[bundle exec] fastlane ios download_metadata
```

Download live App Store metadata directly into fastlane/metadata/ios

### ios delete_obsolete_localizations

```sh
[bundle exec] fastlane ios delete_obsolete_localizations
```

Delete obsolete localizations from App Store Connect for current editable version

### ios download_screenshots

```sh
[bundle exec] fastlane ios download_screenshots
```

Download live App Store screenshots into fastlane/screenshots/ios

### ios sync_metadata

```sh
[bundle exec] fastlane ios sync_metadata
```

Upload updated text metadata from fastlane/metadata/ios to App Store Connect

### ios test_keyword_limit

```sh
[bundle exec] fastlane ios test_keyword_limit
```

Test keyword character limit on App Store Connect

### ios sync_screenshots

```sh
[bundle exec] fastlane ios sync_screenshots
```

Upload screenshots from fastlane/screenshots/ios to App Store Connect

### ios release_production

```sh
[bundle exec] fastlane ios release_production
```

Upload production build.ipa and metadata to App Store Connect

### ios check_iap

```sh
[bundle exec] fastlane ios check_iap
```

Check existing in-app purchases and subscriptions on App Store Connect

### ios setup_iap

```sh
[bundle exec] fastlane ios setup_iap
```

Create subscription group, subscriptions and lifetime IAP on App Store Connect

### ios setup_subscription_group_localizations

```sh
[bundle exec] fastlane ios setup_subscription_group_localizations
```

Create Subscription Group Localizations on App Store Connect

----


## Android

### android download_metadata

```sh
[bundle exec] fastlane android download_metadata
```

Download Google Play Store metadata into fastlane/metadata/android

### android sync_metadata

```sh
[bundle exec] fastlane android sync_metadata
```

Upload updated text metadata to Google Play

### android sync_screenshots

```sh
[bundle exec] fastlane android sync_screenshots
```

Upload screenshots and images (icon, feature graphic, phone screenshots) to Google Play

### android sync_all

```sh
[bundle exec] fastlane android sync_all
```

Upload all metadata, changelogs, icon, feature graphic and screenshots to Google Play

### android release_production

```sh
[bundle exec] fastlane android release_production
```

Upload production build.aab to Google Play Store

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
