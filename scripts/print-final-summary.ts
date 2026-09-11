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

async function apiRequest(url: string) {
  const token = generateJWT();
  const fullUrl = url.startsWith('http') ? url : `https://api.appstoreconnect.apple.com${url}`;
  const res = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.json();
}

function makePricePointId(id: string, territory: string, tierKey: string) {
  return Buffer.from(JSON.stringify({ s: id, t: territory, p: tierKey })).toString('base64url');
}

const TIER_KEYS = {
  1: { monthly: '10062', yearly: '10227', lifetime: '10327' },
  2: { monthly: '10029', yearly: '10152', lifetime: '10202' },
  3: { monthly: '10010', yearly: '10088', lifetime: '10142' }
};

async function main() {
  console.log('========================================================================================================');
  console.log('🏆 DASVERB APP STORE CONNECT PRICING & REGIONAL TIERS (PPP) FULL REPORT');
  console.log('========================================================================================================\n');

  const testCountries = [
    // Tier 1 (100% Base)
    { code: 'USA', name: 'United States', currency: 'USD', tier: 1 },
    { code: 'DEU', name: 'Germany', currency: 'EUR', tier: 1 },
    { code: 'AUT', name: 'Austria', currency: 'EUR', tier: 1 },
    { code: 'CHE', name: 'Switzerland', currency: 'CHF', tier: 1 },
    { code: 'GBR', name: 'United Kingdom', currency: 'GBP', tier: 1 },
    { code: 'FRA', name: 'France', currency: 'EUR', tier: 1 },
    { code: 'JPN', name: 'Japan', currency: 'JPY', tier: 1 },
    { code: 'ARE', name: 'UAE', currency: 'AED', tier: 1 },
    { code: 'AUS', name: 'Australia', currency: 'AUD', tier: 1 },
    { code: 'CAN', name: 'Canada', currency: 'CAD', tier: 1 },
    
    // Tier 2 (~50% Emerging/Middle-Income)
    { code: 'RUS', name: 'Russia', currency: 'RUB', tier: 2 },
    { code: 'TUR', name: 'Turkey', currency: 'TRY', tier: 2 },
    { code: 'KAZ', name: 'Kazakhstan', currency: 'KZT', tier: 2 },
    { code: 'UKR', name: 'Ukraine', currency: 'USD', tier: 2 },
    { code: 'POL', name: 'Poland', currency: 'PLN', tier: 2 },
    { code: 'BRA', name: 'Brazil', currency: 'BRL', tier: 2 },
    { code: 'MEX', name: 'Mexico', currency: 'MXN', tier: 2 },
    { code: 'IND', name: 'India', currency: 'INR', tier: 2 },
    { code: 'ROU', name: 'Romania', currency: 'RON', tier: 2 },
    
    // Tier 3 (~20-25% Low Income)
    { code: 'NGA', name: 'Nigeria', currency: 'NGN', tier: 3 },
    { code: 'VNM', name: 'Vietnam', currency: 'VND', tier: 3 },
    { code: 'EGY', name: 'Egypt', currency: 'EGP', tier: 3 },
    { code: 'IDN', name: 'Indonesia', currency: 'IDR', tier: 3 },
    { code: 'PAK', name: 'Pakistan', currency: 'PKR', tier: 3 },
    { code: 'UZB', name: 'Uzbekistan', currency: 'USD', tier: 3 }
  ];

  for (const c of testCountries) {
    const t = c.tier as 1 | 2 | 3;
    const mId = makePricePointId(MONTHLY_SUB_ID, c.code, TIER_KEYS[t].monthly);
    const yId = makePricePointId(YEARLY_SUB_ID, c.code, TIER_KEYS[t].yearly);
    const lId = makePricePointId(LIFETIME_IAP_ID, c.code, TIER_KEYS[t].lifetime);

    const mRes = await apiRequest(`/v1/subscriptionPricePoints/${mId}`);
    const yRes = await apiRequest(`/v1/subscriptionPricePoints/${yId}`);
    const lRes = await apiRequest(`/v1/inAppPurchasePricePoints/${lId}`);

    const mPrice = mRes.data?.attributes?.customerPrice || 'N/A';
    const yPrice = yRes.data?.attributes?.customerPrice || 'N/A';
    const lPrice = lRes.data?.attributes?.customerPrice || 'N/A';

    console.log(`[Tier ${t}] ${c.name.padEnd(16)} (${c.code}): Month: ${mPrice.padStart(6)} ${c.currency.padEnd(3)} | Year (3d trial): ${yPrice.padStart(7)} ${c.currency.padEnd(3)} | Lifetime: ${lPrice.padStart(7)} ${c.currency.padEnd(3)}`);
  }
}

main().catch(console.error);
