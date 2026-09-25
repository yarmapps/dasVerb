import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in .env or environment variables.');
  process.exit(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMediaGroupForLocale(platform, locale) {
  const baseDir = path.join(rootDir, 'fastlane/screenshots_generation_assets/generation_result', platform);
  const localeDir = path.join(baseDir, locale);
  if (!fs.existsSync(localeDir)) {
    console.warn(`⚠️ Directory for [${platform}] locale ${locale} not found!`);
    return;
  }

  const prefix = platform === 'android' ? 'android_screenshot_' : 'ios_screenshot_';
  const maxScreens = platform === 'android' ? 8 : 10;

  const files = [];
  for (let i = 1; i <= maxScreens; i++) {
    const file = path.join(localeDir, `${prefix}${i}.jpg`);
    if (fs.existsSync(file)) {
      files.push({ index: i, path: file });
    }
  }

  if (files.length === 0) {
    console.log(`ℹ️ No screenshots found for [${platform}] ${locale}`);
    return;
  }

  console.log(`📤 Sending ${files.length} [${platform.toUpperCase()}] screenshots for [${locale}] to ${CHAT_ID}...`);

  const formData = new FormData();
  formData.append('chat_id', CHAT_ID);

  const media = [];
  files.forEach((f, idx) => {
    const fieldName = `photo_${idx}`;
    const blob = new Blob([fs.readFileSync(f.path)], { type: 'image/jpeg' });
    formData.append(fieldName, blob, `${prefix}${f.index}.jpg`);

    const item = {
      type: 'photo',
      media: `attach://${fieldName}`
    };

    if (idx === 0) {
      const icon = platform === 'android' ? '🤖' : '📱';
      const platLabel = platform === 'android' ? 'Android (Google Play)' : 'iOS (App Store)';
      item.caption = `${icon} *${platLabel} Screenshots* • \`${locale}\` (1–${files.length})`;
      item.parse_mode = 'Markdown';
    }

    media.push(item);
  });

  formData.append('media', JSON.stringify(media));

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  if (data.ok) {
    console.log(`  ✅ Successfully sent [${platform} / ${locale}] (${files.length} photos)`);
  } else {
    console.error(`  ❌ Failed to send [${platform} / ${locale}]:`, data.description);
  }
}

async function main() {
  const rawArgs = process.argv.slice(2);
  let platform = 'ios';
  let targetLocale = null;

  for (const arg of rawArgs) {
    if (arg === 'ios' || arg === '--ios') {
      platform = 'ios';
    } else if (arg === 'android' || arg === '--android') {
      platform = 'android';
    } else if (!arg.startsWith('--')) {
      targetLocale = arg;
    }
  }

  const baseDir = path.join(rootDir, 'fastlane/screenshots_generation_assets/generation_result', platform);

  if (targetLocale) {
    await sendMediaGroupForLocale(platform, targetLocale);
  } else {
    if (!fs.existsSync(baseDir)) {
      console.warn(`⚠️ Generation directory for ${platform} does not exist: ${baseDir}`);
      return;
    }

    const locales = fs.readdirSync(baseDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort();

    console.log(`📦 Found ${locales.length} [${platform}] locales to send:`, locales.join(', '));

    for (let i = 0; i < locales.length; i++) {
      const loc = locales[i];
      await sendMediaGroupForLocale(platform, loc);
      if (i < locales.length - 1) {
        console.log('  ⏳ Waiting 3s to respect Telegram rate limits...');
        await sleep(3000);
      }
    }
  }

  console.log(`\n🎉 All [${platform.toUpperCase()}] screenshot albums sent to Telegram successfully!\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
