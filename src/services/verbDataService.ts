import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { VerbCard, VerbSentence, CEFRLevel, AuxiliaryVerb } from '../../docs/verb.types';

const DB_NAME = 'main.db';

let db: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;
let cachedOrderedVerbs: VerbCard[] | null = null;
let cachedPrefixLevels: PrefixLevelData[] | null = null;
let cachedConjugationLevels: ConjugationLevelData[] | null = null;
let cachedVerbFormsLevels: VerbFormsLevelData[] | null = null;
let cachedPrepositionLevels: PrepositionLevelData[] | null = null;

export interface PrepositionVerbItem {
  id: string;
  infinitive: string;
  prep: string;
  case: string;
}

export interface PrepositionLevelRow {
  id: string;
  cefr_level: string;
  subgroup_type: string;
  level_number: number;
  order_index: number;
  title: string;
  verbs_json: string;
}

export interface PrepositionLevelData {
  id: string;
  cefrLevel: string;
  subgroupType: 'standard' | 'checkpoint' | 'final_test';
  levelNumber: number;
  orderIndex: number;
  title: string;
  verbs: PrepositionVerbItem[];
}

export function parsePrepositionLevelRow(row: PrepositionLevelRow): PrepositionLevelData {
  return {
    id: row.id,
    cefrLevel: row.cefr_level,
    subgroupType: row.subgroup_type as PrepositionLevelData['subgroupType'],
    levelNumber: row.level_number,
    orderIndex: row.order_index,
    title: row.title,
    verbs: JSON.parse(row.verbs_json),
  };
}

export interface VerbRow {
  id: string;
  infinitive: string;
  infinitive_lower: string;
  level: string;
  frequency_rank: number;
  auxiliary: string;
  prefix_type: string;
  prefix: string | null;
  morphology: string;
  principal_parts: string;
  conjugation: string;
  rektion: string;
  chunk: string | null;
  sentences: string;
  translation: string;
  search_text: string;
}

export interface PrefixLevelRow {
  id: string;
  cefr_level: string;
  subgroup_type: string;
  level_number: number;
  title: string;
  verbs_json: string;
  exercise_sentence_ids_json: string;
}

export interface PrefixLevelData {
  id: string;
  cefrLevel: string;
  subgroupType: 'separable' | 'inseparable' | 'opposites' | 'dual' | 'checkpoint';
  levelNumber: number;
  title: string;
  verbs: string[];
  exerciseSentenceIds: Array<{ verbId: string; sentenceId: string }>;
}

export interface ConjugationLevelRow {
  id: string;
  cefr_level: string;
  subgroup_type: string;
  level_number: number;
  order_index: number;
  title: string;
  verbs_json: string;
}

export interface ConjugationLevelData {
  id: string;
  cefrLevel: string;
  subgroupType: 'standard' | 'checkpoint' | 'final_test';
  levelNumber: number;
  orderIndex: number;
  title: string;
  verbs: string[];
}

export interface VerbFormsLevelRow {
  id: string;
  cefr_level: string;
  subgroup_type: string;
  level_number: number;
  order_index: number;
  title: string;
  verbs_json: string;
}

export interface VerbFormsLevelData {
  id: string;
  cefrLevel: string;
  subgroupType: 'standard' | 'checkpoint' | 'final_test';
  levelNumber: number;
  orderIndex: number;
  title: string;
  verbs: string[];
}

export function parseVerbFormsLevelRow(row: VerbFormsLevelRow): VerbFormsLevelData {
  return {
    id: row.id,
    cefrLevel: row.cefr_level,
    subgroupType: row.subgroup_type as VerbFormsLevelData['subgroupType'],
    levelNumber: row.level_number,
    orderIndex: row.order_index,
    title: row.title,
    verbs: JSON.parse(row.verbs_json),
  };
}

export function parseConjugationLevelRow(row: ConjugationLevelRow): ConjugationLevelData {
  return {
    id: row.id,
    cefrLevel: row.cefr_level,
    subgroupType: row.subgroup_type as ConjugationLevelData['subgroupType'],
    levelNumber: row.level_number,
    orderIndex: row.order_index,
    title: row.title,
    verbs: JSON.parse(row.verbs_json),
  };
}

export function parsePrefixLevelRow(row: PrefixLevelRow): PrefixLevelData {
  return {
    id: row.id,
    cefrLevel: row.cefr_level,
    subgroupType: row.subgroup_type as PrefixLevelData['subgroupType'],
    levelNumber: row.level_number,
    title: row.title,
    verbs: JSON.parse(row.verbs_json),
    exerciseSentenceIds: JSON.parse(row.exercise_sentence_ids_json),
  };
}

