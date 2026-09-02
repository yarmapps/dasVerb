import fs from 'fs';
import path from 'path';
import { VerbCard, VerbSentence } from '../docs/verb.types';

interface ValidationError {
  file: string;
  sentenceId?: string;
  tense?: string;
  german?: string;
  message: string;
}

const dataDir = path.resolve(__dirname, '../data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

const errors: ValidationError[] = [];

console.log(`🔍 Inspecting ${files.length} verb cards in ${dataDir}...`);

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  let verb: VerbCard;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    verb = JSON.parse(raw);
  } catch (err) {
    errors.push({ file, message: `Invalid JSON syntax: ${(err as Error).message}` });
    return;
  }

  const isModal = verb.morphology.verb_class === 'modal';
  const isSeparable = verb.morphology.prefix_type === 'separable';

  verb.sentences.forEach((sentence: VerbSentence) => {
    const german = sentence.german;
    const bracketParts = sentence.bracket_parts || [];

    // 1. Check all bracket parts exist in german sentence
    bracketParts.forEach(part => {
      const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (!regex.test(german) && !german.toLowerCase().includes(part.toLowerCase())) {
        errors.push({
          file,
          sentenceId: sentence.id,
          tense: sentence.tense,
          german,
          message: `Bracket part "${part}" was not found in german sentence: "${german}"`,
        });
      }
    });

    // 2. Check bracket_parts count rules
    if (sentence.tense === 'Perfekt') {
      if (bracketParts.length !== 2) {
        errors.push({
          file,
          sentenceId: sentence.id,
          tense: sentence.tense,
          german,
          message: `Perfekt tense MUST have exactly 2 bracket parts (auxiliary + Partizip II / Ersatzinfinitiv). Found ${bracketParts.length}: ${JSON.stringify(bracketParts)}`,
        });
      }
    } else if (sentence.tense === 'Präsens' || sentence.tense === 'Präteritum' || sentence.tense === 'Imperativ') {
      if (isSeparable) {
        if (bracketParts.length !== 2) {
          errors.push({
            file,
            sentenceId: sentence.id,
            tense: sentence.tense,
            german,
            message: `Separable verb (${verb.infinitive}) in ${sentence.tense} MUST have exactly 2 bracket parts (stem + prefix). Found ${bracketParts.length}: ${JSON.stringify(bracketParts)}`,
          });
        }
      } else {
        // Non-separable verbs (including modal verbs) MUST have exactly 1 bracket part (the verb itself)
        if (bracketParts.length !== 1) {
          errors.push({
            file,
            sentenceId: sentence.id,
            tense: sentence.tense,
            german,
            message: `Non-separable verb (${verb.infinitive}) in ${sentence.tense} MUST have exactly 1 bracket part. Found ${bracketParts.length}: ${JSON.stringify(bracketParts)}`,
          });
        }
      }
    }

    // 3. Dativ and Akkusativ parts presence
    (sentence.dativ_parts || []).forEach(part => {
      if (!german.toLowerCase().includes(part.toLowerCase())) {
        errors.push({
          file,
          sentenceId: sentence.id,
          tense: sentence.tense,
          german,
          message: `Dativ part "${part}" was not found in german sentence: "${german}"`,
        });
      }
    });

    (sentence.akkusativ_parts || []).forEach(part => {
      if (!german.toLowerCase().includes(part.toLowerCase())) {
        errors.push({
          file,
          sentenceId: sentence.id,
          tense: sentence.tense,
          german,
          message: `Akkusativ part "${part}" was not found in german sentence: "${german}"`,
        });
      }
    });
  });
});

if (errors.length > 0) {
  console.error(`\n❌ Found ${errors.length} validation errors:`);
  errors.forEach((err, i) => {
    console.error(
      `\n[${i + 1}] File: ${err.file}${err.sentenceId ? ` (${err.sentenceId}, ${err.tense})` : ''}\n` +
      `    Sentence: ${err.german || 'N/A'}\n` +
      `    Error: ${err.message}`
    );
  });
  process.exit(1);
} else {
  console.log(`\n✅ ALL ${files.length} verb cards passed bracket_parts and grammar structure validation successfully!`);
}
