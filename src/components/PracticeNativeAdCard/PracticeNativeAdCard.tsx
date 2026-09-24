import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, Image } from 'react-native';
import { useIntl } from 'react-intl';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeAdChoicesPlacement,
} from 'react-native-google-mobile-ads';
import { ENABLE_ADS, NATIVE_AD_UNIT_ID } from '../../ads/adConfig';
import { isPracticeNativeAdEnabled } from '../../services/appConfigService';
import { ThemeColors } from '../../styles/themeColors';
import { createStyles } from './PracticeNativeAdCard.styles';

export { isPracticeNativeAdEnabled };

export interface PracticeNativeAdCardProps {
  isPremium: boolean;
  colors: ThemeColors;
  isDark?: boolean;
}

export function PracticeNativeAdCard({
  isPremium,
  colors,
  isDark = false,
}: PracticeNativeAdCardProps): React.JSX.Element | null {
  const intl = useIntl();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [hasError, setHasError] = useState(false);
  const [adHeight, setAdHeight] = useState<number | undefined>(undefined);
  const activeAdReference = useRef<NativeAd | null>(null);
  const isFeatureEnabled = isPracticeNativeAdEnabled();

  useEffect(() => {
    if (isPremium || !ENABLE_ADS || !isFeatureEnabled || !NATIVE_AD_UNIT_ID) {
      return;
    }

    let isMounted = true;

    NativeAd.createForAdRequest(NATIVE_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
      adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
    })
      .then(ad => {
        if (!isMounted) {
          ad.destroy();
          return;
        }
        activeAdReference.current?.destroy();
        activeAdReference.current = ad;
        setAdHeight(undefined);
        setNativeAd(ad);
      })
      .catch(error => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn('[PracticeNativeAdCard] Failed to load native ad:', error);
        }
        if (isMounted) {
          setHasError(true);
        }
      });

    return () => {
      isMounted = false;
      activeAdReference.current?.destroy();
      activeAdReference.current = null;
    };
  }, [isPremium, isFeatureEnabled]);

  if (isPremium || !ENABLE_ADS || !isFeatureEnabled || hasError || !nativeAd) {
    return null;
  }

  return (
    <View style={styles.cardWrapper} testID="practice-native-ad-card">
      <NativeAdView
        nativeAd={nativeAd}
        style={[styles.container, adHeight ? { height: adHeight } : null]}
        onLayout={event => {
          if (!adHeight) {
            const layoutHeight = Math.ceil(event.nativeEvent.layout.height);
            if (layoutHeight > 0) {
              setAdHeight(layoutHeight + 2);
            }
          }
        }}
      >
        <View style={styles.topRow}>
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>
              {intl.formatMessage({ id: 'practiceScreen.adBadge' })}
            </Text>
          </View>
          {nativeAd.advertiser ? (
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <Text style={styles.advertiserText} numberOfLines={1}>
                {nativeAd.advertiser}
              </Text>
            </NativeAsset>
          ) : (
            <View style={styles.advertiserText} />
          )}
        </View>

        <View style={styles.mainContent}>
          {nativeAd.icon?.url ? (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
            </NativeAsset>
          ) : null}

          <View style={styles.textColumn}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text style={styles.headline} numberOfLines={1}>
                {nativeAd.headline}
              </Text>
            </NativeAsset>
            {nativeAd.body ? (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text style={styles.body} numberOfLines={2}>
                  {nativeAd.body}
                </Text>
              </NativeAsset>
            ) : null}
          </View>
        </View>

        {nativeAd.callToAction ? (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Text style={styles.ctaButton}>{nativeAd.callToAction}</Text>
          </NativeAsset>
        ) : null}
      </NativeAdView>
    </View>
  );
}
