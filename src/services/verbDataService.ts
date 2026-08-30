import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { VerbCard, CEFRLevel, AuxiliaryVerb } from '../../docs/verb.types';

const DB_NAME = 'main.db';

let db: SQLite.SQLiteDatabase | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

export interface VerbRow {
  id: string;
  infinitive: string;
  infinitive_lower: string;
  level: string;
  auxiliary: string;
  morphology: string;
  principal_parts: string;
  conjugation: string;
  rektion: string;
  chunk: string | null;
  sentences: string;
  translation: string;
  search_text: string;
}

export function parseVerbRow(row: VerbRow): VerbCard {
  return {
    id: row.id,
    infinitive: row.infinitive,
    level: row.level as CEFRLevel,
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
        infinitive_lower ASC
    `;

    const rows = await db.getAllAsync<VerbRow>(query);
    return rows.map(parseVerbRow);
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
};
