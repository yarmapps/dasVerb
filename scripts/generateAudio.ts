import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { VerbCard } from '../docs/verb.types';

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const CDN_AUDIO_DIR = path.join(ROOT_DIR, 'assets', 'cdn', 'audio');

// Available voices:
// In Cloud TTS API:
// - de-DE-Journey-D (male) / de-DE-Neural2-B (male) / de-DE-Studio-B (male)
// - de-DE-Journey-F (female) / de-DE-Neural2-F (female) / de-DE-Studio-C (female)
// In Gemini generative TTS:
// - Charon (male), Aoede (female)
// In Cloud TTS API:
// - Female: de-DE-Studio-C (Premium studio narrator, warm and natural)
// - Male: de-DE-Neural2-B (Authoritative, natural German male voice)
// Both fully support SSML, break pauses (<break time="..."/>), and precise speakingRate control.
const VOICES = {
  female: {
    cloudVoice: 'de-DE-Studio-C',
    geminiVoice: 'Aoede',
    gender: 'FEMALE',
    suffix: 'female',
  },
  male: {
    cloudVoice: 'de-DE-Neural2-B',
    geminiVoice: 'Charon',
    gender: 'MALE',
    suffix: 'male',
  },
};

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseArgs() {
  const args = process.argv.slice(2);
  let levelFilter: string[] | null = null;
  let verbFilter: string[] | null = null;
  let limit = Infinity;
  let genderFilter: ('male' | 'female' | 'both') = 'both';
  let concurrency = 5;
  let delayMs = 60;
  let speakingRate = 0.92;

  for (const arg of args) {
    if (arg.startsWith('--level=')) {
      levelFilter = arg.replace('--level=', '').toUpperCase().split(',').map(l => l.trim());
    } else if (arg.startsWith('--verb=')) {
      verbFilter = arg.replace('--verb=', '').toLowerCase().split(',').map(v => v.trim());
    } else if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.replace('--limit=', ''), 10) || Infinity;
    } else if (arg.startsWith('--gender=')) {
      const g = arg.replace('--gender=', '').toLowerCase();
      if (g === 'male' || g === 'female' || g === 'both') {
        genderFilter = g as any;
      }
    } else if (arg.startsWith('--concurrency=')) {
      concurrency = parseInt(arg.replace('--concurrency=', ''), 10) || 5;
    } else if (arg.startsWith('--delay=')) {
      delayMs = parseInt(arg.replace('--delay=', ''), 10) || 60;
    } else if (arg.startsWith('--rate=')) {
      const parsedRate = parseFloat(arg.replace('--rate=', ''));
      if (!Number.isNaN(parsedRate) && parsedRate > 0.25 && parsedRate <= 2.0) {
        speakingRate = parsedRate;
      }
    }
  }

  return { levelFilter, verbFilter, limit, genderFilter, concurrency, delayMs, speakingRate };
}