export function parseVerbRow(row: VerbRow): VerbCard {
  return {
    id: row.id,
    infinitive: row.infinitive,
    level: row.level as CEFRLevel,
    frequency_rank: row.frequency_rank ?? 9999,
    auxiliary: row.auxiliary as AuxiliaryVerb,
    morphology: JSON.parse(row.morphology),
    principal_parts: JSON.parse(row.principal_parts),
    conjugation: JSON.parse(row.conjugation),
    rektion: JSON.parse(row.rektion),
    chunk: row.chunk || undefined,
    sentences: JSON.parse(row.sentences),
    translation: JSON.parse(row.translation),
  };
}

export const verbDataService = {
  async init(): Promise<void> {
    if (db) return;
    if (isInitializing && initPromise) return initPromise;

    isInitializing = true;
    initPromise = (async () => {
      try {
        const dbDir = `${FileSystem.documentDirectory}SQLite/`;
        const dbPath = `${dbDir}${DB_NAME}`;

        const dirInfo = await FileSystem.getInfoAsync(dbDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
        }

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const asset = Asset.fromModule(require('../../assets/main.db'));
        await asset.downloadAsync();

        if (!asset.localUri) throw new Error('Asset download failed for main.db');

        const currentDbInfo = await FileSystem.getInfoAsync(dbPath);
        if (currentDbInfo.exists) {
          await FileSystem.deleteAsync(dbPath);
        }

        await FileSystem.copyAsync({ from: asset.localUri, to: dbPath });

        db = await SQLite.openDatabaseAsync(DB_NAME);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[VerbDataService] Failed to initialize SQLite database:', error);
        throw error;
      } finally {
        isInitializing = false;
      }
    })();

    return initPromise;
  },

  async getAllVerbs(options?: {
    level?: string;
    auxiliary?: string;
    limit?: number;
    offset?: number;
  }): Promise<VerbCard[]> {
    await this.init();
    if (!db) return [];

    let query = 'SELECT * FROM verbs WHERE 1=1';
    const params: (string | number)[] = [];

    if (options?.level) {
      query += ' AND level = ?';
      params.push(options.level);
    }

    if (options?.auxiliary) {
      query += ' AND auxiliary = ?';
      params.push(options.auxiliary);
    }

    query += ' ORDER BY infinitive ASC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      if (options.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const rows = await db.getAllAsync<VerbRow>(query, params);
    return rows.map(parseVerbRow);
  },

  async getVerbsOrderedByDifficulty(): Promise<VerbCard[]> {
    if (cachedOrderedVerbs) {
      return cachedOrderedVerbs;
    }

    await this.init();
    if (!db) return [];

    const query = `
      SELECT * FROM verbs
      ORDER BY 
        CASE level
          WHEN 'A1' THEN 1
          WHEN 'A2' THEN 2
          WHEN 'B1' THEN 3
          WHEN 'B2' THEN 4
          WHEN 'C1' THEN 5
          WHEN 'C2' THEN 6
          ELSE 7
        END ASC,
        frequency_rank ASC,
        infinitive_lower ASC
    `;

    const rows = await db.getAllAsync<VerbRow>(query);
    cachedOrderedVerbs = rows.map(parseVerbRow);
    return cachedOrderedVerbs;
  },

  async searchVerbs(query: string, locale: string, limit: number = 30): Promise<VerbCard[]> {
    await this.init();
    if (!db) return [];

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return this.getAllVerbs({ limit });
    }

    const qWildcard = `%${trimmed}%`;
    const qPrefix = `${trimmed}%`;
    const lang = locale.split('-')[0];

    const sql = `
      SELECT * FROM verbs
      WHERE infinitive_lower LIKE ?
         OR json_extract(translation, '$.' || ?) LIKE ?
         OR search_text LIKE ?
      ORDER BY
        CASE
          WHEN infinitive_lower = ? THEN 0
          WHEN infinitive_lower LIKE ? THEN 1
          WHEN json_extract(translation, '$.' || ?) = ? THEN 2
          WHEN json_extract(translation, '$.' || ?) LIKE ? THEN 3
          ELSE 4
        END,
        LENGTH(infinitive) ASC
      LIMIT ?
    `;

    const params = [
      qWildcard,
      lang,
      qWildcard,
      qWildcard,
      trimmed,
      qPrefix,
      lang,
      trimmed,
      lang,
      qPrefix,
      limit,
    ];

    const rows = await db.getAllAsync<VerbRow>(sql, params);
    return rows.map(parseVerbRow);
  },

  async getVerbById(id: string): Promise<VerbCard | null> {
    await this.init();
    if (!db) return null;

    const row = await db.getFirstAsync<VerbRow>('SELECT * FROM verbs WHERE id = ?', [id]);
    return row ? parseVerbRow(row) : null;
  },

  async getVerbsByInfinitive(infinitive: string): Promise<VerbCard[]> {
    await this.init();
    if (!db) return [];

    const rows = await db.getAllAsync<VerbRow>(
      'SELECT * FROM verbs WHERE infinitive_lower = ? ORDER BY id ASC',
      [infinitive.toLowerCase()],
    );
    return rows.map(parseVerbRow);
  },

  async getAllPrefixLevels(): Promise<PrefixLevelData[]> {
    if (cachedPrefixLevels) {
      return cachedPrefixLevels;
    }

    await this.init();
    if (!db) return [];

    const sql = `
      SELECT * FROM prefix_levels
      ORDER BY
        CASE cefr_level
          WHEN 'A1' THEN 1
          WHEN 'A2' THEN 2
          WHEN 'B1' THEN 3
          WHEN 'B2' THEN 4
          ELSE 5
        END ASC,
        CASE subgroup_type
          WHEN 'opposites' THEN 1
          WHEN 'dual' THEN 2
          WHEN 'separable' THEN 3
          WHEN 'inseparable' THEN 4
          WHEN 'checkpoint' THEN 5
          ELSE 6
        END ASC,
        level_number ASC
    `;
    const rows = await db.getAllAsync<PrefixLevelRow>(sql);
    cachedPrefixLevels = rows.map(parsePrefixLevelRow);
    return cachedPrefixLevels;
  },

  async getPrefixLevelsByCefr(cefrLevel: string): Promise<PrefixLevelData[]> {
    const allLevels = await this.getAllPrefixLevels();
    return allLevels.filter(lvl => lvl.cefrLevel === cefrLevel);
  },

  async getPrefixLevelById(id: string): Promise<PrefixLevelData | null> {
    await this.init();
    if (!db) return null;

    const row = await db.getFirstAsync<PrefixLevelRow>('SELECT * FROM prefix_levels WHERE id = ?', [
      id,
    ]);
    return row ? parsePrefixLevelRow(row) : null;
  },

  async getPrefixCheckpoint(cefrLevel: string): Promise<PrefixLevelData | null> {
    await this.init();
    if (!db) return null;

    const row = await db.getFirstAsync<PrefixLevelRow>(
      'SELECT * FROM prefix_levels WHERE cefr_level = ? AND subgroup_type = "checkpoint"',
      [cefrLevel],
    );
    return row ? parsePrefixLevelRow(row) : null;
  },

  async getNextPrefixLevel(currentLevelId: string): Promise<PrefixLevelData | null> {
    const all = await this.getAllPrefixLevels();
    const currentIndex = all.findIndex(lvl => lvl.id === currentLevelId);
    if (currentIndex >= 0 && currentIndex + 1 < all.length) {
      return all[currentIndex + 1];
    }
    return null;
  },

  async getAllConjugationLevels(): Promise<ConjugationLevelData[]> {
    if (cachedConjugationLevels) return cachedConjugationLevels;

    await this.init();
    if (!db) return [];

    const sql = `
      SELECT * FROM conjugation_levels
      ORDER BY
        CASE cefr_level
          WHEN 'A1' THEN 1
          WHEN 'A2' THEN 2
          WHEN 'B1' THEN 3
          WHEN 'B2' THEN 4
          ELSE 5
        END ASC,
        order_index ASC
    `;
    const rows = await db.getAllAsync<ConjugationLevelRow>(sql);
    cachedConjugationLevels = rows.map(parseConjugationLevelRow);
    return cachedConjugationLevels;
  },

  async getConjugationLevelsByCefr(cefrLevel: string): Promise<ConjugationLevelData[]> {
    const allLevels = await this.getAllConjugationLevels();
    return allLevels.filter(lvl => lvl.cefrLevel === cefrLevel);
  },

  async getConjugationLevelById(id: string): Promise<ConjugationLevelData | null> {
    await this.init();
    if (!db) return null;

    const row = await db.getFirstAsync<ConjugationLevelRow>(
      'SELECT * FROM conjugation_levels WHERE id = ?',
      [id],
    );
    return row ? parseConjugationLevelRow(row) : null;
  },

  async getNextConjugationLevel(currentLevelId: string): Promise<ConjugationLevelData | null> {
    const all = await this.getAllConjugationLevels();
    const currentIndex = all.findIndex(lvl => lvl.id === currentLevelId);
    if (currentIndex >= 0 && currentIndex + 1 < all.length) {
      return all[currentIndex + 1];
    }
    return null;
  },

  async getAllVerbFormsLevels(): Promise<VerbFormsLevelData[]> {
    if (cachedVerbFormsLevels) return cachedVerbFormsLevels;

    await this.init();
    if (!db) return [];

    const sql = `
      SELECT * FROM verb_forms_levels
      ORDER BY
        CASE cefr_level
          WHEN 'A1' THEN 1
          WHEN 'A2' THEN 2
          WHEN 'B1' THEN 3
          WHEN 'B2' THEN 4
          ELSE 5
        END ASC,
        order_index ASC
    `;
    const rows = await db.getAllAsync<VerbFormsLevelRow>(sql);
    cachedVerbFormsLevels = rows.map(parseVerbFormsLevelRow);
    return cachedVerbFormsLevels;
  },

  async getVerbFormsLevelsByCefr(cefrLevel: string): Promise<VerbFormsLevelData[]> {
    const allLevels = await this.getAllVerbFormsLevels();
    return allLevels.filter(lvl => lvl.cefrLevel === cefrLevel);
  },

  async getVerbFormsLevelById(id: string): Promise<VerbFormsLevelData | null> {
    await this.init();
    if (!db) return null;

    const row = await db.getFirstAsync<VerbFormsLevelRow>(
      'SELECT * FROM verb_forms_levels WHERE id = ?',
      [id],
    );
    return row ? parseVerbFormsLevelRow(row) : null;
  },

  async getNextVerbFormsLevel(currentLevelId: string): Promise<VerbFormsLevelData | null> {
    const all = await this.getAllVerbFormsLevels();
    const currentIndex = all.findIndex(lvl => lvl.id === currentLevelId);
    if (currentIndex >= 0 && currentIndex + 1 < all.length) {
      return all[currentIndex + 1];
    }
    return null;
  },

  async getAllPrepositionLevels(): Promise<PrepositionLevelData[]> {
    if (cachedPrepositionLevels) return cachedPrepositionLevels;

    await this.init();
    if (!db) return [];

    const sql = `
      SELECT * FROM preposition_levels
      ORDER BY
        CASE cefr_level
          WHEN 'A1' THEN 1
          WHEN 'A2' THEN 2
          WHEN 'B1' THEN 3
          WHEN 'B2' THEN 4
          ELSE 5
        END ASC,
        order_index ASC
    `;
    const rows = await db.getAllAsync<PrepositionLevelRow>(sql);
    cachedPrepositionLevels = rows.map(parsePrepositionLevelRow);
    return cachedPrepositionLevels;
  },

  async getPrepositionLevelsByCefr(cefrLevel: string): Promise<PrepositionLevelData[]> {
    const allLevels = await this.getAllPrepositionLevels();
    return allLevels.filter(lvl => lvl.cefrLevel === cefrLevel);
  },

  async getPrepositionLevelById(id: string): Promise<PrepositionLevelData | null> {
    await this.init();
    if (!db) return null;

    const row = await db.getFirstAsync<PrepositionLevelRow>(
      'SELECT * FROM preposition_levels WHERE id = ?',
      [id],
    );
    return row ? parsePrepositionLevelRow(row) : null;
  },

  async getNextPrepositionLevel(currentLevelId: string): Promise<PrepositionLevelData | null> {
    const all = await this.getAllPrepositionLevels();
    const currentIndex = all.findIndex(lvl => lvl.id === currentLevelId);
    if (currentIndex >= 0 && currentIndex + 1 < all.length) {
      return all[currentIndex + 1];
    }
    return null;
  },

  async getSentencesByIds(
    entries: Array<{ verbId: string; sentenceId: string }>,
  ): Promise<Array<{ verbCard: VerbCard; sentence: VerbSentence }>> {
    await this.init();
    if (!db || entries.length === 0) return [];

    const cardMap = new Map<string, VerbCard>();
    const results: Array<{ verbCard: VerbCard; sentence: VerbSentence }> = [];

    for (const entry of entries) {
      let card = cardMap.get(entry.verbId);
      if (!card) {
        card = (await this.getVerbById(entry.verbId)) || undefined;
        if (card) {
          cardMap.set(entry.verbId, card);
        }
      }

      if (card) {
        const sentence = card.sentences.find(s => s.id === entry.sentenceId) || card.sentences[0];
        if (sentence) {
          results.push({ verbCard: card, sentence });
        }
      }
    }

    return results;
  },

  clearCache(): void {
    cachedOrderedVerbs = null;
    cachedPrefixLevels = null;
    cachedConjugationLevels = null;
    cachedVerbFormsLevels = null;
    cachedPrepositionLevels = null;
  },
};
