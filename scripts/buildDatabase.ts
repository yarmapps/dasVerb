import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { VerbCard, VerbSentence } from '../docs/verb.types';

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const DB_PATH = path.join(ASSETS_DIR, 'main.db');

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;

const OPPOSITES_A2 = [
  'aufmachen',
  'zumachen',
  'anmachen',
  'ausmachen',
  'einsteigen',
  'aussteigen',
  'aufbauen',
  'abnehmen',
  'zunehmen',
  'anhalten',
];

const DUAL_PREFIXES = ['durch', 'über', 'ueber', 'um', 'unter', 'wieder', 'wider'];

function normalizeTense(tense: string): string {
  switch (tense) {
    case 'present':
      return 'Präsens';
    case 'past':
      return 'Präteritum';
    case 'perfect':
      return 'Perfekt';
    case 'imperative':
      return 'Imperativ';
    default:
      return tense;
  }
}

function getChunkSizes(n: number): number[] {
  if (n <= 5) return [n];
  for (let a = Math.floor(n / 5); a >= 0; a--) {
    const rem = n - 5 * a;
    if (rem % 4 === 0) {
      const b = rem / 4;
      return [...Array(a).fill(5), ...Array(b).fill(4)];
    }
  }
  const numChunks = Math.ceil(n / 5);
  const base = Math.floor(n / numChunks);
  const extra = n % numChunks;
  const result: number[] = [];
  for (let i = 0; i < numChunks; i++) {
    result.push(base + (i < extra ? 1 : 0));
  }
  return result;
}

function getSeparationSentences(card: VerbCard): VerbSentence[] {
  return (card.sentences || [])
    .map((s, idx) => ({
      ...s,
      id: s.id || `s${idx + 1}`,
      tense: normalizeTense(s.tense) as any,
    }))
    .filter(s => {
      if (s.tense === 'Perfekt') return false;
      const bp = s.bracket_parts || [];
      if (card.morphology?.prefix_type === 'separable') {
        if (bp.length < 2) return false;
        const part0 = bp[0].trim().toLowerCase();
        const part1 = bp[1].trim().toLowerCase();
        const text = s.german.toLowerCase();
        const idx0 = text.indexOf(part0);
        const idx1 = text.lastIndexOf(part1);
        return idx0 !== -1 && idx1 !== -1 && idx0 + part0.length < idx1;
      }
      return bp.length >= 1 && s.german.toLowerCase().includes(bp[0].trim().toLowerCase());
    });
}

