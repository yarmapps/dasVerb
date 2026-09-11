import fs from "fs";
import crypto from "crypto";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const KEY_PATH = path.join(ROOT_DIR, "credentials/ios/AuthKey_3P98PH5M24.p8");
const KEY_ID = "3P98PH5M24";
const ISSUER_ID = "4222448c-08ac-4305-b6b8-471b102c1dbf";

const LIFETIME_IAP_ID = "6760625001"; // premium_lifetime
const YEARLY_SUB_ID = "6760625272";   // premium_yearly_49_99
const MONTHLY_SUB_ID = "6760625191";  // premium_monthly_7_99
const SUB_GROUP_ID = "21979825";       // der Artikel - Premium

function base64Url(str) {
  return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function generateToken() {
  const privateKey = fs.readFileSync(KEY_PATH, "utf8");
  const header = { alg: "ES256", kid: KEY_ID, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ISSUER_ID,
    exp: now + 1200,
    aud: "appstoreconnect-v1"
  };
  const signInput = base64Url(JSON.stringify(header)) + "." + base64Url(JSON.stringify(payload));
  const sign = crypto.createSign("SHA256");
  sign.update(signInput);
  sign.end();
  const signature = sign.sign({ key: privateKey, dsaEncoding: "ieee-p1363" }, "base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return signInput + "." + signature;
}

const token = generateToken();

function apiRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: "api.appstoreconnect.apple.com",
      path: endpoint,
      method: method,
      headers: {
        "Authorization": "Bearer " + token,
        "User-Agent": "Fastlane/DasVerb",
        "Content-Type": "application/json",
        ...(dataString ? { "Content-Length": Buffer.byteLength(dataString) } : {})
      }
    }, (res) => {
      let responseData = "";
      res.on("data", chunk => responseData += chunk);
      res.on("end", () => {
        let json = null;
        try {
          json = responseData ? JSON.parse(responseData) : {};
        } catch (e) {
          json = { raw: responseData };
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(json);
        } else {
          reject(new Error(`API Error [${res.statusCode}] on ${method} ${endpoint}: ${JSON.stringify(json)}`));
        }
      });
    });
    req.on("error", reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

const LOCALES = [
  "en-US", "de-DE", "ru", "es-ES", "es-MX", "fr-FR", "fr-CA", "it",
  "pt-BR", "pt-PT", "uk", "tr", "pl", "nl-NL", "sv", "da", "fi",
  "no", "el", "cs", "hu", "ro", "hr", "sk", "hi", "ar-SA"
];

const lifetimeNames = {
  "en-US": "Der Die Das: Lifetime Premium",
  "de-DE": "Der Die Das: Premium Lifetime",
  "ru": "Der Die Das: Навсегда Премиум",
  "es-ES": "Der Die Das: Premium Vitalicio",
  "es-MX": "Der Die Das: Premium Vitalicio",
  "fr-FR": "Der Die Das: Premium à vie",
  "fr-CA": "Der Die Das: Premium à vie",
  "it": "Der Die Das: Premium a vita",
  "pt-BR": "Der Die Das: Premium Vitalício",
  "pt-PT": "Der Die Das: Premium Vitalício",
  "uk": "Der Die Das: Назавжди Преміум",
  "tr": "Der Die Das: Ömür Boyu Premium",
  "pl": "Der Die Das: Premium Na Zawsze",
  "nl-NL": "Der Die Das: Altijd Premium",
  "sv": "Der Die Das: Livstid Premium",
  "da": "Der Die Das: Livstid Premium",
  "fi": "Der Die Das: Aina Premium",
  "no": "Der Die Das: Livstid Premium",
  "el": "Der Die Das: Premium για πάντα",
  "cs": "Der Die Das: Doživotní Premium",
  "hu": "Der Die Das: Örökös Premium",
  "ro": "Der Die Das: Premium pe Viață",
  "hr": "Der Die Das: Doživotni Premium",
  "sk": "Der Die Das: Doživotný Premium",
  "hi": "Der Die Das: आजीवन प्रीमियम",
  "ar-SA": "Der Die Das: بريميوم دائم"
};

const yearlyNames = {
  "en-US": "Der Die Das: 1 Year Premium",
  "de-DE": "Der Die Das: 1 Jahr Premium",
  "ru": "Der Die Das: Годовой Премиум",
  "es-ES": "Der Die Das: Premium 1 Año",
  "es-MX": "Der Die Das: Premium 1 Año",
  "fr-FR": "Der Die Das: Premium 1 An",
  "fr-CA": "Der Die Das: Premium 1 An",
  "it": "Der Die Das: Premium 1 Anno",
  "pt-BR": "Der Die Das: Premium 1 Ano",
  "pt-PT": "Der Die Das: Premium 1 Ano",
  "uk": "Der Die Das: Річний Преміум",
  "tr": "Der Die Das: 1 Yıllık Premium",
  "pl": "Der Die Das: Premium 1 Rok",
  "nl-NL": "Der Die Das: 1 Jaar Premium",
  "sv": "Der Die Das: 1 År Premium",
  "da": "Der Die Das: 1 År Premium",
  "fi": "Der Die Das: 1 Vuosi Premium",
  "no": "Der Die Das: 1 År Premium",
  "el": "Der Die Das: Premium 1 Έτος",
  "cs": "Der Die Das: 1 Rok Premium",
  "hu": "Der Die Das: 1 Éves Premium",
  "ro": "Der Die Das: Premium 1 An",
  "hr": "Der Die Das: 1 Godina Premium",
  "sk": "Der Die Das: 1 Rok Premium",
  "hi": "Der Die Das: 1 वर्ष प्रीमियम",
  "ar-SA": "Der Die Das: سنة واحدة بريميوم"
};

const monthlyNames = {
  "en-US": "Der Die Das: 1 Month Premium",
  "de-DE": "Der Die Das: 1 Monat Premium",
  "ru": "Der Die Das: Месячный Премиум",
  "es-ES": "Der Die Das: Premium 1 Mes",
  "es-MX": "Der Die Das: Premium 1 Mes",
  "fr-FR": "Der Die Das: Premium 1 Mois",
  "fr-CA": "Der Die Das: Premium 1 Mois",
  "it": "Der Die Das: Premium 1 Mese",
  "pt-BR": "Der Die Das: Premium 1 Mês",
  "pt-PT": "Der Die Das: Premium 1 Mês",
  "uk": "Der Die Das: Місячний Преміум",
  "tr": "Der Die Das: 1 Aylık Premium",
  "pl": "Der Die Das: Premium 1 Miesiąc",
  "nl-NL": "Der Die Das: 1 Maand Premium",
  "sv": "Der Die Das: 1 Månad Premium",
  "da": "Der Die Das: 1 Måned Premium",
  "fi": "Der Die Das: 1 Kk Premium",
  "no": "Der Die Das: 1 Måned Premium",
  "el": "Der Die Das: Premium 1 Μήνας",
  "cs": "Der Die Das: 1 Měsíc Premium",
  "hu": "Der Die Das: 1 Havi Premium",
  "ro": "Der Die Das: Premium 1 Lună",
  "hr": "Der Die Das: 1 Mjesec Premium",
  "sk": "Der Die Das: 1 Mesiac Premium",
  "hi": "Der Die Das: 1 माह प्रीमियम",
  "ar-SA": "Der Die Das: شهر واحد بريميوم"
};

const descriptions = {
  "en-US": "No ads, unlimited custom quizzes & words",
  "de-DE": "Werbefrei, unbegrenzte Tests & Wörter",
  "ru": "Без рекламы, квизы и свои слова без лимита",
  "es-ES": "Sin anuncios, quizzes y palabras ilimitadas",
  "es-MX": "Sin anuncios, quizzes y palabras ilimitadas",
  "fr-FR": "Sans pub, quiz et mots perso illimités",
  "fr-CA": "Sans pub, quiz et mots perso illimités",
  "it": "No pubblicità, quiz e parole illimitati",
  "pt-BR": "Sem anúncios, quizzes e palavras sem limite",
  "pt-PT": "Sem anúncios, quizzes e palavras sem limite",
  "uk": "Без реклами, квізи та свої слова без меж",
  "tr": "Reklamsız, sınırsız test ve özel kelime",
  "pl": "Bez reklam, quizy i własne słowa bez limitu",
  "nl-NL": "Reclamevrij, onbeperkt quizzen & woorden",
  "sv": "Reklamfritt, obegränsat med quiz & ord",
  "da": "Reklamefri, ubegrænset quizzer & ord",
  "fi": "Ei mainoksia, rajattomat visat & sanat",
  "no": "Reklamefri, ubegrenset med quiz & ord",
  "el": "Χωρίς ads, απεριόριστα κουίζ & λέξεις",
  "cs": "Bez reklam, neomezené kvízy a slova",
  "hu": "Reklámmentes, korlátlan kvíz és szavak",
  "ro": "Fără reclame, quiz & cuvinte nelimitate",
  "hr": "Bez reklama, neograničeni kvizovi i riječi",
  "sk": "Bez reklám, neobmedzené kvízy a slová",
  "hi": "विज्ञापन मुक्त, असीमित क्विज़ और शब्द",
  "ar-SA": "بدون إعلانات، اختبارات وكلمات غير محدودة"
};

async function syncLifetimeIAP() {
  console.log("\n=======================================================");
  console.log("1. Updating Lifetime IAP descriptions (premium_lifetime, 6760625001)...");
  console.log("=======================================================");
  
  const existingRes = await apiRequest("GET", `/v2/inAppPurchases/${LIFETIME_IAP_ID}/inAppPurchaseLocalizations?limit=50`);
  const existingMap = new Map();
  if (existingRes.data) {
    for (const item of existingRes.data) {
      existingMap.set(item.attributes.locale, item);
    }
  }

  for (const locale of LOCALES) {
    const name = lifetimeNames[locale];
    const desc = descriptions[locale];
    const existing = existingMap.get(locale);

    if (existing) {
      try {
        console.log(`[PATCH] ${locale} -> "${name}" | "${desc}"`);
        await apiRequest("PATCH", `/v1/inAppPurchaseLocalizations/${existing.id}`, {
          data: {
            type: "inAppPurchaseLocalizations",
            id: existing.id,
            attributes: { name: name, description: desc }
          }
        });
      } catch (e) {
        console.warn(`[WARN] Locale ${locale}: ${e.message}`);
      }
    } else {
      try {
        console.log(`[POST]  ${locale} -> "${name}" | "${desc}"`);
        await apiRequest("POST", `/v1/inAppPurchaseLocalizations`, {
          data: {
            type: "inAppPurchaseLocalizations",
            attributes: { name: name, locale: locale, description: desc },
            relationships: {
              inAppPurchaseV2: {
                data: { type: "inAppPurchases", id: LIFETIME_IAP_ID }
              }
            }
          }
        });
      } catch (e) {
        console.error(`[ERR] Failed to create ${locale}: ${e.message}`);
      }
    }
  }
}

async function syncSubscription(subId, productId, nameDict) {
  console.log("\n=======================================================");
  console.log(`Updating Subscription descriptions (${productId}, ${subId})...`);
  console.log("=======================================================");
  
  const existingRes = await apiRequest("GET", `/v1/subscriptions/${subId}/subscriptionLocalizations?limit=50`);
  const existingMap = new Map();
  if (existingRes.data) {
    for (const item of existingRes.data) {
      existingMap.set(item.attributes.locale, item);
    }
  }

  for (const locale of LOCALES) {
    const name = nameDict[locale];
    const desc = descriptions[locale];
    const existing = existingMap.get(locale);

    if (existing) {
      try {
        console.log(`[PATCH] ${locale} -> "${name}" | "${desc}"`);
        await apiRequest("PATCH", `/v1/subscriptionLocalizations/${existing.id}`, {
          data: {
            type: "subscriptionLocalizations",
            id: existing.id,
            attributes: { name: name, description: desc }
          }
        });
      } catch (e) {
        console.warn(`[WARN] Locale ${locale}: ${e.message}`);
      }
    } else {
      try {
        console.log(`[POST]  ${locale} -> "${name}" | "${desc}"`);
        await apiRequest("POST", `/v1/subscriptionLocalizations`, {
          data: {
            type: "subscriptionLocalizations",
            attributes: { name: name, locale: locale, description: desc },
            relationships: {
              subscription: {
                data: { type: "subscriptions", id: subId }
              }
            }
          }
        });
      } catch (e) {
        console.error(`[ERR] Failed to create ${locale}: ${e.message}`);
      }
    }
  }
}

async function main() {
  try {
    await syncLifetimeIAP();
    await syncSubscription(YEARLY_SUB_ID, "premium_yearly_49_99", yearlyNames);
    await syncSubscription(MONTHLY_SUB_ID, "premium_monthly_7_99", monthlyNames);
    console.log("\n=======================================================");
    console.log("SUCCESS: All descriptions updated across all locales!");
    console.log("=======================================================\n");
  } catch (err) {
    console.error("FATAL ERROR during sync:", err);
    process.exit(1);
  }
}

main();
