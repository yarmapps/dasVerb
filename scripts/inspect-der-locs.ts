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
  const fullUrl = url.startsWith('http') ? url : `https://api.appstoreconnect.apple.com${url}`;
  const res = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.json();
}

async function main() {
  console.log('Fetching localizations for Der Die Das...\n');

  console.log('--- 1. Yearly Subscription (6760625272) ---');
  const yLocs = await apiRequest('/v1/subscriptions/6760625272/subscriptionLocalizations?limit=50');
  for (const loc of (yLocs.data || [])) {
    console.log(`[${loc.attributes.locale}] Name: "${loc.attributes.name}" | Desc: "${loc.attributes.description}"`);
  }

  console.log('\n--- 2. Monthly Subscription (6760625191) ---');
  const mLocs = await apiRequest('/v1/subscriptions/6760625191/subscriptionLocalizations?limit=50');
  for (const loc of (mLocs.data || [])) {
    console.log(`[${loc.attributes.locale}] Name: "${loc.attributes.name}" | Desc: "${loc.attributes.description}"`);
  }

  console.log('\n--- 3. Lifetime IAP (6760625001) ---');
  const lLocs = await apiRequest('/v2/inAppPurchases/6760625001/inAppPurchaseLocalizations?limit=50');
  for (const loc of (lLocs.data || [])) {
    console.log(`[${loc.attributes.locale}] Name: "${loc.attributes.name}" | Desc: "${loc.attributes.description}"`);
  }

  console.log('\n--- 4. Promoted Purchase Images / Objects ---');
  const prom = await apiRequest('/v1/apps/6760616325/promotedPurchases?include=promotedPurchaseImage&limit=50');
  console.log('Promoted purchases:', JSON.stringify(prom, null, 2));
}

main().catch(console.error);
