import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { useIntl } from 'react-intl';
import { soundService } from '../../services/soundService';
import { trackEvent } from '../../services/analyticsService';
import { ThemeColors } from '../../styles/themeColors';
import { createStyles } from './DerArtikelPromoCard.styles';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const DER_ARTIKEL_ICON = require('../../../assets/icons/der-artikel-icon.png');

const IOS_BASE_URL = 'https://apps.apple.com/app/apple-store/id6760616325?pt=128661768&mt=8';
const ANDROID_BASE_URL =
  'https://play.google.com/store/apps/details?id=com.yarm.apps.derartikel&referrer=utm_source%3Ddas_verb%26utm_medium%3Dcross_promo';

export interface DerArtikelPromoCardProps {
  source: 'practice' | 'dictionary';
  colors: ThemeColors;
  isDark?: boolean;
  isPremium?: boolean;
}

export function DerArtikelPromoCard({
  source,
  colors,
  isDark = false,
  isPremium = false,
}: DerArtikelPromoCardProps): React.JSX.Element {
  const intl = useIntl();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const storeUrl = useMemo(() => {
    if (Platform.OS === 'ios') {
      return `${IOS_BASE_URL}&ct=das_verb_${source}`;
    }
    return `${ANDROID_BASE_URL}%26utm_campaign%3D${source}`;
  }, [source]);

  useEffect(() => {
    trackEvent('cross_promo_shown', {
      source,
      target_app: 'der_artikel',
      is_premium: isPremium,
      platform: Platform.OS,
    });
  }, [source, isPremium]);

  const handlePress = useCallback(() => {
    soundService.playTapSound();
    trackEvent('cross_promo_clicked', {
      source,
      target_app: 'der_artikel',
      is_premium: isPremium,
      platform: Platform.OS,
    });
    Linking.openURL(storeUrl).catch(error => {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[DerArtikelPromoCard] Failed to open store URL:', error);
      }
    });
  }, [source, isPremium, storeUrl]);

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.8}
        onPress={handlePress}
        testID={`der-artikel-cross-promo-${source}`}
        accessibilityRole="button"
        accessibilityLabel={intl.formatMessage({ id: 'crossPromo.derArtikel.title' })}
      >
        <Image source={DER_ARTIKEL_ICON} style={styles.icon} />
        <View style={styles.textColumn}>
          <Text style={styles.headline} numberOfLines={1}>
            {intl.formatMessage({ id: 'crossPromo.derArtikel.title' })}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {intl.formatMessage({ id: 'crossPromo.derArtikel.subtitle' })}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
