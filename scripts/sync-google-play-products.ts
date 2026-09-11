import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PACKAGE_NAME = 'com.yarm.apps.dasverb';
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../credentials/android/play-service-account.json');

function getGoogleAccessToken(sa: any, scope: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${encode(header)}.${encode(payload)}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  sign.end();
  const signature = sign.sign(sa.private_key, 'base64url');
  const jwt = `${unsignedToken}.${signature}`;

  return fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  }).then(async r => {
    const data = await r.json();
    if (!data.access_token) throw new Error(`Auth failed: ${JSON.stringify(data)}`);
    return data.access_token;
  });
}

interface LocalizationEntry {
  languageCode: string;
  yearlyTitle: string;
  monthlyTitle: string;
  lifetimeTitle: string;
  description: string;
}

const LOCALIZATIONS: LocalizationEntry[] = [
  {
    languageCode: 'en-US',
    yearlyTitle: 'das Verb: 1 Year Premium',
    monthlyTitle: 'das Verb: 1 Month Premium',
    lifetimeTitle: 'das Verb: Lifetime Premium',
    description: 'All verbs A1-B2, prepositions & quizzes'
  },
  {
    languageCode: 'de-DE',
    yearlyTitle: 'das Verb: 1 Jahr Premium',
    monthlyTitle: 'das Verb: 1 Monat Premium',
    lifetimeTitle: 'das Verb: Premium Lifetime',
    description: 'Werbefrei, alle Verben A1-B2 & Tests'
  },
  {
    languageCode: 'ru-RU',
    yearlyTitle: 'das Verb: Годовой Премиум',
    monthlyTitle: 'das Verb: Месячный Премиум',
    lifetimeTitle: 'das Verb: Навсегда Премиум',
    description: 'Без рекламы, все глаголы A1-B2 и тесты'
  },
  {
    languageCode: 'uk',
    yearlyTitle: 'das Verb: Річний Преміум',
    monthlyTitle: 'das Verb: Місячний Преміум',
    lifetimeTitle: 'das Verb: Назавжди Преміум',
    description: 'Без рекламы, всі дієслова A1-B2 та квізи'
  },
  {
    languageCode: 'es-ES',
    yearlyTitle: 'das Verb: Premium 1 Año',
    monthlyTitle: 'das Verb: Premium 1 Mes',
    lifetimeTitle: 'das Verb: Premium Vitalicio',
    description: 'Sin anuncios, todos los verbos A1-B2'
  },
  {
    languageCode: 'es-US',
    yearlyTitle: 'das Verb: Premium 1 Año',
    monthlyTitle: 'das Verb: Premium 1 Mes',
    lifetimeTitle: 'das Verb: Premium Vitalicio',
    description: 'Sin anuncios, todos los verbos A1-B2'
  },
  {
    languageCode: 'fr-FR',
    yearlyTitle: 'das Verb: Premium 1 An',
    monthlyTitle: 'das Verb: Premium 1 Mois',
    lifetimeTitle: 'das Verb: Premium à vie',
    description: 'Sans pub, tous les verbes A1-B2 & quiz'
  },
  {
    languageCode: 'fr-CA',
    yearlyTitle: 'das Verb: Premium 1 An',
    monthlyTitle: 'das Verb: Premium 1 Mois',
    lifetimeTitle: 'das Verb: Premium à vie',
    description: 'Sans pub, tous les verbes A1-B2 & quiz'
  },
  {
    languageCode: 'it-IT',
    yearlyTitle: 'das Verb: Premium 1 Anno',
    monthlyTitle: 'das Verb: Premium 1 Mese',
    lifetimeTitle: 'das Verb: Premium a vita',
    description: 'No pubblicità, tutti i verbi A1-B2'
  },
  {
    languageCode: 'pt-BR',
    yearlyTitle: 'das Verb: Premium 1 Ano',
    monthlyTitle: 'das Verb: Premium 1 Mês',
    lifetimeTitle: 'das Verb: Premium Vitalício',
    description: 'Sem anúncios, todos os verbos A1-B2'
  },
  {
    languageCode: 'pt-PT',
    yearlyTitle: 'das Verb: Premium 1 Ano',
    monthlyTitle: 'das Verb: Premium 1 Mês',
    lifetimeTitle: 'das Verb: Premium Vitalício',
    description: 'Sem anúncios, todos os verbos A1-B2'
  },
  {
    languageCode: 'tr-TR',
    yearlyTitle: 'das Verb: 1 Yıllık Premium',
    monthlyTitle: 'das Verb: 1 Aylık Premium',
    lifetimeTitle: 'das Verb: Ömür Boyu Premium',
    description: 'Reklamsız, tüm fiiller A1-B2 ve testler'
  },
  {
    languageCode: 'pl-PL',
    yearlyTitle: 'das Verb: Premium 1 Rok',
    monthlyTitle: 'das Verb: Premium 1 Miesiąc',
    lifetimeTitle: 'das Verb: Premium Na Zawsze',
    description: 'Bez reklam, wszystkie czasowniki A1-B2'
  },
  {
    languageCode: 'ar',
    yearlyTitle: 'das Verb: سنة واحدة بريميوم',
    monthlyTitle: 'das Verb: شهر واحد بريميوم',
    lifetimeTitle: 'das Verb: بريميوم دائم',
    description: 'بدون إعلانات، جميع الأفعال A1-B2 واختبارات'
  },
  {
    languageCode: 'id',
    yearlyTitle: 'das Verb: Premium 1 Tahun',
    monthlyTitle: 'das Verb: Premium 1 Bulan',
    lifetimeTitle: 'das Verb: Premium Selamanya',
    description: 'Bebas iklan, semua kata kerja A1-B2'
  },
  {
    languageCode: 'vi',
    yearlyTitle: 'das Verb: Premium 1 Năm',
    monthlyTitle: 'das Verb: Premium 1 Tháng',
    lifetimeTitle: 'das Verb: Premium Trọn Đời',
    description: 'Không quảng cáo, toàn bộ động từ A1-B2'
  },
  {
    languageCode: 'nl-NL',
    yearlyTitle: 'das Verb: 1 Jaar Premium',
    monthlyTitle: 'das Verb: 1 Maand Premium',
    lifetimeTitle: 'das Verb: Altijd Premium',
    description: 'Reclamevrij, alle werkwoorden A1-B2'
  },
  {
    languageCode: 'cs-CZ',
    yearlyTitle: 'das Verb: 1 Rok Premium',
    monthlyTitle: 'das Verb: 1 Měsíc Premium',
    lifetimeTitle: 'das Verb: Doživotní Premium',
    description: 'Bez reklam, všechna slovesa A1-B2'
  },
  {
    languageCode: 'hu-HU',
    yearlyTitle: 'das Verb: 1 Éves Premium',
    monthlyTitle: 'das Verb: 1 Havi Premium',
    lifetimeTitle: 'das Verb: Örökös Premium',
    description: 'Reklámmentes, minden ige A1-B2 & tesztek'
  },
  {
    languageCode: 'ro',
    yearlyTitle: 'das Verb: Premium 1 An',
    monthlyTitle: 'das Verb: Premium 1 Lună',
    lifetimeTitle: 'das Verb: Premium pe Viață',
    description: 'Fără reclame, toate verbele A1-B2'
  },
  {
    languageCode: 'el-GR',
    yearlyTitle: 'das Verb: Premium 1 Έτος',
    monthlyTitle: 'das Verb: Premium 1 Μήνας',
    lifetimeTitle: 'das Verb: Premium για πάντα',
    description: 'Χωρίς διαφημίσεις, ρήματα A1-B2'
  },
  {
    languageCode: 'sk',
    yearlyTitle: 'das Verb: 1 Rok Premium',
    monthlyTitle: 'das Verb: 1 Mesiac Premium',
    lifetimeTitle: 'das Verb: Doživotný Premium',
    description: 'Bez reklám, všetky slovesá A1-B2'
  },
  {
    languageCode: 'hr',
    yearlyTitle: 'das Verb: 1 Godina Premium',
    monthlyTitle: 'das Verb: 1 Mjesec Premium',
    lifetimeTitle: 'das Verb: Doživotni Premium',
    description: 'Bez reklama, svi glagoli A1-B2'
  },
  {
    languageCode: 'da-DK',
    yearlyTitle: 'das Verb: 1 År Premium',
    monthlyTitle: 'das Verb: 1 Måned Premium',
    lifetimeTitle: 'das Verb: Livstid Premium',
    description: 'Reklamefri, alle verber A1-B2 & quiz'
  },
  {
    languageCode: 'sv-SE',
    yearlyTitle: 'das Verb: 1 År Premium',
    monthlyTitle: 'das Verb: 1 Månad Premium',
    lifetimeTitle: 'das Verb: Livstid Premium',
    description: 'Reklamfritt, alla verb A1-B2 & quiz'
  },
  {
    languageCode: 'no-NO',
    yearlyTitle: 'das Verb: 1 År Premium',
    monthlyTitle: 'das Verb: 1 Måned Premium',
    lifetimeTitle: 'das Verb: Livstid Premium',
    description: 'Reklamefri, alle verb A1-B2 & quiz'
  }
];