function buildDatabase() {
  console.log('📦 Starting SQLite database compilation...');

  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  const db = new DatabaseSync(DB_PATH);

  db.exec(`
    CREATE TABLE verbs (
      id TEXT PRIMARY KEY,
      infinitive TEXT NOT NULL,
      infinitive_lower TEXT NOT NULL,
      level TEXT NOT NULL,
      frequency_rank INTEGER NOT NULL DEFAULT 9999,
      auxiliary TEXT NOT NULL,
      prefix_type TEXT NOT NULL DEFAULT 'none',
      prefix TEXT,
      morphology TEXT NOT NULL,
      principal_parts TEXT NOT NULL,
      conjugation TEXT NOT NULL,
      rektion TEXT NOT NULL,
      chunk TEXT,
      sentences TEXT NOT NULL,
      translation TEXT NOT NULL,
      search_text TEXT NOT NULL
    );

    CREATE INDEX idx_verbs_infinitive_lower ON verbs(infinitive_lower);
    CREATE INDEX idx_verbs_level ON verbs(level);
    CREATE INDEX idx_verbs_frequency_rank ON verbs(frequency_rank);
    CREATE INDEX idx_verbs_auxiliary ON verbs(auxiliary);
    CREATE INDEX idx_verbs_prefix_type ON verbs(prefix_type);
    CREATE INDEX idx_verbs_prefix ON verbs(prefix);

    CREATE TABLE prefix_levels (
      id TEXT PRIMARY KEY,
      cefr_level TEXT NOT NULL,
      subgroup_type TEXT NOT NULL,
      level_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      verbs_json TEXT NOT NULL,
      exercise_sentence_ids_json TEXT NOT NULL
    );

    CREATE INDEX idx_prefix_levels_cefr ON prefix_levels(cefr_level);
    CREATE INDEX idx_prefix_levels_subgroup ON prefix_levels(subgroup_type);

    CREATE TABLE conjugation_levels (
      id TEXT PRIMARY KEY,
      cefr_level TEXT NOT NULL,
      subgroup_type TEXT NOT NULL,
      level_number INTEGER NOT NULL,
      order_index INTEGER NOT NULL,
      title TEXT NOT NULL,
      verbs_json TEXT NOT NULL
    );

    CREATE INDEX idx_conjugation_levels_cefr ON conjugation_levels(cefr_level);
    CREATE INDEX idx_conjugation_levels_subgroup ON conjugation_levels(subgroup_type);
    CREATE INDEX idx_conjugation_levels_order ON conjugation_levels(order_index);

    CREATE TABLE verb_forms_levels (
      id TEXT PRIMARY KEY,
      cefr_level TEXT NOT NULL,
      subgroup_type TEXT NOT NULL,
      level_number INTEGER NOT NULL,
      order_index INTEGER NOT NULL,
      title TEXT NOT NULL,
      verbs_json TEXT NOT NULL
    );

    CREATE INDEX idx_verb_forms_levels_cefr ON verb_forms_levels(cefr_level);
    CREATE INDEX idx_verb_forms_levels_subgroup ON verb_forms_levels(subgroup_type);
    CREATE INDEX idx_verb_forms_levels_order ON verb_forms_levels(order_index);

    CREATE TABLE preposition_levels (
      id TEXT PRIMARY KEY,
      cefr_level TEXT NOT NULL,
      subgroup_type TEXT NOT NULL,
      level_number INTEGER NOT NULL,
      order_index INTEGER NOT NULL,
      title TEXT NOT NULL,
      verbs_json TEXT NOT NULL
    );

    CREATE INDEX idx_preposition_levels_cefr ON preposition_levels(cefr_level);
    CREATE INDEX idx_preposition_levels_subgroup ON preposition_levels(subgroup_type);
    CREATE INDEX idx_preposition_levels_order ON preposition_levels(order_index);
  `);

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} verb JSON files in data/`);

  const insertStmt = db.prepare(`
    INSERT INTO verbs (
      id,
      infinitive,
      infinitive_lower,
      level,
      frequency_rank,
      auxiliary,
      prefix_type,
      prefix,
      morphology,
      principal_parts,
      conjugation,
      rektion,
      chunk,
      sentences,
      translation,
      search_text
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  let count = 0;
  const loadedCards: VerbCard[] = [];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const verb: VerbCard = JSON.parse(content);

    // Normalize sentences in card
    const normalizedSentences = (verb.sentences || []).map((s, idx) => ({
      ...s,
      id: s.id || `s${idx + 1}`,
      tense: normalizeTense(s.tense) as any,
    }));
    verb.sentences = normalizedSentences;

    const prefixType = verb.morphology?.prefix_type || 'none';
    const prefix = verb.morphology?.prefix || null;

    const translationTexts = verb.translation ? Object.values(verb.translation).join(' ') : '';
    const principalPartsTexts = verb.principal_parts
      ? [
          verb.principal_parts.infinitive || '',
          verb.principal_parts.present_3sg || '',
          verb.principal_parts.praeteritum_3sg || '',
          verb.principal_parts.partizip_2 || '',
        ].join(' ')
      : '';

    const searchText = [
      verb.infinitive,
      verb.morphology?.prefix || '',
      principalPartsTexts,
      translationTexts,
    ]
      .join(' ')
      .toLowerCase();

    insertStmt.run(
      verb.id,
      verb.infinitive,
      verb.infinitive.toLowerCase(),
      verb.level,
      verb.frequency_rank ?? 9999,
      verb.auxiliary,
      prefixType,
      prefix,
      JSON.stringify(verb.morphology),
      JSON.stringify(verb.principal_parts),
      JSON.stringify(verb.conjugation),
      JSON.stringify(verb.rektion),
      verb.chunk || null,
      JSON.stringify(verb.sentences),
      JSON.stringify(verb.translation),
      searchText,
    );

    loadedCards.push(verb);
    count++;
  }

  console.log(`✅ Successfully compiled ${count} verbs into verbs table.`);

  // Deduplicate prefix verbs by infinitive
  const uniqueByInf = new Map<string, VerbCard[]>();
  for (const card of loadedCards) {
    const pType = card.morphology?.prefix_type || 'none';
    if (pType === 'none') continue;

    const inf = card.infinitive.toLowerCase();
    if (!uniqueByInf.has(inf)) {
      uniqueByInf.set(inf, []);
    }
    uniqueByInf.get(inf)!.push(card);
  }

  // Representative card for each unique infinitive (prefer exact id match or lowest frequency rank)
  const prefixVerbs: VerbCard[] = [];
  for (const [inf, cards] of uniqueByInf.entries()) {
    const baseCard =
      cards.find(c => c.id.toLowerCase() === inf) ||
      cards.sort((a, b) => (a.frequency_rank ?? 9999) - (b.frequency_rank ?? 9999))[0];
    prefixVerbs.push(baseCard);
  }

  const insertLevelStmt = db.prepare(`
    INSERT INTO prefix_levels (
      id,
      cefr_level,
      subgroup_type,
      level_number,
      title,
      verbs_json,
      exercise_sentence_ids_json
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?
    )
  `);

  let totalLevelsCreated = 0;

  for (const cefr of CEFR_LEVELS) {
    const levelCards = prefixVerbs.filter(v => v.level === cefr);
    levelCards.sort((a, b) => (a.frequency_rank ?? 9999) - (b.frequency_rank ?? 9999));

    const subgroups: Array<{ type: string; verbs: VerbCard[] }> = [];

    if (cefr === 'A1') {
      subgroups.push({
        type: 'separable',
        verbs: levelCards.filter(v => v.morphology?.prefix_type === 'separable'),
      });
      subgroups.push({
        type: 'inseparable',
        verbs: levelCards.filter(v => v.morphology?.prefix_type === 'inseparable'),
      });
    } else if (cefr === 'A2') {
      subgroups.push({
        type: 'opposites',
        verbs: levelCards.filter(v => OPPOSITES_A2.includes(v.infinitive.toLowerCase())),
      });
      subgroups.push({
        type: 'separable',
        verbs: levelCards.filter(
          v =>
            v.morphology?.prefix_type === 'separable' &&
            !OPPOSITES_A2.includes(v.infinitive.toLowerCase()),
        ),
      });
      subgroups.push({
        type: 'inseparable',
        verbs: levelCards.filter(v => v.morphology?.prefix_type === 'inseparable'),
      });
    } else {
      const dualCards = levelCards.filter(v => {
        const p = (v.morphology?.prefix || '').toLowerCase();
        return DUAL_PREFIXES.some(dp => p.startsWith(dp)) || v.morphology?.prefix_type === 'dual';
      });
      const dualIds = new Set(dualCards.map(v => v.id));

      subgroups.push({
        type: 'dual',
        verbs: dualCards,
      });
      subgroups.push({
        type: 'separable',
        verbs: levelCards.filter(
          v => v.morphology?.prefix_type === 'separable' && !dualIds.has(v.id),
        ),
      });
      subgroups.push({
        type: 'inseparable',
        verbs: levelCards.filter(
          v => v.morphology?.prefix_type === 'inseparable' && !dualIds.has(v.id),
        ),
      });
    }

    for (const subgroup of subgroups) {
      const { type, verbs } = subgroup;
      if (verbs.length === 0) continue;

      const chunkSizes = getChunkSizes(verbs.length);
      let verbCursor = 0;
      let levelNum = 1;

      for (const size of chunkSizes) {
        const chunkVerbs = verbs.slice(verbCursor, verbCursor + size);
        verbCursor += size;

        // Allocate sentences to hit exactly 10 questions
        // Distribute 10 sentences across chunkVerbs
        const baseSentenceCount = Math.floor(10 / chunkVerbs.length);
        const extraSentences = 10 % chunkVerbs.length;

        const exerciseSentenceEntries: Array<{ verbId: string; sentenceId: string }> = [];

        chunkVerbs.forEach((verb, idx) => {
          const quota = baseSentenceCount + (idx < extraSentences ? 1 : 0);
          const validSentences = getSeparationSentences(verb);
          const picked = validSentences.slice(0, quota);

          // If a verb somehow had fewer than quota (should never happen), fallback to any sentence
          if (picked.length < quota) {
            for (const s of verb.sentences) {
              if (picked.length >= quota) break;
              if (!picked.some(p => p.id === s.id)) {
                picked.push(s);
              }
            }
          }

          picked.forEach(s => {
            exerciseSentenceEntries.push({
              verbId: verb.id,
              sentenceId: s.id,
            });
          });
        });

        // Ensure exactly 10 entries
        if (exerciseSentenceEntries.length !== 10) {
          throw new Error(
            `Level ${cefr} ${type} ${levelNum} has ${exerciseSentenceEntries.length} exercises instead of 10!`,
          );
        }

        const levelId = `prefix_${cefr.toLowerCase()}_${type}_${levelNum}`;
        const title = `Level ${levelNum}`;

        insertLevelStmt.run(
          levelId,
          cefr,
          type,
          levelNum,
          title,
          JSON.stringify(chunkVerbs.map(v => v.infinitive)),
          JSON.stringify(exerciseSentenceEntries),
        );

        totalLevelsCreated++;
        levelNum++;
      }
    }

    // Build Section Checkpoint (20 questions picked evenly across all section verbs)
    const checkpointExerciseEntries: Array<{ verbId: string; sentenceId: string }> = [];
    let checkpointVerbIndex = 0;

    // Pick 1 sentence per verb in round-robin until 20 questions reached
    const verbSentenceCounters = new Map<string, number>();

    while (checkpointExerciseEntries.length < 20) {
      const verb = levelCards[checkpointVerbIndex % levelCards.length];
      const countUsed = verbSentenceCounters.get(verb.id) || 0;
      const validSentences = getSeparationSentences(verb);

      if (countUsed < validSentences.length) {
        const sentence = validSentences[countUsed];
        checkpointExerciseEntries.push({
          verbId: verb.id,
          sentenceId: sentence.id,
        });
        verbSentenceCounters.set(verb.id, countUsed + 1);
      }
      checkpointVerbIndex++;
    }

    const checkpointId = `prefix_checkpoint_${cefr.toLowerCase()}`;
    insertLevelStmt.run(
      checkpointId,
      cefr,
      'checkpoint',
      0,
      `Checkpoint ${cefr}`,
      JSON.stringify(levelCards.map(v => v.infinitive)),
      JSON.stringify(checkpointExerciseEntries),
    );
    totalLevelsCreated++;
  }

  console.log(`✅ Successfully compiled ${totalLevelsCreated} prefix levels into assets/main.db`);

  // Deduplicate all verbs by infinitive for conjugation levels
  const allUniqueByInf = new Map<string, VerbCard[]>();
  for (const card of loadedCards) {
    const inf = card.infinitive.toLowerCase();
    if (!allUniqueByInf.has(inf)) {
      allUniqueByInf.set(inf, []);
    }
    allUniqueByInf.get(inf)!.push(card);
  }

  const allUniqueVerbs: VerbCard[] = [];
  for (const [inf, cards] of allUniqueByInf.entries()) {
    const baseCard =
      cards.find(c => c.id.toLowerCase() === inf) ||
      cards.sort((a, b) => (a.frequency_rank ?? 9999) - (b.frequency_rank ?? 9999))[0];
    allUniqueVerbs.push(baseCard);
  }

  const insertConjugationLevelStmt = db.prepare(`
    INSERT INTO conjugation_levels (
      id,
      cefr_level,
      subgroup_type,
      level_number,
      order_index,
      title,
      verbs_json
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?
    )
  `);

  let totalConjugationLevelsCreated = 0;

  for (const cefr of CEFR_LEVELS) {
    const levelVerbs = allUniqueVerbs.filter(v => v.level === cefr);
    levelVerbs.sort((a, b) => (a.frequency_rank ?? 9999) - (b.frequency_rank ?? 9999));

    let levelNumber = 1;
    let checkpointNumber = 1;
    let orderIndex = 1;
    const accumulatedVerbsInBlock: string[] = [];

    for (let i = 0; i < levelVerbs.length; i += 5) {
      const chunk = levelVerbs.slice(i, i + 5);
      const chunkInfinitives = chunk.map(v => v.infinitive);
      accumulatedVerbsInBlock.push(...chunkInfinitives);

      const levelId = `conjugation_${cefr.toLowerCase()}_level_${levelNumber}`;
      insertConjugationLevelStmt.run(
        levelId,
        cefr,
        'standard',
        levelNumber,
        orderIndex,
        `Level ${levelNumber}`,
        JSON.stringify(chunkInfinitives),
      );
      totalConjugationLevelsCreated++;
      orderIndex++;

      // Every 10 levels, if there are more verbs ahead, insert an intermediate checkpoint
      if (levelNumber % 10 === 0 && i + 5 < levelVerbs.length) {
        const checkpointVerbs: string[] = [];
        const step = Math.max(1, Math.floor(accumulatedVerbsInBlock.length / 10));
        for (let k = 0; k < 10 && k * step < accumulatedVerbsInBlock.length; k++) {
          checkpointVerbs.push(accumulatedVerbsInBlock[k * step]);
        }
        for (const v of accumulatedVerbsInBlock) {
          if (checkpointVerbs.length >= 10) break;
          if (!checkpointVerbs.includes(v)) {
            checkpointVerbs.push(v);
          }
        }

        const cpId = `conjugation_${cefr.toLowerCase()}_checkpoint_${checkpointNumber}`;
        insertConjugationLevelStmt.run(
          cpId,
          cefr,
          'checkpoint',
          checkpointNumber,
          orderIndex,
          `Checkpoint ${checkpointNumber}`,
          JSON.stringify(checkpointVerbs),
        );
        totalConjugationLevelsCreated++;
        checkpointNumber++;
        orderIndex++;
        accumulatedVerbsInBlock.length = 0;
      }

      levelNumber++;
    }

    // Final Test Checkpoint at the end of CEFR level: 15 verbs
    const allInfinitives = levelVerbs.map(v => v.infinitive);
    const finalVerbs: string[] = [];
    const stepFinal = Math.max(1, Math.floor(allInfinitives.length / 15));
    for (let k = 0; k < 15 && k * stepFinal < allInfinitives.length; k++) {
      finalVerbs.push(allInfinitives[k * stepFinal]);
    }
    for (const v of allInfinitives) {
      if (finalVerbs.length >= 15) break;
      if (!finalVerbs.includes(v)) {
        finalVerbs.push(v);
      }
    }

    const finalTestId = `conjugation_${cefr.toLowerCase()}_final`;
    insertConjugationLevelStmt.run(
      finalTestId,
      cefr,
      'final_test',
      0,
      orderIndex,
      `Final Test ${cefr}`,
      JSON.stringify(finalVerbs),
    );
    totalConjugationLevelsCreated++;
    orderIndex++;
  }

  console.log(`✅ Successfully compiled ${totalConjugationLevelsCreated} conjugation levels into assets/main.db`);

  const insertVerbFormsLevelStmt = db.prepare(`
    INSERT INTO verb_forms_levels (
      id,
      cefr_level,
      subgroup_type,
      level_number,
      order_index,
      title,
      verbs_json
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?
    )
  `);

  let totalVerbFormsLevelsCreated = 0;

  const irregularUniqueVerbs = allUniqueVerbs.filter(
    v => v.morphology?.verb_class && v.morphology.verb_class !== 'weak'
  );

  for (const cefr of CEFR_LEVELS) {
    const levelVerbs = irregularUniqueVerbs.filter(v => v.level === cefr);
    levelVerbs.sort((a, b) => (a.frequency_rank ?? 9999) - (b.frequency_rank ?? 9999));

    let levelNumber = 1;
    let checkpointNumber = 1;
    let orderIndex = 1;
    const accumulatedVerbsInBlock: string[] = [];

    for (let i = 0; i < levelVerbs.length; i += 5) {
      const chunk = levelVerbs.slice(i, i + 5);
      const chunkInfinitives = chunk.map(v => v.infinitive);
      accumulatedVerbsInBlock.push(...chunkInfinitives);

      const levelId = `verb_forms_${cefr.toLowerCase()}_level_${levelNumber}`;
      insertVerbFormsLevelStmt.run(
        levelId,
        cefr,
        'standard',
        levelNumber,
        orderIndex,
        `Level ${levelNumber}`,
        JSON.stringify(chunkInfinitives),
      );
      totalVerbFormsLevelsCreated++;
      orderIndex++;

      // Every 10 levels, if there are more verbs ahead, insert an intermediate checkpoint
      if (levelNumber % 10 === 0 && i + 5 < levelVerbs.length) {
        const checkpointVerbs: string[] = [];
        const step = Math.max(1, Math.floor(accumulatedVerbsInBlock.length / 10));
        for (let k = 0; k < 10 && k * step < accumulatedVerbsInBlock.length; k++) {
          checkpointVerbs.push(accumulatedVerbsInBlock[k * step]);
        }
        for (const v of accumulatedVerbsInBlock) {
          if (checkpointVerbs.length >= 10) break;
          if (!checkpointVerbs.includes(v)) {
            checkpointVerbs.push(v);
          }
        }

        const cpId = `verb_forms_${cefr.toLowerCase()}_checkpoint_${checkpointNumber}`;
        insertVerbFormsLevelStmt.run(
          cpId,
          cefr,
          'checkpoint',
          checkpointNumber,
          orderIndex,
          `Checkpoint ${checkpointNumber}`,
          JSON.stringify(checkpointVerbs),
        );
        totalVerbFormsLevelsCreated++;
        checkpointNumber++;
        orderIndex++;
        accumulatedVerbsInBlock.length = 0;
      }

      levelNumber++;
    }

    // Final Test Checkpoint at the end of CEFR level: 15 verbs
    const allInfinitives = levelVerbs.map(v => v.infinitive);
    const finalVerbs: string[] = [];
    const stepFinal = Math.max(1, Math.floor(allInfinitives.length / 15));
    for (let k = 0; k < 15 && k * stepFinal < allInfinitives.length; k++) {
      finalVerbs.push(allInfinitives[k * stepFinal]);
    }
    for (const v of allInfinitives) {
      if (finalVerbs.length >= 15) break;
      if (!finalVerbs.includes(v)) {
        finalVerbs.push(v);
      }
    }

    const finalTestId = `verb_forms_${cefr.toLowerCase()}_final`;
    insertVerbFormsLevelStmt.run(
      finalTestId,
      cefr,
      'final_test',
      0,
      orderIndex,
      `Final Test ${cefr}`,
      JSON.stringify(finalVerbs),
    );
    totalVerbFormsLevelsCreated++;
    orderIndex++;
  }

  console.log(`✅ Successfully compiled ${totalVerbFormsLevelsCreated} verb forms levels into assets/main.db`);

  const insertPrepositionLevelStmt = db.prepare(`
    INSERT INTO preposition_levels (
      id,
      cefr_level,
      subgroup_type,
      level_number,
      order_index,
      title,
      verbs_json
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?
    )
  `);

  let totalPrepositionLevelsCreated = 0;

  const prepositionCards = loadedCards.filter(
    v => Boolean(v.rektion?.preposition)
  );

  for (const cefr of CEFR_LEVELS) {
    const levelCards = prepositionCards.filter(v => v.level === cefr);
    levelCards.sort((a, b) => (a.frequency_rank ?? 9999) - (b.frequency_rank ?? 9999));

    let levelNumber = 1;
    let checkpointNumber = 1;
    let orderIndex = 1;
    const accumulatedVerbsInBlock: Array<{ id: string; infinitive: string; prep: string; case: string }> = [];

    for (let i = 0; i < levelCards.length; i += 5) {
      const chunk = levelCards.slice(i, i + 5);
      const chunkItems = chunk.map(v => ({
        id: v.id,
        infinitive: v.infinitive,
        prep: v.rektion!.preposition!,
        case: v.rektion!.preposition_case!,
      }));
      accumulatedVerbsInBlock.push(...chunkItems);

      const levelId = `preposition_${cefr.toLowerCase()}_level_${levelNumber}`;
      insertPrepositionLevelStmt.run(
        levelId,
        cefr,
        'standard',
        levelNumber,
        orderIndex,
        `Level ${levelNumber}`,
        JSON.stringify(chunkItems),
      );
      totalPrepositionLevelsCreated++;
      orderIndex++;

      // Every 10 levels, if there are more verbs ahead, insert an intermediate checkpoint
      if (levelNumber % 10 === 0 && i + 5 < levelCards.length) {
        const checkpointItems: Array<{ id: string; infinitive: string; prep: string; case: string }> = [];
        const step = Math.max(1, Math.floor(accumulatedVerbsInBlock.length / 10));
        for (let k = 0; k < 10 && k * step < accumulatedVerbsInBlock.length; k++) {
          checkpointItems.push(accumulatedVerbsInBlock[k * step]);
        }
        for (const item of accumulatedVerbsInBlock) {
          if (checkpointItems.length >= 10) break;
          if (!checkpointItems.some(x => x.id === item.id)) {
            checkpointItems.push(item);
          }
        }

        const cpId = `preposition_${cefr.toLowerCase()}_checkpoint_${checkpointNumber}`;
        insertPrepositionLevelStmt.run(
          cpId,
          cefr,
          'checkpoint',
          checkpointNumber,
          orderIndex,
          `Checkpoint ${checkpointNumber}`,
          JSON.stringify(checkpointItems),
        );
        totalPrepositionLevelsCreated++;
        checkpointNumber++;
        orderIndex++;
        accumulatedVerbsInBlock.length = 0;
      }

      levelNumber++;
    }

    // Final Test Checkpoint at the end of CEFR level: 15 verbs
    const allItems = levelCards.map(v => ({
      id: v.id,
      infinitive: v.infinitive,
      prep: v.rektion!.preposition!,
      case: v.rektion!.preposition_case!,
    }));
    const finalItems: Array<{ id: string; infinitive: string; prep: string; case: string }> = [];
    const stepFinal = Math.max(1, Math.floor(allItems.length / 15));
    for (let k = 0; k < 15 && k * stepFinal < allItems.length; k++) {
      finalItems.push(allItems[k * stepFinal]);
    }
    for (const item of allItems) {
      if (finalItems.length >= 15) break;
      if (!finalItems.some(x => x.id === item.id)) {
        finalItems.push(item);
      }
    }

    const finalTestId = `preposition_${cefr.toLowerCase()}_final`;
    insertPrepositionLevelStmt.run(
      finalTestId,
      cefr,
      'final_test',
      0,
      orderIndex,
      `Final Test ${cefr}`,
      JSON.stringify(finalItems),
    );
    totalPrepositionLevelsCreated++;
    orderIndex++;
  }

  console.log(`✅ Successfully compiled ${totalPrepositionLevelsCreated} preposition levels into assets/main.db`);
  db.close();
}

buildDatabase();

