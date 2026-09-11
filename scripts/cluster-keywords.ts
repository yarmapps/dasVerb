import fs from 'fs';
import path from 'path';

const rawData: Array<{ keyword: string; wordCount: number; competition: 'High' | 'Medium' | 'Low'; category: string; intent: string }> = 
  JSON.parse(fs.readFileSync('vault/semantic_core/keywords_en.json', 'utf8'));

// Stop words / false friends for "case" (physical cases, legal cases, games)
const excludeTerms = [
  'beer', 'cigarette', 'knife', 'knives', 'phone', 'iphone', 'bow', 'binoculars',
  'butter', 'noodles', 'flight', 'clarinet', 'csgo', 'court', 'crime', 'murder',
  'cold case', 'suitcase', 'law', 'legal', 'company', 'packer', 'binding',
  'facebook', 'ww2', 'shoe', 'leather', 'wood', 'gun', 'pillow', 'watch', 'briefcase'
];

const cleaned = rawData.filter(item => {
  const kw = item.keyword.toLowerCase();
  for (const stop of excludeTerms) {
    if (kw.includes(stop)) return false;
  }
  return true;
});

// Clusters definition for ASO
const clusters = {
  '1. Verbs & Conjugation (Core Feature)': [] as typeof cleaned,
  '2. German Cases & Prepositions (Dativ / Akkusativ)': [] as typeof cleaned,
  '3. Irregular & Separable Verbs': [] as typeof cleaned,
  '4. Levels (A1, A2, B1, B2)': [] as typeof cleaned,
  '5. App, Quizzes & Practice Tools (Transactional/High Intent)': [] as typeof cleaned,
  '6. General German Grammar & Learning': [] as typeof cleaned,
};

for (const item of cleaned) {
  const kw = item.keyword;
  if (kw.includes('app') || kw.includes('quiz') || kw.includes('practice') || kw.includes('flashcard') || kw.includes('test') || kw.includes('game') || kw.includes('trainer') || kw.includes('exercise')) {
    clusters['5. App, Quizzes & Practice Tools (Transactional/High Intent)'].push(item);
  } else if (kw.includes('irregular') || kw.includes('separable') || kw.includes('prefix') || kw.includes('modal') || kw.includes('reflexive') || kw.includes('trennbar') || kw.includes('unregel')) {
    clusters['3. Irregular & Separable Verbs'].push(item);
  } else if (kw.includes('a1') || kw.includes('a2') || kw.includes('b1') || kw.includes('b2')) {
    clusters['4. Levels (A1, A2, B1, B2)'].push(item);
  } else if (kw.includes('dativ') || kw.includes('akkusativ') || kw.includes('case') || kw.includes('preposition') || kw.includes('dative') || kw.includes('accusative') || kw.includes('genitive') || kw.includes('nominative')) {
    clusters['2. German Cases & Prepositions (Dativ / Akkusativ)'].push(item);
  } else if (kw.includes('verb') || kw.includes('conjugat') || kw.includes('tenses') || kw.includes('präsens') || kw.includes('perfekt') || kw.includes('präteritum')) {
    clusters['1. Verbs & Conjugation (Core Feature)'].push(item);
  } else {
    clusters['6. General German Grammar & Learning'].push(item);
  }
}

// Generate beautiful Markdown report
let md = `# Semantic Core (English): German Verbs, Cases & Learning Keywords\n\n`;
md += `Aggregated & Filtered from Google Search and Google Play Store Suggesters.\n`;
md += `Total Verified Linguistic & App Keywords: **${cleaned.length}**\n\n`;

md += `## 🎯 ASO Strategy & Insights for dasVerb\n\n`;
md += `1. **Primary Root Keywords (High Volume):** \`german verbs\`, \`german verb conjugation\`, \`german cases\`, \`learn german verbs\`, \`german grammar\`.\n`;
md += `2. **High-Converting Core Phrases (Medium Volume, High Intent):**\n`;
md += `   - \`german verbs with prepositions\` (Прямое попадание в УТП dasVerb!)\n`;
md += `   - \`german dative accusative verbs\` / \`german cases verbs\`\n`;
md += `   - \`german separable verbs practice\` (Prefix Practice модуль!)\n`;
md += `   - \`german irregular verbs a1 a2 b1 b2\`\n`;
md += `   - \`german verb conjugation practice app\`\n\n`;

md += `## 📊 Semantic Clusters Overview\n\n`;
md += `| Cluster | Keywords Count | Primary User Intent | Relevance to dasVerb |\n`;
md += `| :--- | :--- | :--- | :--- |\n`;
md += `| **1. Verbs & Conjugation** | ${clusters['1. Verbs & Conjugation (Core Feature)'].length} | Learning Verb Forms & Tenses | 🔥 100% Core |\n`;
md += `| **2. Cases & Prepositions (Dativ/Akkusativ)** | ${clusters['2. German Cases & Prepositions (Dativ / Akkusativ)'].length} | Mastering Prepositions & Cases | 🔥 100% Core |\n`;
md += `| **3. Irregular & Separable Verbs** | ${clusters['3. Irregular & Separable Verbs'].length} | Prefixes & Irregular Patterns | 🔥 100% Core (Prefix Mode) |\n`;
md += `| **4. CEFR Levels (A1, A2, B1, B2)** | ${clusters['4. Levels (A1, A2, B1, B2)'].length} | Level-specific Preparation | 🔥 100% Core (A1-B2 Tabs) |\n`;
md += `| **5. App, Quizzes & Practice Tools** | ${clusters['5. App, Quizzes & Practice Tools (Transactional/High Intent)'].length} | Searching for Mobile Apps & Tests | 🎯 High Conversion |\n`;
md += `| **6. General German Grammar** | ${clusters['6. General German Grammar & Learning'].length} | Broad Language Learning | 💡 Category Discovery |\n`;
md += `| **Total** | **${cleaned.length}** | | |\n\n`;

md += `---\n\n`;

for (const [clusterName, items] of Object.entries(clusters)) {
  md += `### ${clusterName} (${items.length} keywords)\n\n`;
  md += `| Keyword | Words | Competition |\n`;
  md += `| :--- | :--- | :--- |\n`;
  for (const item of items.slice(0, 50)) {
    md += `| \`${item.keyword}\` | ${item.wordCount} | ${item.competition} |\n`;
  }
  if (items.length > 50) {
    md += `| *(and ${items.length - 50} more keywords in database...)* | | |\n`;
  }
  md += `\n---\n\n`;
}

fs.writeFileSync('vault/semantic_core/keywords_en.md', md, 'utf8');
fs.writeFileSync('vault/semantic_core/keywords_en_cleaned.json', JSON.stringify(cleaned, null, 2), 'utf8');
console.log(`✅ Saved refined semantic core with ${cleaned.length} keywords to vault/semantic_core/keywords_en.md`);
