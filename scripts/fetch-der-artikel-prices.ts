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

async function apiRequest(url: string) {
  const token = generateJWT();
  const fullUrl = url.startsWith('http') ? url : `https://api.appstoreconnect.apple.com/v1${url}`;
  const res = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`API Error on ${url}:`, JSON.stringify(data, null, 2));
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
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
  console.log('Fetching all prices for Der Die Das (ID: 6760616325)...');
  
  // 1. Monthly (6760625191) & Yearly (6760625272)
  const monthlyPrices = await fetchAllPages('/subscriptions/6760625191/prices?include=subscriptionPricePoint,territory&limit=200');
  const yearlyPrices = await fetchAllPages('/subscriptions/6760625272/prices?include=subscriptionPricePoint,territory&limit=200');
  
  // 2. Lifetime IAP price schedule (6760625001)
  let lifetimePrices: any = { data: [], included: [] };
  try {
    lifetimePrices = await fetchAllPages('/inAppPurchasesV2/6760625001/pricePoints?include=territory&limit=200');
  } catch (e: any) {
    console.log('Could not fetch lifetime price points directly:', e.message);
  }

  const mapPrices = (data: any[], included: any[]) => {
    const pricePoints = new Map(included.filter(i => i.type === 'subscriptionPricePoints' || i.type === 'inAppPurchasePricePoints').map(i => [i.id, i.attributes]));
    const territories = new Map(included.filter(i => i.type === 'territories').map(i => [i.id, i.attributes]));
    
    const list: any[] = [];
    for (const item of data) {
      const terrId = item.relationships?.territory?.data?.id;
      const ppId = item.relationships?.subscriptionPricePoint?.data?.id || item.relationships?.inAppPurchasePricePoint?.data?.id;
      const pp = pricePoints.get(ppId);
      const terr = territories.get(terrId);
      list.push({
        territoryCode: terrId,
        currency: terr?.currency,
        customerPrice: pp?.customerPrice,
        proceeds: pp?.proceeds
      });
    }
    return list;
  };

  const monthlyList = mapPrices(monthlyPrices.data, monthlyPrices.included);
  const yearlyList = mapPrices(yearlyPrices.data, yearlyPrices.included);

  console.log(`Monthly prices loaded for ${monthlyList.length} territories.`);
  console.log(`Yearly prices loaded for ${yearlyList.length} territories.`);

  // Group by USD customerPrice or EUR customerPrice to see the tiers
  const tierDistribution: Record<string, string[]> = {};
  for (const item of yearlyList) {
    const price = item.customerPrice;
    if (!tierDistribution[price]) {
      tierDistribution[price] = [];
    }
    tierDistribution[price].push(item.territoryCode);
  }

  console.log('\nYearly Price Distribution:');
  for (const [price, terrs] of Object.entries(tierDistribution)) {
    console.log(`Price ${price}: ${terrs.length} countries (${terrs.slice(0, 10).join(', ')}...)`);
  }

  // Save dump for exact replication
  fs.writeFileSync('scripts/der-artikel-prices.json', JSON.stringify({
    monthly: monthlyList,
    yearly: yearlyList
  }, null, 2));
  console.log('\nSaved full price map to scripts/der-artikel-prices.json');
}

main().catch(console.error);
