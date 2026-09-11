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
  return res.json();
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
  const derMonthly = await fetchAllPages('/subscriptions/6760625191/prices?include=subscriptionPricePoint,territory&limit=200');
  const derYearly = await fetchAllPages('/subscriptions/6760625272/prices?include=subscriptionPricePoint,territory&limit=200');

  const decodeId = (b64: string) => {
    try {
      return JSON.parse(Buffer.from(b64, 'base64').toString());
    } catch {
      return null;
    }
  };

  const mapWithDecoded = (data: any[]) => {
    return data.map(item => {
      const terrId = item.relationships?.territory?.data?.id;
      const ppId = item.relationships?.subscriptionPricePoint?.data?.id;
      const decoded = decodeId(ppId);
      return {
        territory: terrId,
        pricePointId: ppId,
        tierKey: decoded?.p
      };
    });
  };

  const monthlyList = mapWithDecoded(derMonthly.data);
  const yearlyList = mapWithDecoded(derYearly.data);

  console.log('Sample decoded Der Die Das monthly:', monthlyList.slice(0, 10));
  console.log('Sample decoded Der Die Das yearly:', yearlyList.slice(0, 10));

  fs.writeFileSync('scripts/der-price-point-tiers.json', JSON.stringify({
    monthly: monthlyList,
    yearly: yearlyList
  }, null, 2));
}

main().catch(console.error);