function createWavHeader(dataLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

interface AudioTask {
  verbId: string;
  sentenceId: string;
  level: string;
  text: string;
  voiceGender: 'male' | 'female';
  voiceConfig: typeof VOICES.male;
  fileName: string;
}

async function synthesizeTextWithRetry(
  text: string,
  voiceConfig: typeof VOICES.male,
  ttsApiKey: string,
  speakingRate = 0.92,
  maxRetries = 3,
): Promise<{ buffer: Buffer; isMp3: boolean }> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      // Official Google Cloud Text-to-Speech API using SSML with tail break to prevent clipping final prefixes (e.g. "ab.")
      const escapedText = escapeXml(text);
      const ssml = `<speak>${escapedText}<break time="250ms"/></speak>`;

      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsApiKey}`;
      const body = {
        input: { ssml },
        voice: {
          languageCode: 'de-DE',
          name: voiceConfig.cloudVoice,
          ssmlGender: voiceConfig.gender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Cloud TTS HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      if (data.audioContent) {
        return {
          buffer: Buffer.from(data.audioContent, 'base64'),
          isMp3: true,
        };
      }
      throw new Error(`Invalid Cloud TTS response: ${JSON.stringify(data).slice(0, 300)}`);
    } catch (err: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw err;
      }
      let waitTime = Math.pow(2, attempt) * 1500;
      if (err.message && err.message.includes('429')) {
        waitTime = 5000 * attempt;
      }
      await new Promise(r => setTimeout(r, waitTime));
    }
  }

  throw new Error('Unreachable');
}

async function main() {
  const ttsApiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY;
  if (!ttsApiKey) {
    console.error('❌ Error: Neither GOOGLE_TTS_API_KEY nor GEMINI_API_KEY environment variable is set.');
    console.error('👉 Please set GOOGLE_TTS_API_KEY="your_key"');
    process.exit(1);
  }

  const keySource = process.env.GOOGLE_TTS_API_KEY ? 'GOOGLE_TTS_API_KEY' : 'GEMINI_API_KEY';
  console.log(`🎙️ TTS Engine: Google Cloud Text-to-Speech API via ${keySource}`);
  console.log(`🗣️ Voices: Male=${VOICES.male.cloudVoice}, Female=${VOICES.female.cloudVoice}`);

  const { levelFilter, verbFilter, limit, genderFilter, concurrency, delayMs, speakingRate } = parseArgs();
  console.log(`⚡ Speaking Rate: ${speakingRate} (1.0 = normal, <1.0 = slower)`);

  if (!fs.existsSync(CDN_AUDIO_DIR)) {
    fs.mkdirSync(CDN_AUDIO_DIR, { recursive: true });
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  console.log(`🔍 Found ${files.length} verb card files in data/`);
  if (levelFilter) {
    console.log(`🎯 Level filter active: ${levelFilter.join(', ')}`);
  }
  if (verbFilter) {
    console.log(`🎯 Verb filter active: ${verbFilter.join(', ')}`);
  }

  const tasks: AudioTask[] = [];

  for (const file of files) {
    const cardPath = path.join(DATA_DIR, file);
    const card: VerbCard = JSON.parse(fs.readFileSync(cardPath, 'utf8'));

    if (levelFilter && !levelFilter.includes(card.level.toUpperCase())) {
      continue;
    }

    if (verbFilter && !verbFilter.includes(card.id.toLowerCase())) {
      continue;
    }

    const sentences = card.sentences || [];
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceId = sentence.id || `s${i + 1}`;
      const text = (sentence.german || '').trim();

      if (!text) continue;

      if (genderFilter === 'both' || genderFilter === 'female') {
        const femaleFileName = `${card.id}_${sentenceId}_female.m4a`;
        if (!fs.existsSync(path.join(CDN_AUDIO_DIR, femaleFileName))) {
          tasks.push({
            verbId: card.id,
            sentenceId,
            level: card.level,
            text,
            voiceGender: 'female',
            voiceConfig: VOICES.female,
            fileName: femaleFileName,
          });
        }
      }

      if (genderFilter === 'both' || genderFilter === 'male') {
        const maleFileName = `${card.id}_${sentenceId}_male.m4a`;
        if (!fs.existsSync(path.join(CDN_AUDIO_DIR, maleFileName))) {
          tasks.push({
            verbId: card.id,
            sentenceId,
            level: card.level,
            text,
            voiceGender: 'male',
            voiceConfig: VOICES.male,
            fileName: maleFileName,
          });
        }
      }
    }
  }

  const tasksToProcess = tasks.slice(0, limit);
  console.log(`📦 Total new audio files to generate: ${tasksToProcess.length}`);
  if (tasksToProcess.length === 0) {
    console.log('✅ All requested audio files are already generated in assets/cdn/audio/!');
    return;
  }

  console.log(`🚀 Starting generation with concurrency=${concurrency}...`);

  let completedCount = 0;
  let failedCount = 0;
  const tempDir = path.join(CDN_AUDIO_DIR, '.tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  async function worker(workerId: number) {
    while (tasksToProcess.length > 0) {
      const task = tasksToProcess.shift();
      if (!task) break;

      const tempFile = path.join(tempDir, `tmp_${workerId}_${Date.now()}`);
      const targetM4a = path.join(CDN_AUDIO_DIR, task.fileName);

      try {
        const { buffer } = await synthesizeTextWithRetry(
          task.text,
          task.voiceConfig,
          ttsApiKey,
          speakingRate,
        );

        const tempMp3 = `${tempFile}.mp3`;
        fs.writeFileSync(tempMp3, buffer);
        execSync(`afconvert -f m4af -d aac "${tempMp3}" "${targetM4a}"`);
        if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);

        completedCount++;
        if (completedCount % 5 === 0 || completedCount === 1) {
          const percent = ((completedCount / (completedCount + tasksToProcess.length + failedCount)) * 100).toFixed(1);
          console.log(
            `[${percent}%] Generated ${task.fileName} (${task.level}, ${task.voiceConfig.cloudVoice}) - "${task.text.slice(0, 35)}..."`
          );
        }
      } catch (err: any) {
        failedCount++;
        console.error(`❌ Failed ${task.fileName}:`, err?.message || err);
      }

      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }

  const workers = Array(concurrency)
    .fill(null)
    .map((_, idx) => worker(idx));

  await Promise.all(workers);

  if (fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  console.log(`\n🎉 Finished! Completed: ${completedCount}, Failed: ${failedCount}`);
  console.log(`📁 Files saved to: assets/cdn/audio/`);
  console.log(`☁️  To upload to CDN, run: yarn publish:app-audio`);
}

main().catch(err => {
  console.error('Fatal error during audio generation:', err);
  process.exit(1);
});
