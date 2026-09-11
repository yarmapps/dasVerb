import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Asset directories
const fontsDir = path.join(rootDir, 'fastlane/screenshots_generation_assets/fonts/commissioner');
const arabicFontsDir = path.join(rootDir, 'fastlane/screenshots_generation_assets/fonts/arabic');

// Register all Commissioner TTF fonts (Latin + Cyrillic + Greek)
GlobalFonts.registerFromPath(path.join(fontsDir, 'Commissioner-Thin.ttf'), 'Commissioner');
GlobalFonts.registerFromPath(path.join(fontsDir, 'Commissioner-ExtraLight.ttf'), 'Commissioner');
GlobalFonts.registerFromPath(path.join(fontsDir, 'Commissioner-Light.ttf'), 'Commissioner');
GlobalFonts.registerFromPath(path.join(fontsDir, 'Commissioner-Regular.ttf'), 'Commissioner');
GlobalFonts.registerFromPath(path.join(fontsDir, 'Commissioner-Medium.ttf'), 'Commissioner');
GlobalFonts.registerFromPath(path.join(fontsDir, 'Commissioner-SemiBold.ttf'), 'Commissioner');
GlobalFonts.registerFromPath(path.join(fontsDir, 'Commissioner-Bold.ttf'), 'Commissioner');
GlobalFonts.registerFromPath(path.join(fontsDir, 'Commissioner-ExtraBold.ttf'), 'Commissioner');
GlobalFonts.registerFromPath(path.join(fontsDir, 'Commissioner-Black.ttf'), 'Commissioner');

// Register Noto Sans Arabic fonts (Arabic + Persian + Urdu)
if (fs.existsSync(arabicFontsDir)) {
  GlobalFonts.registerFromPath(path.join(arabicFontsDir, 'NotoSansArabic-Light.ttf'), 'Noto Sans Arabic');
  GlobalFonts.registerFromPath(path.join(arabicFontsDir, 'NotoSansArabic-Regular.ttf'), 'Noto Sans Arabic');
  GlobalFonts.registerFromPath(path.join(arabicFontsDir, 'NotoSansArabic-Medium.ttf'), 'Noto Sans Arabic');
  GlobalFonts.registerFromPath(path.join(arabicFontsDir, 'NotoSansArabic-SemiBold.ttf'), 'Noto Sans Arabic');
  GlobalFonts.registerFromPath(path.join(arabicFontsDir, 'NotoSansArabic-Bold.ttf'), 'Noto Sans Arabic');
  GlobalFonts.registerFromPath(path.join(arabicFontsDir, 'NotoSansArabic-ExtraBold.ttf'), 'Noto Sans Arabic');
  GlobalFonts.registerFromPath(path.join(arabicFontsDir, 'NotoSansArabic-Black.ttf'), 'Noto Sans Arabic');
}

const PLATFORM_CONFIGS = {
  ios: {
    canvasWidth: 1242,
    canvasHeight: 2688,
    boxX: 103,
    boxY: 69,
    boxWidth: 1028,
    boxHeight: 500,
    fontSize: 150,
    lineHeight: 180,
    capHeight: 108,
    letterSpacing: '3px',
    maxScreens: 10,
    imageTemplatesDir: path.join(rootDir, 'fastlane/screenshots_generation_assets/image_templates/ios'),
    copyTemplatesDir: path.join(rootDir, 'fastlane/screenshots_generation_assets/copy_templates/ios'),
    outputBaseDir: path.join(rootDir, 'fastlane/screenshots_generation_assets/generation_result/ios'),
    templatePrefix: 'ios_template_',
    outputPrefix: 'ios_screenshot_'
  },
  android: {
    canvasWidth: 1024,
    canvasHeight: 1820,
    boxX: 48,
    boxY: 32,
    boxWidth: 928,
    boxHeight: 420,
    fontSize: 120,
    lineHeight: 130,
    capHeight: 86,
    letterSpacing: '2.4px',
    maxScreens: 8,
    imageTemplatesDir: path.join(rootDir, 'fastlane/screenshots_generation_assets/image_templates/android'),
    copyTemplatesDir: path.join(rootDir, 'fastlane/screenshots_generation_assets/copy_templates/android'),
    outputBaseDir: path.join(rootDir, 'fastlane/screenshots_generation_assets/generation_result/android'),
    templatePrefix: 'android_template_',
    outputPrefix: 'android_screenshot_'
  }
};

// Helper to check if string contains RTL characters
function isRTL(text) {
  const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlRegex.test(text);
}

