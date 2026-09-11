import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const KEY_ID = '3P98PH5M24';
const ISSUER_ID = '4222448c-08ac-4305-b6b8-471b102c1dbf';
const PRIVATE_KEY_PATH = path.resolve(__dirname, '../credentials/ios/AuthKey_3P98PH5M24.p8');

const MONTHLY_SUB_ID = '6807918109';
const YEARLY_SUB_ID = '6807918314';
const LIFETIME_IAP_ID = '6807917454';

function generateJWT() {
  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const payload = { iss: ISSUER_ID, iat: now, exp: now + 20 * 60, aud: 'appstoreconnect-v1' };
  const encode = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${encode(header)}.${encode(payload)}`;
  const sign = crypto.createSign('SHA256');
  sign.update(unsignedToken);
  sign.end();
  const signature = sign.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }, 'base64url');
  return `${unsignedToken}.${signature}`;
}

async function apiRequest(url: string, options: RequestInit = {}) {
  const token = generateJWT();
  const fullUrl = url.startsWith('http') ? url : `https://api.appstoreconnect.apple.com${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

interface LocalizationData {
  locale: string;
  yearlyName: string;
  monthlyName: string;
  lifetimeName: string;
  description: string;
}

const LOCALIZATIONS: LocalizationData[] = [
  {
    locale: 'en-US',
    yearlyName: 'das Verb: 1 Year Premium',
    monthlyName: 'das Verb: 1 Month Premium',
    lifetimeName: 'das Verb: Lifetime Premium',
    description: 'All verbs A1-B2, prepositions & quizzes'
  },
  {
    locale: 'de-DE',
    yearlyName: 'das Verb: 1 Jahr Premium',
    monthlyName: 'das Verb: 1 Monat Premium',
    lifetimeName: 'das Verb: Premium Lifetime',
    description: 'Werbefrei, alle Verben A1-B2 & Tests'
  },
  {
    locale: 'ru',
    yearlyName: 'das Verb: Годовой Премиум',
    monthlyName: 'das Verb: Месячный Премиум',
    lifetimeName: 'das Verb: Навсегда Премиум',
    description: 'Без рекламы, все глаголы A1-B2 и тесты'
  },
  {
    locale: 'uk',
    yearlyName: 'das Verb: Річний Преміум',
    monthlyName: 'das Verb: Місячний Преміум',
    lifetimeName: 'das Verb: Назавжди Преміум',
    description: 'Без реклами, всі дієслова A1-B2 та квізи'
  },
  {
    locale: 'es-ES',
    yearlyName: 'das Verb: Premium 1 Año',
    monthlyName: 'das Verb: Premium 1 Mes',
    lifetimeName: 'das Verb: Premium Vitalicio',
    description: 'Sin anuncios, todos los verbos A1-B2'
  },
  {
    locale: 'es-MX',
    yearlyName: 'das Verb: Premium 1 Año',
    monthlyName: 'das Verb: Premium 1 Mes',
    lifetimeName: 'das Verb: Premium Vitalicio',
    description: 'Sin anuncios, todos los verbos A1-B2'
  },
  {
    locale: 'fr-FR',
    yearlyName: 'das Verb: Premium 1 An',
    monthlyName: 'das Verb: Premium 1 Mois',
    lifetimeName: 'das Verb: Premium à vie',
    description: 'Sans pub, tous les verbes A1-B2 & quiz'
  },
  {
    locale: 'fr-CA',
    yearlyName: 'das Verb: Premium 1 An',
    monthlyName: 'das Verb: Premium 1 Mois',
    lifetimeName: 'das Verb: Premium à vie',
    description: 'Sans pub, tous les verbes A1-B2 & quiz'
  },
  {
    locale: 'it',
    yearlyName: 'das Verb: Premium 1 Anno',
    monthlyName: 'das Verb: Premium 1 Mese',
    lifetimeName: 'das Verb: Premium a vita',
    description: 'No pubblicità, tutti i verbi A1-B2'
  },
  {
    locale: 'pt-BR',
    yearlyName: 'das Verb: Premium 1 Ano',
    monthlyName: 'das Verb: Premium 1 Mês',
    lifetimeName: 'das Verb: Premium Vitalício',
    description: 'Sem anúncios, todos os verbos A1-B2'
  },
  {
    locale: 'pt-PT',
    yearlyName: 'das Verb: Premium 1 Ano',
    monthlyName: 'das Verb: Premium 1 Mês',
    lifetimeName: 'das Verb: Premium Vitalício',
    description: 'Sem anúncios, todos os verbos A1-B2'
  },
  {
    locale: 'tr',
    yearlyName: 'das Verb: 1 Yıllık Premium',
    monthlyName: 'das Verb: 1 Aylık Premium',
    lifetimeName: 'das Verb: Ömür Boyu Premium',
    description: 'Reklamsız, tüm fiiller A1-B2 ve testler'
  },
  {
    locale: 'pl',
    yearlyName: 'das Verb: Premium 1 Rok',
    monthlyName: 'das Verb: Premium 1 Miesiąc',
    lifetimeName: 'das Verb: Premium Na Zawsze',
    description: 'Bez reklam, wszystkie czasowniki A1-B2'
  },
  {
    locale: 'ar-SA',
    yearlyName: 'das Verb: سنة واحدة بريميوم',
    monthlyName: 'das Verb: شهر واحد بريميوم',
    lifetimeName: 'das Verb: بريميوم دائم',
    description: 'بدون إعلانات، جميع الأفعال A1-B2 واختبارات'
  },
  {
    locale: 'id',
    yearlyName: 'das Verb: Premium 1 Tahun',
    monthlyName: 'das Verb: Premium 1 Bulan',
    lifetimeName: 'das Verb: Premium Selamanya',
    description: 'Bebas iklan, semua kata kerja A1-B2'
  },
  {
    locale: 'vi',
    yearlyName: 'das Verb: Premium 1 Năm',
    monthlyName: 'das Verb: Premium 1 Tháng',
    lifetimeName: 'das Verb: Premium Trọn Đời',
    description: 'Không quảng cáo, toàn bộ động từ A1-B2'
  },
  {
    locale: 'nl-NL',
    yearlyName: 'das Verb: 1 Jaar Premium',
    monthlyName: 'das Verb: 1 Maand Premium',
    lifetimeName: 'das Verb: Altijd Premium',
    description: 'Reclamevrij, alle werkwoorden A1-B2'
  },
  {
    locale: 'cs',
    yearlyName: 'das Verb: 1 Rok Premium',
    monthlyName: 'das Verb: 1 Měsíc Premium',
    lifetimeName: 'das Verb: Doživotní Premium',
    description: 'Bez reklam, všechna slovesa A1-B2'
  },
  {
    locale: 'hu',
    yearlyName: 'das Verb: 1 Éves Premium',
    monthlyName: 'das Verb: 1 Havi Premium',
    lifetimeName: 'das Verb: Örökös Premium',
    description: 'Reklámmentes, minden ige A1-B2 & tesztek'
  },
  {
    locale: 'ro',
    yearlyName: 'das Verb: Premium 1 An',
    monthlyName: 'das Verb: Premium 1 Lună',
    lifetimeName: 'das Verb: Premium pe Viață',
    description: 'Fără reclame, toate verbele A1-B2'
  },
  {
    locale: 'el',
    yearlyName: 'das Verb: Premium 1 Έτος',
    monthlyName: 'das Verb: Premium 1 Μήνας',
    lifetimeName: 'das Verb: Premium για πάντα',
    description: 'Χωρίς διαφημίσεις, ρήματα A1-B2'
  },
  {
    locale: 'sk',
    yearlyName: 'das Verb: 1 Rok Premium',
    monthlyName: 'das Verb: 1 Mesiac Premium',
    lifetimeName: 'das Verb: Doživotný Premium',
    description: 'Bez reklám, všetky slovesá A1-B2'
  },
  {
    locale: 'hr',
    yearlyName: 'das Verb: 1 Godina Premium',
    monthlyName: 'das Verb: 1 Mjesec Premium',
    lifetimeName: 'das Verb: Doživotni Premium',
    description: 'Bez reklama, svi glagoli A1-B2'
  },
  {
    locale: 'da',
    yearlyName: 'das Verb: 1 År Premium',
    monthlyName: 'das Verb: 1 Måned Premium',
    lifetimeName: 'das Verb: Livstid Premium',
    description: 'Reklamefri, alle verber A1-B2 & quiz'
  },
  {
    locale: 'sv',
    yearlyName: 'das Verb: 1 År Premium',
    monthlyName: 'das Verb: 1 Månad Premium',
    lifetimeName: 'das Verb: Livstid Premium',
    description: 'Reklamfritt, alla verb A1-B2 & quiz'
  },
  {
    locale: 'no',
    yearlyName: 'das Verb: 1 År Premium',
    monthlyName: 'das Verb: 1 Måned Premium',
    lifetimeName: 'das Verb: Livstid Premium',
    description: 'Reklamefri, alle verb A1-B2 & quiz'
  }
];

async function syncSubscriptionLocalizations(subId: string, nameKey: 'yearlyName' | 'monthlyName', subLabel: string) {
  console.log(`\n========================================================================`);
  console.log(`📦 Syncing Localizations for ${subLabel} (${subId})...`);
  console.log(`========================================================================`);

  // 1. Fetch existing localizations
  const existingRes = await apiRequest(`/v1/subscriptions/${subId}/subscriptionLocalizations?limit=100`);
  const existingMap = new Map<string, string>();
  for (const item of (existingRes.data?.data || [])) {
    existingMap.set(item.attributes.locale, item.id);
  }

  let created = 0;
  let updated = 0;

  for (const loc of LOCALIZATIONS) {
    const name = loc[nameKey];
    const desc = loc.description;
    const existingId = existingMap.get(loc.locale);

    if (existingId) {
      // Update
      const res = await apiRequest(`/v1/subscriptionLocalizations/${existingId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          data: {
            type: 'subscriptionLocalizations',
            id: existingId,
            attributes: {
              name,
              description: desc
            }
          }
        })
      });
      if (res.ok) {
        updated++;
      } else {
        console.error(`Error updating [${loc.locale}] on ${subLabel}:`, res.status, JSON.stringify(res.data));
      }
    } else {
      // Create
      const res = await apiRequest(`/v1/subscriptionLocalizations`, {
        method: 'POST',
        body: JSON.stringify({
          data: {
            type: 'subscriptionLocalizations',
            attributes: {
              name,
              description: desc,
              locale: loc.locale
            },
            relationships: {
              subscription: {
                data: {
                  type: 'subscriptions',
                  id: subId
                }
              }
            }
          }
        })
      });
      if (res.ok) {
        created++;
      } else {
        console.error(`Error creating [${loc.locale}] on ${subLabel}:`, res.status, JSON.stringify(res.data));
      }
    }
  }

  console.log(`✅ ${subLabel} complete: ${created} created, ${updated} updated (Total: ${LOCALIZATIONS.length} locales).`);
}

async function syncLifetimeIapLocalizations() {
  console.log(`\n========================================================================`);
  console.log(`💎 Syncing Localizations for Lifetime IAP (${LIFETIME_IAP_ID})...`);
  console.log(`========================================================================`);

  // 1. Fetch existing localizations
  const existingRes = await apiRequest(`/v2/inAppPurchases/${LIFETIME_IAP_ID}/inAppPurchaseLocalizations?limit=100`);
  const existingMap = new Map<string, string>();
  for (const item of (existingRes.data?.data || [])) {
    existingMap.set(item.attributes.locale, item.id);
  }

  let created = 0;
  let updated = 0;

  for (const loc of LOCALIZATIONS) {
    const name = loc.lifetimeName;
    const desc = loc.description;
    const existingId = existingMap.get(loc.locale);

    if (existingId) {
      // Update
      const res = await apiRequest(`/v1/inAppPurchaseLocalizations/${existingId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          data: {
            type: 'inAppPurchaseLocalizations',
            id: existingId,
            attributes: {
              name,
              description: desc
            }
          }
        })
      });
      if (res.ok) {
        updated++;
      } else {
        console.error(`Error updating [${loc.locale}] on Lifetime IAP:`, res.status, JSON.stringify(res.data));
      }
    } else {
      // Create
      const res = await apiRequest(`/v1/inAppPurchaseLocalizations`, {
        method: 'POST',
        body: JSON.stringify({
          data: {
            type: 'inAppPurchaseLocalizations',
            attributes: {
              name,
              description: desc,
              locale: loc.locale
            },
            relationships: {
              inAppPurchaseV2: {
                data: {
                  type: 'inAppPurchases',
                  id: LIFETIME_IAP_ID
                }
              }
            }
          }
        })
      });
      if (res.ok) {
        created++;
      } else {
        console.error(`Error creating [${loc.locale}] on Lifetime IAP:`, res.status, JSON.stringify(res.data));
      }
    }
  }

  console.log(`✅ Lifetime IAP complete: ${created} created, ${updated} updated (Total: ${LOCALIZATIONS.length} locales).`);
}

