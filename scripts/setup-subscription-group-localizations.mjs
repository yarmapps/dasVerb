import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const KEY_ID = '3P98PH5M24';
const ISSUER_ID = '4222448c-08ac-4305-b6b8-471b102c1dbf';
const KEY_PATH = path.resolve(__dirname, `../credentials/ios/AuthKey_${KEY_ID}.p8`);
const BUNDLE_ID = 'com.yarm.apps.dasverb';

function base64UrlEncode(strOrBuffer) {
  const buf = Buffer.isBuffer(strOrBuffer) ? strOrBuffer : Buffer.from(strOrBuffer);
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateJWT() {
  const privateKey = fs.readFileSync(KEY_PATH, 'utf8');
  const header = {
    alg: 'ES256',
    kid: KEY_ID,
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ISSUER_ID,
    exp: now + 20 * 60, // 20 mins
    aud: 'appstoreconnect-v1',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;

  const sign = crypto.createSign('SHA256');
  sign.update(message);
  sign.end();

  const derSignature = sign.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' });
  const encodedSignature = base64UrlEncode(derSignature);

  return `${message}.${encodedSignature}`;
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = generateJWT();
  const url = `https://api.appstoreconnect.apple.com${endpoint}`;
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, ok: res.ok, data: json };
}

async function run() {
  console.log('Authenticating with App Store Connect API...');
  
  // 1. Get App ID
  const appRes = await apiRequest(`/v1/apps?filter[bundleId]=${BUNDLE_ID}`);
  if (!appRes.ok || !appRes.data.data || appRes.data.data.length === 0) {
    console.error('App not found:', appRes.data);
    process.exit(1);
  }
  const app = appRes.data.data[0];
  console.log(`Found App: ${app.attributes.name} (ID: ${app.id})`);

  // 2. Get Subscription Groups for App
  const groupsRes = await apiRequest(`/v1/apps/${app.id}/subscriptionGroups`);
  if (!groupsRes.ok || !groupsRes.data.data || groupsRes.data.data.length === 0) {
    console.error('No subscription groups found:', groupsRes.data);
    process.exit(1);
  }

  const localizationsMap = {
    'en-US': 'dasVerb Premium',
    'ru': 'dasVerb Премиум',
    'de-DE': 'dasVerb Premium',
    'fr-FR': 'dasVerb Premium',
    'es-ES': 'dasVerb Premium',
    'es-MX': 'dasVerb Premium',
    'it': 'dasVerb Premium',
    'pt-BR': 'dasVerb Premium',
    'pt-PT': 'dasVerb Premium',
    'uk': 'dasVerb Преміум',
    'tr': 'dasVerb Premium',
    'pl': 'dasVerb Premium',
    'vi': 'dasVerb Premium',
    'nl-NL': 'dasVerb Premium',
    'ar-SA': 'dasVerb Premium',
    'zh-Hans': 'dasVerb Premium',
  };

  for (const group of groupsRes.data.data) {
    const groupId = group.id;
    const groupName = group.attributes.referenceName;
    console.log(`\nProcessing Subscription Group: ${groupName} (ID: ${groupId})`);

    // Fetch existing localizations for this group
    const locRes = await apiRequest(`/v1/subscriptionGroups/${groupId}/subscriptionGroupLocalizations`);
    const existingLocales = new Set();
    if (locRes.ok && locRes.data.data) {
      locRes.data.data.forEach(l => existingLocales.add(l.attributes.locale));
    }
    console.log(`Existing localizations (${existingLocales.size}):`, Array.from(existingLocales).join(', ') || 'None');

    for (const [locale, displayName] of Object.entries(localizationsMap)) {
      if (existingLocales.has(locale)) {
        console.log(`- [SKIP] ${locale} already exists`);
        continue;
      }

      const body = {
        data: {
          type: 'subscriptionGroupLocalizations',
          attributes: {
            locale: locale,
            name: displayName,
          },
          relationships: {
            subscriptionGroup: {
              data: {
                type: 'subscriptionGroups',
                id: groupId,
              },
            },
          },
        },
      };

      const createRes = await apiRequest('/v1/subscriptionGroupLocalizations', 'POST', body);
      if (createRes.ok) {
        console.log(`✅ [CREATED] ${locale} -> "${displayName}"`);
      } else {
        console.error(`❌ [ERROR] ${locale}:`, JSON.stringify(createRes.data?.errors || createRes.data));
      }
    }
  }

  console.log('\n🎉 Finished configuring subscription group localizations!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