// Parse tagged text into segments: [{ text, weight, color }]
function parseSegments(rawLine) {
  const regex = /(<[^>]+>|[^<]+)/g;
  const tokens = rawLine.match(regex) || [];
  let currentWeight = 400;
  let currentColor = '#ffffff';
  const segments = [];

  for (const token of tokens) {
    if (token.startsWith('<')) {
      const tag = token.toLowerCase();
      if (tag === '<light>') currentWeight = 300;
      else if (tag === '</light>') currentWeight = 400;
      else if (tag === '<b>' || tag === '<bold>') currentWeight = 700;
      else if (tag === '</b>' || tag === '</bold>') currentWeight = 400;
      else if (tag === '<extrabold>') currentWeight = 800;
      else if (tag === '</extrabold>') currentWeight = 400;
      else if (tag === '<black>' || tag === '<strong>') currentWeight = 900;
      else if (tag === '</black>' || tag === '</strong>') currentWeight = 400;
      else if (tag === '<medium>') currentWeight = 500;
      else if (tag === '</medium>') currentWeight = 400;
      else if (tag === '<semibold>') currentWeight = 600;
      else if (tag === '</semibold>') currentWeight = 400;
      else if (tag === '<regular>' || tag === '<normal>') currentWeight = 400;
      else if (tag === '</regular>' || tag === '</normal>') currentWeight = 400;
      else if (tag === '<thin>') currentWeight = 100;
      else if (tag === '</thin>') currentWeight = 400;
      else if (tag.startsWith('<color=')) {
        const m = tag.match(/<color=["']?([^"'>]+)["']?>/);
        if (m) currentColor = m[1];
      } else if (tag === '</color>') {
        currentColor = '#ffffff';
      }
    } else {
      if (token.length > 0) {
        segments.push({ text: token, weight: currentWeight, color: currentColor });
      }
    }
  }
  return segments;
}

/**
 * Render text overlay via Google Skia Canvas
 */
export async function generateScreenshot(platform, templatePath, text, outputPath, localeLabel = '', indexLabel = '') {
  const cfg = PLATFORM_CONFIGS[platform];
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const numLines = lines.length;
  if (numLines === 0) return;

  const canvas = createCanvas(cfg.canvasWidth, cfg.canvasHeight);
  const ctx = canvas.getContext('2d');

  // Dynamic vertical centering calculation
  const totalTextBlockHeight = (numLines - 1) * cfg.lineHeight + cfg.capHeight;
  const verticalPadding = Math.round((cfg.boxHeight - totalTextBlockHeight) / 2);
  const firstBaselineY = cfg.boxY + verticalPadding + cfg.capHeight;

  // Check for vertical overflow beyond box height
  if (totalTextBlockHeight > cfg.boxHeight) {
    const overflowHeightPx = Math.round(totalTextBlockHeight - cfg.boxHeight);
    console.warn(`  🚨 WARNING [${platform.toUpperCase()} ${localeLabel} #${indexLabel}] Total text height exceeds box height (${cfg.boxHeight}px) by ${overflowHeightPx}px! (Total height: ${totalTextBlockHeight}px)`);
  }

  const maxAllowedWidth = cfg.canvasWidth - 24; // 12px margin on both sides

  lines.forEach((line, lineIdx) => {
    const y = firstBaselineY + lineIdx * cfg.lineHeight;
    const segments = parseSegments(line);

    // Measure total line width across segments with tracking
    let totalLineWidth = 0;
    segments.forEach(seg => {
      ctx.font = `${seg.weight} ${cfg.fontSize}px "Commissioner", "Noto Sans Arabic"`;
      ctx.letterSpacing = cfg.letterSpacing;
      const metrics = ctx.measureText(seg.text);
      totalLineWidth += metrics.width;
    });

    // Check for overflow beyond image width - 24px (12px on each side)
    if (totalLineWidth > maxAllowedWidth) {
      const overflowPx = Math.round(totalLineWidth - maxAllowedWidth);
      console.warn(`  🚨 WARNING [${platform.toUpperCase()} ${localeLabel} #${indexLabel}] Line ${lineIdx + 1} "${line.replace(/<[^>]+>/g, '')}" exceeds max width (${maxAllowedWidth}px, image width - 24px) by ${overflowPx}px! (Total width: ${Math.round(totalLineWidth)}px)`);
    }

    // Center line horizontally on the canvas
    const startX = Math.round((cfg.canvasWidth - totalLineWidth) / 2);
    let currentX = startX;

    // Render segments
    segments.forEach(seg => {
      ctx.font = `${seg.weight} ${cfg.fontSize}px "Commissioner", "Noto Sans Arabic"`;
      ctx.letterSpacing = cfg.letterSpacing;
      ctx.fillStyle = seg.color;
      ctx.fillText(seg.text, currentX, y);

      const metrics = ctx.measureText(seg.text);
      currentX += metrics.width;
    });
  });

  const overlayBuffer = canvas.toBuffer('image/png');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  await sharp(templatePath)
    .composite([{ input: overlayBuffer }])
    .jpeg({ quality: 100 })
    .toFile(outputPath);

  console.log(`  ✅ Generated: ${outputPath}`);
}