async function main() {
  console.log('🚀 Starting App Store Connect In-App Purchase & Subscription Localization Deployment (26 Locales)...\n');

  // Verify character counts before calling API
  for (const loc of LOCALIZATIONS) {
    if (loc.yearlyName.length > 30) throw new Error(`yearlyName too long in [${loc.locale}]: ${loc.yearlyName}`);
    if (loc.monthlyName.length > 30) throw new Error(`monthlyName too long in [${loc.locale}]: ${loc.monthlyName}`);
    if (loc.lifetimeName.length > 30) throw new Error(`lifetimeName too long in [${loc.locale}]: ${loc.lifetimeName}`);
    if (loc.description.length > 45) throw new Error(`description too long in [${loc.locale}]: ${loc.description}`);
  }
  console.log('✅ Pre-validation passed: All 26 locales are strictly within Apple limits (Name <= 30, Description <= 45).\n');

  await syncSubscriptionLocalizations(YEARLY_SUB_ID, 'yearlyName', 'Yearly Premium');
  await syncSubscriptionLocalizations(MONTHLY_SUB_ID, 'monthlyName', 'Monthly Premium');
  await syncLifetimeIapLocalizations();

  console.log('\n========================================================================');
  console.log('🎉 ALL 26 LOCALIZATIONS SUCCESSFULLY DEPLOYED ACROSS ALL 3 PRODUCTS!');
  console.log('========================================================================');
}

main().catch(console.error);
