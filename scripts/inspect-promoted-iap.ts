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
  console.log('Inspecting Der Die Das promoted purchases & localizations...\n');

  // Der Die Das App: 6760616325
  // Subscriptions: 6760625191 (Monthly), 6760625272 (Yearly)
  // IAP: 6760625001 (Lifetime)

  console.log('1. Subscription Localizations (Yearly):');
  const yearlyLocs = await apiRequest('/v1/subscriptions/6760625272/subscriptionLocalizations?limit=50');
  for (const loc of (yearlyLocs.data || [])) {
    console.log(` - [${loc.attributes.locale}] Name: "${loc.attributes.name}" | Desc: "${loc.attributes.description}"`);
  }

  console.log('\n2. Lifetime IAP Localizations:');
  const iapLocs = await apiRequest('/v2/inAppPurchases/6760625001/inAppPurchaseLocalizations?limit=50');
  for (const loc of (iapLocs.data || [])) {
    console.log(` - [${loc.attributes.locale}] Name: "${loc.attributes.name}" | Desc: "${loc.attributes.description}"`);
  }

  console.log('\n3. Promoted Purchases for App:');
  const promotedRes = await apiRequest('/v1/apps/6760616325/promotedPurchases?include=subscription,inAppPurchaseV2&limit=50');
  console.log(JSON.stringify(promotedRes, null, 2));
}

main().catch(console.error);
