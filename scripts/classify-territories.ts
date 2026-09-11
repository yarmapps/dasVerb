import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const KEY_ID = '3P98PH5M24';
const ISSUER_ID = '4222448c-08ac-4305-b6b8-471b102c1dbf';
const PRIVATE_KEY_PATH = path.resolve(__dirname, '../credentials/ios/AuthKey_3P98PH5M24.p8');

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
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function fetchAllPages(initialUrl: string) {
  let results: any[] = [];
  let included: any[] = [];
  let nextUrl: string | null = initialUrl;

  while (nextUrl) {
    const res = await apiRequest(nextUrl);
    results = results.concat(res.data || []);
    if (res.included) {
      included = included.concat(res.included);
    }
    nextUrl = res.links?.next || null;
  }
  return { data: results, included };
}

async function main() {
  console.log('Loading Der Die Das reference prices...');
  const derData = JSON.parse(fs.readFileSync('scripts/der-artikel-prices.json', 'utf8'));
  
  // Classify each territory by tier based on Der Die Das yearly price
  const territoryTiers: Record<string, { tier: 1 | 2 | 3; derYearly: number; currency: string }> = {};
  for (const item of derData.yearly) {
    const code = item.territoryCode;
    const price = parseFloat(item.customerPrice);
    let tier: 1 | 2 | 3 = 1;
    
    // In Der Die Das: Tier 1 had USD 17.99, EUR 19.99, AUD 29.99, CAD 24.99, GBP 17.99, CHF 15.0, JPY 3000, etc.
    // Tier 2 had USD 8.99-9.99, RUB 799, TRY 199.99, KZT 4990, INR 399, BRL 59.9, MXN 199, PLN 39.99, RON 49.99
    // Tier 3 had USD 3.99-4.99, NGN 6900, VND 119000, IDR 69000, PKR 1100, etc.
    const tier1Territories = [
      'USA', 'DEU', 'AUT', 'CHE', 'GBR', 'FRA', 'ITA', 'ESP', 'CAN', 'AUS', 
      'JPN', 'NLD', 'SWE', 'NOR', 'DNK', 'FIN', 'BEL', 'IRL', 'NZL', 'SGP', 
      'HKG', 'TWN', 'KOR', 'ISR', 'ARE', 'SAU', 'QAT', 'KWT', 'BHR', 'OMN',
      'LUX', 'PRT', 'GRC', 'CYP', 'MLT', 'ISL'
    ];
    
    const tier3Territories = [
      'AFG', 'AGO', 'DZA', 'BEN', 'BWA', 'BFA', 'CMR', 'CPV', 'TCD', 'COG', 'COD',
      'CIV', 'EGY', 'GHA', 'KEN', 'MDG', 'MWI', 'MLI', 'MRT', 'MUS', 'MAR', 'MOZ',
      'NAM', 'NER', 'NGA', 'RWA', 'SEN', 'SLE', 'ZAF', 'TZA', 'UGA', 'ZMB', 'ZWE',
      'BGD', 'BTN', 'KHM', 'FJI', 'IDN', 'LAO', 'FSM', 'MNG', 'MMR', 'NRU', 'NPL',
      'PAK', 'PNG', 'PHL', 'WSM', 'SLB', 'LKA', 'TJK', 'TON', 'TUV', 'VUT', 'VNM',
      'YEM', 'BOL', 'ECU', 'SLV', 'GTM', 'HND', 'NIC', 'PRY', 'SUR', 'UZB', 'KGZ'
    ];

    if (tier1Territories.includes(code)) {
      tier = 1;
    } else if (tier3Territories.includes(code)) {
      tier = 3;
    } else {
      tier = 2; // Middle-income: RUS, TUR, UKR, KAZ, POL, BRA, MEX, IND, ROU, CZE, HUN, etc.
    }

    territoryTiers[code] = {
      tier,
      derYearly: price,
      currency: item.currency
    };
  }

  console.log(`Classified ${Object.keys(territoryTiers).length} territories.`);

  // Save tier mapping to file for transparency
  fs.writeFileSync('scripts/territory-tiers.json', JSON.stringify(territoryTiers, null, 2));
  console.log('Saved territory classification to scripts/territory-tiers.json');
}

main().catch(console.error);
