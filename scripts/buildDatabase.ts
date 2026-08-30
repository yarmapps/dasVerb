import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { VerbCard } from '../docs/verb.types';

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const DB_PATH = path.join(ASSETS_DIR, 'main.db');

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
      auxiliary TEXT NOT NULL,
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
    CREATE INDEX idx_verbs_auxiliary ON verbs(auxiliary);
  `);

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} verb JSON files in data/`);

  const insertStmt = db.prepare(`
    INSERT INTO verbs (
      id,
      infinitive,
      infinitive_lower,
      level,
      auxiliary,
      morphology,
      principal_parts,
      conjugation,
      rektion,
      chunk,
      sentences,
      translation,
      search_text
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  let count = 0;

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const verb: VerbCard = JSON.parse(content);

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
      verb.auxiliary,
      JSON.stringify(verb.morphology),
      JSON.stringify(verb.principal_parts),
      JSON.stringify(verb.conjugation),
      JSON.stringify(verb.rektion),
      verb.chunk || null,
      JSON.stringify(verb.sentences),
      JSON.stringify(verb.translation),
      searchText,
    );

    count++;
  }

  console.log(`✅ Successfully compiled ${count} verbs into assets/main.db`);
  db.close();
}

buildDatabase();
