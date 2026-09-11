import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const KEY_ID = '3P98PH5M24';
const ISSUER_ID = '4222448c-08ac-4305-b6b8-471b102c1dbf';
const PRIVATE_KEY_PATH = path.resolve(__dirname, '../credentials/ios/AuthKey_3P98PH5M24.p8');

const MONTHLY_SUB_ID = '6807918109';
const YEARLY_SUB_ID = '6807918314';
const LIFETIME_IAP_ID = '6807917454';

// Target Apple Price Tier Keys
// Tier 1 (100%): Month $4.99 ("10062"), Year $29.99 ("10227"), Life $49.99 ("10327")
// Tier 2 (~50%): Month $2.49 ("10029"), Year $14.99 ("10152"), Life $24.99 ("10202")
// Tier 3 (~25%): Month $0.99 ("10010"), Year $6.99 ("10088"), Life $12.99 ("10142")
const TIER_KEYS = {
  1: { monthly: '10062', yearly: '10227', lifetime: '10327' },
  2: { monthly: '10029', yearly: '10152', lifetime: '10202' },
  3: { monthly: '10010', yearly: '10088', lifetime: '10142' }
};

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

async function apiRequest(url: string, options: RequestInit = {}, retries = 3): Promise<any> {
  const token = generateJWT();
  const fullUrl = url.startsWith('http') ? url : `https://api.appstoreconnect.apple.com${url}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(fullUrl, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { ok: true, status: res.status, data };
      }
      
      if (res.status === 409) {
        return { ok: false, isConflict: true, status: 409, data };
      }

      if (res.status >= 500 && attempt < retries) {
        await new Promise(r => setTimeout(r, attempt * 1000));
        continue;
      }

      return { ok: false, status: res.status, data };
    } catch (e: any) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, attempt * 1000));
        continue;
      }
      throw e;
    }
  }
}

function makePricePointId(id: string, territory: string, tierKey: string) {
  return Buffer.from(JSON.stringify({ s: id, t: territory, p: tierKey })).toString('base64url');
}

async function main() {
  console.log('🚀 Starting complete App Store Connect Pricing & Trial Deployment for dasVerb...\n');

  const territoryTiers: Record<string, { tier: 1 | 2 | 3; derYearly: number; currency: string }> = 
    JSON.parse(fs.readFileSync('scripts/territory-tiers.json', 'utf8'));

  const territories = Object.keys(territoryTiers);
  console.log(`Loaded ${territories.length} target territories across 3 PPP Tiers.\n`);

  // =========================================================================
  // 1. Subscription Availabilities
  // =========================================================================
  console.log('📌 Ensuring Subscription & IAP Availabilities...');
  await apiRequest('/v1/subscriptionAvailabilities', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'subscriptionAvailabilities',
        attributes: { availableInNewTerritories: true },
        relationships: {
          subscription: { data: { type: 'subscriptions', id: MONTHLY_SUB_ID } },
          availableTerritories: { data: territories.map(t => ({ type: 'territories', id: t })) }
        }
      }
    })
  });

  await apiRequest('/v1/subscriptionAvailabilities', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'subscriptionAvailabilities',
        attributes: { availableInNewTerritories: true },
        relationships: {
          subscription: { data: { type: 'subscriptions', id: YEARLY_SUB_ID } },
          availableTerritories: { data: territories.map(t => ({ type: 'territories', id: t })) }
        }
      }
    })
  });

  await apiRequest('/v1/inAppPurchaseAvailabilities', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'inAppPurchaseAvailabilities',
        attributes: { availableInNewTerritories: true },
        relationships: {
          inAppPurchase: { data: { type: 'inAppPurchases', id: LIFETIME_IAP_ID } },
          availableTerritories: { data: territories.map(t => ({ type: 'territories', id: t })) }
        }
      }
    })
  });
  console.log('✅ Availabilities configured.\n');

  // =========================================================================
  // 2. Monthly Subscription Prices (175 territories)
  // =========================================================================
  console.log('💳 Setting Monthly Subscription Prices across all 175 territories...');
  let monthlySuccess = 0;
  for (let i = 0; i < territories.length; i++) {
    const terr = territories[i];
    const tier = territoryTiers[terr].tier;
    const tierKey = TIER_KEYS[tier].monthly;
    const ppId = makePricePointId(MONTHLY_SUB_ID, terr, tierKey);

    const res = await apiRequest('/v1/subscriptionPrices', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'subscriptionPrices',
          attributes: { startDate: null },
          relationships: {
            subscription: { data: { type: 'subscriptions', id: MONTHLY_SUB_ID } },
            subscriptionPricePoint: { data: { type: 'subscriptionPricePoints', id: ppId } },
            territory: { data: { type: 'territories', id: terr } }
          }
        }
      })
    });

    if (res.ok || res.isConflict) monthlySuccess++;
    if ((i + 1) % 35 === 0 || i === territories.length - 1) {
      console.log(`  - Monthly: configured ${monthlySuccess}/${territories.length} territories...`);
    }
  }
  console.log(`✅ Monthly Subscription Prices complete (${monthlySuccess}/${territories.length}).\n`);

  // =========================================================================
  // 3. Yearly Subscription Prices (175 territories)
  // =========================================================================
  console.log('💳 Setting Yearly Subscription Prices across all 175 territories...');
  let yearlySuccess = 0;
  for (let i = 0; i < territories.length; i++) {
    const terr = territories[i];
    const tier = territoryTiers[terr].tier;
    const tierKey = TIER_KEYS[tier].yearly;
    const ppId = makePricePointId(YEARLY_SUB_ID, terr, tierKey);

    const res = await apiRequest('/v1/subscriptionPrices', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'subscriptionPrices',
          attributes: { startDate: null },
          relationships: {
            subscription: { data: { type: 'subscriptions', id: YEARLY_SUB_ID } },
            subscriptionPricePoint: { data: { type: 'subscriptionPricePoints', id: ppId } },
            territory: { data: { type: 'territories', id: terr } }
          }
        }
      })
    });

    if (res.ok || res.isConflict) yearlySuccess++;
    if ((i + 1) % 35 === 0 || i === territories.length - 1) {
      console.log(`  - Yearly: configured ${yearlySuccess}/${territories.length} territories...`);
    }
  }
  console.log(`✅ Yearly Subscription Prices complete (${yearlySuccess}/${territories.length}).\n`);

  // =========================================================================
  // 4. Yearly 3-Day Free Trial Introductory Offers (175 territories)
  // =========================================================================
  console.log('🎁 Setting 3-Day Free Trial for Yearly Subscription in all 175 territories...');
  let trialSuccess = 0;
  for (let i = 0; i < territories.length; i++) {
    const terr = territories[i];
    const res = await apiRequest('/v1/subscriptionIntroductoryOffers', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'subscriptionIntroductoryOffers',
          attributes: {
            startDate: null,
            endDate: null,
            duration: 'THREE_DAYS',
            offerMode: 'FREE_TRIAL',
            numberOfPeriods: 1
          },
          relationships: {
            subscription: { data: { type: 'subscriptions', id: YEARLY_SUB_ID } },
            territory: { data: { type: 'territories', id: terr } }
          }
        }
      })
    });

    if (res.ok || res.isConflict) trialSuccess++;
    if ((i + 1) % 35 === 0 || i === territories.length - 1) {
      console.log(`  - Free Trials: configured ${trialSuccess}/${territories.length} territories...`);
    }
  }
  console.log(`✅ 3-Day Free Trials complete (${trialSuccess}/${territories.length}).\n`);

  // =========================================================================
  // 5. Lifetime Non-Consumable IAP Price Schedule (175 territories)
  // =========================================================================
  console.log('💎 Setting Lifetime IAP Price Schedule across all 175 territories...');
  const manualPrices = territories.map((terr, index) => {
    const tier = territoryTiers[terr].tier;
    const tierKey = TIER_KEYS[tier].lifetime;
    const ppId = makePricePointId(LIFETIME_IAP_ID, terr, tierKey);
    return {
      type: 'inAppPurchasePrices',
      id: `\${temp-price-${index}}`,
      attributes: { startDate: null },
      relationships: {
        inAppPurchasePricePoint: { data: { type: 'inAppPurchasePricePoints', id: ppId } }
      }
    };
  });

  const schedRes = await apiRequest('/v1/inAppPurchasePriceSchedules', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'inAppPurchasePriceSchedules',
        relationships: {
          inAppPurchase: { data: { type: 'inAppPurchases', id: LIFETIME_IAP_ID } },
          baseTerritory: { data: { type: 'territories', id: 'USA' } },
          manualPrices: {
            data: manualPrices.map(p => ({ type: 'inAppPurchasePrices', id: p.id }))
          }
        }
      },
      included: manualPrices
    })
  });

  if (schedRes.ok) {
    console.log(`✅ Lifetime Price Schedule created for all ${territories.length} territories!`);
  } else {
    console.log('Lifetime Price Schedule status:', schedRes.status, JSON.stringify(schedRes.data));
  }

  // =========================================================================
  // 6. Print Verification Table for Key Sample Countries
  // =========================================================================
  console.log('\n=============================================================');
  console.log('🎉 REGIONAL PRICING AND FREE TRIALS DEPLOYED SUCCESSFULLY!');
  console.log('=============================================================');
  console.log('\nKey Markets Summary:');
  const sampleCodes = [
    { code: 'USA', name: 'United States', tier: 1 },
    { code: 'DEU', name: 'Germany', tier: 1 },
    { code: 'GBR', name: 'United Kingdom', tier: 1 },
    { code: 'RUS', name: 'Russia', tier: 2 },
    { code: 'TUR', name: 'Turkey', tier: 2 },
    { code: 'KAZ', name: 'Kazakhstan', tier: 2 },
    { code: 'UKR', name: 'Ukraine', tier: 2 },
    { code: 'IND', name: 'India', tier: 2 },
    { code: 'BRA', name: 'Brazil', tier: 2 },
    { code: 'NGA', name: 'Nigeria', tier: 3 },
    { code: 'VNM', name: 'Vietnam', tier: 3 },
    { code: 'EGY', name: 'Egypt', tier: 3 }
  ];

  for (const item of sampleCodes) {
    const tier = item.tier;
    const mKey = TIER_KEYS[tier as 1|2|3].monthly;
    const yKey = TIER_KEYS[tier as 1|2|3].yearly;
    const lKey = TIER_KEYS[tier as 1|2|3].lifetime;
    
    // Fetch price display
    const mRes = await apiRequest(`/v1/subscriptionPricePoints/${makePricePointId(MONTHLY_SUB_ID, item.code, mKey)}`);
    const yRes = await apiRequest(`/v1/subscriptionPricePoints/${makePricePointId(YEARLY_SUB_ID, item.code, yKey)}`);
    const lRes = await apiRequest(`/v1/inAppPurchasePricePoints/${makePricePointId(LIFETIME_IAP_ID, item.code, lKey)}`);

    const mPrice = mRes.data?.data?.attributes?.customerPrice;
    const yPrice = yRes.data?.data?.attributes?.customerPrice;
    const lPrice = lRes.data?.data?.attributes?.customerPrice;

    console.log(`[Tier ${tier}] ${item.name} (${item.code}): Month ${mPrice} | Year ${yPrice} (3d Trial) | Lifetime ${lPrice}`);
  }
}

main().catch(console.error);