async function processLocale(platform, locale, specificIndex = null) {
  const cfg = PLATFORM_CONFIGS[platform];
  const localeCopyDir = path.join(cfg.copyTemplatesDir, locale);
  if (!fs.existsSync(localeCopyDir)) {
    console.warn(`⚠️ Locale directory does not exist: ${localeCopyDir}`);
    return;
  }

  const localeOutputDir = path.join(cfg.outputBaseDir, locale);
  fs.mkdirSync(localeOutputDir, { recursive: true });

  const indices = specificIndex ? [specificIndex] : Array.from({ length: cfg.maxScreens }, (_, i) => i + 1);

  console.log(`\n🌍 Processing [${platform.toUpperCase()}] locale: [${locale}]`);

  for (const index of indices) {
    const templateFile = path.join(cfg.imageTemplatesDir, `${cfg.templatePrefix}${index}.jpg`);
    const copyFile = path.join(localeCopyDir, `${index}.txt`);
    const outputFile = path.join(localeOutputDir, `${cfg.outputPrefix}${index}.jpg`);

    if (!fs.existsSync(templateFile)) {
      console.warn(`  ⚠️ Template not found: ${cfg.templatePrefix}${index}.jpg (Skipping #${index})`);
      continue;
    }

    if (!fs.existsSync(copyFile)) {
      console.log(`  ℹ️ No copy template found: ${locale}/${index}.txt (Skipping #${index})`);
      continue;
    }

    const text = fs.readFileSync(copyFile, 'utf-8').trim();
    if (text.length === 0) {
      console.log(`  ℹ️ Copy template is empty: ${locale}/${index}.txt (Skipping #${index})`);
      continue;
    }

    console.log(`  🚀 Generating screenshot #${index} for ${locale}...`);
    await generateScreenshot(platform, templateFile, text, outputFile, locale, index);
  }
}

async function runPlatform(platform, targetLocale = null, targetIndex = null) {
  const cfg = PLATFORM_CONFIGS[platform];
  if (!fs.existsSync(cfg.copyTemplatesDir)) {
    console.warn(`⚠️ Platform copy directory not found: ${cfg.copyTemplatesDir}`);
    return;
  }

  if (targetLocale) {
    await processLocale(platform, targetLocale, targetIndex);
  } else {
    const entries = fs.readdirSync(cfg.copyTemplatesDir, { withFileTypes: true });
    const localeFolders = entries.filter(e => e.isDirectory()).map(e => e.name);

    console.log(`📦 Found ${localeFolders.length} locale folders in copy_templates/${platform}:`, localeFolders.join(', '));
    for (const locale of localeFolders) {
      await processLocale(platform, locale);
    }
  }
}

async function main() {
  const rawArgs = process.argv.slice(2);
  let platform = 'all';
  let targetLocale = null;
  let targetIndex = null;

  const filteredArgs = [];
  for (const arg of rawArgs) {
    if (arg === 'ios' || arg === '--ios') {
      platform = 'ios';
    } else if (arg === 'android' || arg === '--android') {
      platform = 'android';
    } else if (arg.startsWith('--platform=')) {
      platform = arg.split('=')[1];
    } else {
      filteredArgs.push(arg);
    }
  }

  if (filteredArgs.length === 1) {
    if (/^\d+$/.test(filteredArgs[0])) {
      targetLocale = 'en-US';
      targetIndex = parseInt(filteredArgs[0], 10);
    } else {
      targetLocale = filteredArgs[0];
    }
  } else if (filteredArgs.length >= 2) {
    targetLocale = filteredArgs[0];
    targetIndex = parseInt(filteredArgs[1], 10);
  }

  if (platform === 'all') {
    console.log('🚀 Starting screenshot generation for BOTH iOS and Android...');
    await runPlatform('ios', targetLocale, targetIndex);
    await runPlatform('android', targetLocale, targetIndex);
  } else if (platform === 'ios' || platform === 'android') {
    await runPlatform(platform, targetLocale, targetIndex);
  } else {
    console.error(`Unknown platform: ${platform}. Use 'ios' or 'android'.`);
    process.exit(1);
  }

  console.log('\n✨ Screenshot generation process completed successfully!\n');
}

main().catch(err => {
  console.error('Error during generation:', err);
  process.exit(1);
});
