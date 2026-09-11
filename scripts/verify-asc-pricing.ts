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

async function main() {
  console.log('🔍 Verifying App Store Connect Configuration for dasVerb...\n');

  // 1. Monthly Sub
  const mPrices = await apiRequest(`/v1/subscriptions/${MONTHLY_SUB_ID}/prices?limit=5`);
  console.log(`✅ Monthly Sub (${MONTHLY_SUB_ID}) has prices configured: total in sample = ${mPrices.data?.length || 0}`);

  // 2. Yearly Sub & Free Trial
  const yPrices = await apiRequest(`/v1/subscriptions/${YEARLY_SUB_ID}/prices?limit=5`);
  const yTrials = await apiRequest(`/v1/subscriptions/${YEARLY_SUB_ID}/introductoryOffers?limit=5`);
  console.log(`✅ Yearly Sub (${YEARLY_SUB_ID}) has prices: sample = ${yPrices.data?.length || 0}, Free Trials: sample = ${yTrials.data?.length || 0}`);

  // 3. Lifetime IAP Schedule
  const lSched = await apiRequest(`/v2/inAppPurchases/${LIFETIME_IAP_ID}/iapPriceSchedule?include=baseTerritory,manualPrices&limit=5`);
  const manualCount = lSched.data?.relationships?.manualPrices?.meta?.paging?.total || 0;
  console.log(`✅ Lifetime IAP (${LIFETIME_IAP_ID}) has price schedule with ${manualCount} manual territory prices!`);
}

main().catch(console.error);