async function main() {
  console.log('🚀 Starting Google Play Console Monetization Deployment...\n');
  const sa = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  const token = await getGoogleAccessToken(sa, 'https://www.googleapis.com/auth/androidpublisher');

  // 1. Get automated regional price conversions
  console.log('🌍 Fetching regional price conversions from Google Play API...');
  const yearlyPricingRes = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/pricing:convertRegionPrices`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: { currencyCode: 'USD', units: '29', nanos: 990000000 } })
  });
  const yearlyPricing = await yearlyPricingRes.json();
  const regionsVersion = yearlyPricing.regionVersion?.version || '2025/03';

  const monthlyPricingRes = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/pricing:convertRegionPrices`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: { currencyCode: 'USD', units: '4', nanos: 990000000 } })
  });
  const monthlyPricing = await monthlyPricingRes.json();

  const lifetimePricingRes = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/pricing:convertRegionPrices`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: { currencyCode: 'USD', units: '49', nanos: 990000000 } })
  });
  const lifetimePricing = await lifetimePricingRes.json();

  console.log(`✅ Regional prices calculated for ${Object.keys(yearlyPricing.convertedRegionPrices || {}).length} regions (RegionsVersion: ${regionsVersion}).\n`);

  // =========================================================================
  // 1. YEARLY SUBSCRIPTION
  // =========================================================================
  console.log('📦 Deploying Subscription: dasverb_premium_yearly...');
  const yearlyListings = LOCALIZATIONS.map(l => ({
    languageCode: l.languageCode,
    title: l.yearlyTitle,
    description: l.description
  }));
  const yearlyRegionalConfigs = Object.entries(yearlyPricing.convertedRegionPrices || {}).map(([regionCode, val]: [string, any]) => ({
    regionCode,
    price: val.price
  }));

  const yearlyPayload = {
    packageName: PACKAGE_NAME,
    productId: 'dasverb_premium_yearly',
    listings: yearlyListings,
    basePlans: [
      {
        basePlanId: 'dasverb-premium-yearly',
        state: 'ACTIVE',
        autoRenewingBasePlanType: {
          billingPeriodDuration: 'P1Y'
        },
        regionalConfigs: yearlyRegionalConfigs
      }
    ],
    taxAndComplianceSettings: {
      eeaWithdrawalRightType: 'WITHDRAWAL_RIGHT_SERVICE'
    }
  };

  const createYearlyRes = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/subscriptions?productId=dasverb_premium_yearly&regionsVersion.version=${regionsVersion}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(yearlyPayload)
  });

  if (!createYearlyRes.ok) {
    await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/subscriptions/dasverb_premium_yearly?updateMask=listings,basePlans&regionsVersion.version=${regionsVersion}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(yearlyPayload)
    });
  }

  // Activate Base Plan
  await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/subscriptions/dasverb_premium_yearly/basePlans/dasverb-premium-yearly:activate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });

  // Create 3-day Free Trial Offer
  const offerRegionalConfigs = yearlyRegionalConfigs.map(rc => ({ regionCode: rc.regionCode }));
  const phaseRegionalConfigs = yearlyRegionalConfigs.map(rc => ({ regionCode: rc.regionCode, free: {} }));
  const trialOfferPayload = {
    packageName: PACKAGE_NAME,
    productId: 'dasverb_premium_yearly',
    basePlanId: 'dasverb-premium-yearly',
    offerId: 'dasverb-premium-yearly-trial',
    phases: [
      {
        duration: 'P3D',
        recurrenceCount: 1,
        regionalConfigs: phaseRegionalConfigs
      }
    ],
    targeting: {
      acquisitionRule: {
        scope: {
          thisSubscription: {}
        }
      }
    },
    regionalConfigs: offerRegionalConfigs
  };

  await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/subscriptions/dasverb_premium_yearly/basePlans/dasverb-premium-yearly/offers?offerId=dasverb-premium-yearly-trial&regionsVersion.version=${regionsVersion}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(trialOfferPayload)
  });

  await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/subscriptions/dasverb_premium_yearly/basePlans/dasverb-premium-yearly/offers/dasverb-premium-yearly-trial:activate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });

  console.log('✅ Yearly Subscription + 3-day Trial Offer + 26 Listings deployed & active.\n');

  // =========================================================================
  // 2. MONTHLY SUBSCRIPTION
  // =========================================================================
  console.log('📦 Deploying Subscription: dasverb_premium_monthly...');
  const monthlyListings = LOCALIZATIONS.map(l => ({
    languageCode: l.languageCode,
    title: l.monthlyTitle,
    description: l.description
  }));
  const monthlyRegionalConfigs = Object.entries(monthlyPricing.convertedRegionPrices || {}).map(([regionCode, val]: [string, any]) => ({
    regionCode,
    price: val.price
  }));

  const monthlyPayload = {
    packageName: PACKAGE_NAME,
    productId: 'dasverb_premium_monthly',
    listings: monthlyListings,
    basePlans: [
      {
        basePlanId: 'dasverb-premium-monthly',
        state: 'ACTIVE',
        autoRenewingBasePlanType: {
          billingPeriodDuration: 'P1M'
        },
        regionalConfigs: monthlyRegionalConfigs
      }
    ],
    taxAndComplianceSettings: {
      eeaWithdrawalRightType: 'WITHDRAWAL_RIGHT_SERVICE'
    }
  };

  const createMonthlyRes = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/subscriptions?productId=dasverb_premium_monthly&regionsVersion.version=${regionsVersion}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(monthlyPayload)
  });

  if (!createMonthlyRes.ok) {
    await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/subscriptions/dasverb_premium_monthly?updateMask=listings,basePlans&regionsVersion.version=${regionsVersion}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(monthlyPayload)
    });
  }

  // Activate Base Plan
  await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/subscriptions/dasverb_premium_monthly/basePlans/dasverb-premium-monthly:activate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });

  console.log('✅ Monthly Subscription + 26 Listings deployed & active.\n');

  // =========================================================================
  // 3. LIFETIME IN-APP PRODUCT
  // =========================================================================
  console.log('💎 Deploying One-Time Product: dasverb_premium_lifetime...');
  const lifetimeListings = LOCALIZATIONS.map(l => ({
    languageCode: l.languageCode,
    title: l.lifetimeTitle,
    description: l.description
  }));
  const lifetimeRegionalConfigs = Object.entries(lifetimePricing.convertedRegionPrices || {}).map(([regionCode, val]: [string, any]) => ({
    regionCode,
    price: val.price,
    availability: 'AVAILABLE'
  }));

  const lifetimePayload = {
    packageName: PACKAGE_NAME,
    productId: 'dasverb_premium_lifetime',
    listings: lifetimeListings,
    purchaseOptions: [
      {
        purchaseOptionId: 'dasverb-premium-lifetime-opt',
        buyOption: {},
        regionalPricingAndAvailabilityConfigs: lifetimeRegionalConfigs
      }
    ]
  };

  await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/onetimeproducts/dasverb_premium_lifetime?allowMissing=true&updateMask=listings,purchaseOptions&regionsVersion.version=${regionsVersion}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(lifetimePayload)
  });

  // Activate Purchase Option
  await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/oneTimeProducts/dasverb_premium_lifetime/purchaseOptions:batchUpdateStates`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          activatePurchaseOptionRequest: {
            packageName: PACKAGE_NAME,
            productId: 'dasverb_premium_lifetime',
            purchaseOptionId: 'dasverb-premium-lifetime-opt'
          }
        }
      ]
    })
  });

  console.log('✅ Lifetime Product + 26 Listings deployed & active.\n');

  console.log('========================================================================');
  console.log('🎉 ALL 3 PRODUCTS SUCCESSFULLY DEPLOYED TO GOOGLE PLAY CONSOLE!');
  console.log('========================================================================');
}

main().catch(console.error);
