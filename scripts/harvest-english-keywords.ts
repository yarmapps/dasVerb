import fs from 'fs';
import path from 'path';

async function fetchGoogleSuggestions(query: string): Promise<string[]> {
  const url = `http://suggestqueries.google.com/complete/search?client=chrome&hl=en&gl=us&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return [];
    const data: any = await res.json();
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return data[1] as string[];
    }
  } catch {
    // ignore
  }
  return [];
}

async function fetchPlayStoreSuggestions(query: string): Promise<string[]> {
  const url = `https://market.android.com/suggest/SuggRequest?json=1&c=3&hl=en&gl=US&query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Android) AppleWebKit/537.36'
      }
    });
    if (!res.ok) return [];
    const data: any = await res.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => item.s || item).filter(Boolean);
    }
  } catch {
    // ignore
  }
  return [];
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔍 Starting comprehensive English Keyword Harvesting via Google & Play Store Suggesters...\n');

  const baseSeeds = [
    // Core Verbs
    'german verbs',
    'german verb',
    'german verbs app',
    'german verb conjugation',
    'german verb forms',
    'german verb practice',
    'german verbs with prepositions',
    'german irregular verbs',
    'german separable verbs',
    'german modal verbs',
    'german reflexive verbs',
    'german verb tenses',
    'german verb list',
    
    // Learning & Practice
    'learn german verbs',
    'how to learn german verbs',
    'practice german verbs',
    'german verbs quiz',
    'german verbs flashcards',
    'german verbs a1',
    'german verbs a2',
    'german verbs b1',
    'german verbs b2',
    
    // Grammar & Cases
    'german grammar',
    'german grammar app',
    'german cases',
    'german dativ akkusativ',
    'german prepositions with verbs',
    'german sentence structure',
    'german satzklammer',
    
    // General App Intent
    'learn german app',
    'german learning app',
    'best app to learn german verbs',
    'best app for german grammar'
  ];

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const allSeeds: string[] = [...baseSeeds];

  // Add A-Z expansion for top seeds
  const topSeedsForExpansion = [
    'german verbs',
    'german verb',
    'learn german verbs',
    'german grammar',
    'german cases'
  ];

  for (const topSeed of topSeedsForExpansion) {
    for (const letter of alphabet) {
      allSeeds.push(`${topSeed} ${letter}`);
    }
  }

  console.log(`Generated ${allSeeds.length} seed queries (including A-Z expansion). Harvesting suggestions...\n`);

  const rawSuggestions = new Set<string>();

  let count = 0;
  for (const seed of allSeeds) {
    count++;
    const [googleSuggs, playSuggs] = await Promise.all([
      fetchGoogleSuggestions(seed),
      fetchPlayStoreSuggestions(seed)
    ]);

    for (const s of [...googleSuggs, ...playSuggs]) {
      const cleaned = s.toLowerCase().trim();
      if (cleaned.length > 2) {
        rawSuggestions.add(cleaned);
      }
    }

    if (count % 20 === 0 || count === allSeeds.length) {
      console.log(`  - Processed ${count}/${allSeeds.length} seeds (found ${rawSuggestions.size} unique keywords so far)...`);
    }

    await delay(120); // polite rate limiting
  }

  console.log(`\n✅ Harvesting complete! Total unique keywords gathered: ${rawSuggestions.size}\n`);

  // Filter for relevance to German learning / verbs / grammar / cases
  const relevantKeywords = Array.from(rawSuggestions).filter(kw => {
    const isGermanRelated = kw.includes('german') || kw.includes('deutsch') || kw.includes('verb') || kw.includes('grammar') || kw.includes('akkusativ') || kw.includes('dativ');
    return isGermanRelated;
  });

  console.log(`Filtered ${relevantKeywords.length} highly relevant German learning keywords.\n`);

  // Categorize by competition and intent
  interface KeywordItem {
    keyword: string;
    wordCount: number;
    competition: 'High' | 'Medium' | 'Low';
    category: 'Verbs & Conjugation' | 'Grammar & Cases' | 'App & Practice' | 'Levels (A1-B2)' | 'General Learning';
    intent: 'Transactional/App' | 'Educational/Informational' | 'Practice/Quiz';
  }

  const categorized: KeywordItem[] = relevantKeywords.map(kw => {
    const words = kw.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    let competition: 'High' | 'Medium' | 'Low' = 'Medium';
    if (wordCount <= 2) {
      competition = 'High';
    } else if (wordCount >= 5) {
      competition = 'Low';
    } else {
      competition = 'Medium';
    }

    // Category
    let category: KeywordItem['category'] = 'General Learning';
    if (kw.includes('a1') || kw.includes('a2') || kw.includes('b1') || kw.includes('b2') || kw.includes('b1/b2')) {
      category = 'Levels (A1-B2)';
    } else if (kw.includes('app') || kw.includes('quiz') || kw.includes('game') || kw.includes('practice') || kw.includes('flashcard') || kw.includes('test') || kw.includes('trainer')) {
      category = 'App & Practice';
    } else if (kw.includes('dativ') || kw.includes('akkusativ') || kw.includes('case') || kw.includes('preposition') || kw.includes('grammar') || kw.includes('sentence')) {
      category = 'Grammar & Cases';
    } else if (kw.includes('verb') || kw.includes('conjugat') || kw.includes('tenses') || kw.includes('irregular') || kw.includes('separable') || kw.includes('modal') || kw.includes('reflexive') || kw.includes('präsens') || kw.includes('perfekt')) {
      category = 'Verbs & Conjugation';
    }

    // Intent
    let intent: KeywordItem['intent'] = 'Educational/Informational';
    if (kw.includes('app') || kw.includes('download') || kw.includes('best') || kw.includes('ios') || kw.includes('android') || kw.includes('software')) {
      intent = 'Transactional/App';
    } else if (kw.includes('quiz') || kw.includes('practice') || kw.includes('test') || kw.includes('exercise') || kw.includes('game') || kw.includes('trainer')) {
      intent = 'Practice/Quiz';
    }

    return {
      keyword: kw,
      wordCount,
      competition,
      category,
      intent
    };
  });

  // Sort by category then word count
  categorized.sort((a, b) => a.wordCount - b.wordCount || a.keyword.localeCompare(b.keyword));

  const highComp = categorized.filter(k => k.competition === 'High');
  const medComp = categorized.filter(k => k.competition === 'Medium');
  const lowComp = categorized.filter(k => k.competition === 'Low');

  console.log(`Breakdown by Competition:`);
  console.log(` - High Competition (1-2 words): ${highComp.length}`);
  console.log(` - Medium Competition (3-4 words): ${medComp.length}`);
  console.log(` - Low Competition / Long-tail (5+ words): ${lowComp.length}\n`);

  // Ensure vault directory exists
  const vaultDir = path.resolve(process.cwd(), 'vault/semantic_core');
  fs.mkdirSync(vaultDir, { recursive: true });

  // Generate Markdown report
  let md = `# Semantic Core (English): German Verbs, Grammar & App Search Queries\n\n`;
  md += `Harvested via Google Search & Google Play Store Suggesters (with A-Z expansion).\n`;
  md += `Total Harvested Keywords: **${categorized.length}**\n\n`;

  md += `## 📊 Executive Summary\n\n`;
  md += `| Category | High Competition (1-2 words) | Medium Competition (3-4 words) | Low / Long-Tail (5+ words) | Total |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  md += `| **Verbs & Conjugation** | ${highComp.filter(k => k.category === 'Verbs & Conjugation').length} | ${medComp.filter(k => k.category === 'Verbs & Conjugation').length} | ${lowComp.filter(k => k.category === 'Verbs & Conjugation').length} | **${categorized.filter(k => k.category === 'Verbs & Conjugation').length}** |\n`;
  md += `| **Grammar & Cases (Dativ/Akkusativ)** | ${highComp.filter(k => k.category === 'Grammar & Cases').length} | ${medComp.filter(k => k.category === 'Grammar & Cases').length} | ${lowComp.filter(k => k.category === 'Grammar & Cases').length} | **${categorized.filter(k => k.category === 'Grammar & Cases').length}** |\n`;
  md += `| **App, Quizzes & Practice** | ${highComp.filter(k => k.category === 'App & Practice').length} | ${medComp.filter(k => k.category === 'App & Practice').length} | ${lowComp.filter(k => k.category === 'App & Practice').length} | **${categorized.filter(k => k.category === 'App & Practice').length}** |\n`;
  md += `| **CEFR Levels (A1, A2, B1, B2)** | ${highComp.filter(k => k.category === 'Levels (A1-B2)').length} | ${medComp.filter(k => k.category === 'Levels (A1-B2)').length} | ${lowComp.filter(k => k.category === 'Levels (A1-B2)').length} | **${categorized.filter(k => k.category === 'Levels (A1-B2)').length}** |\n`;
  md += `| **General Learning** | ${highComp.filter(k => k.category === 'General Learning').length} | ${medComp.filter(k => k.category === 'General Learning').length} | ${lowComp.filter(k => k.category === 'General Learning').length} | **${categorized.filter(k => k.category === 'General Learning').length}** |\n`;
  md += `| **Total** | **${highComp.length}** | **${medComp.length}** | **${lowComp.length}** | **${categorized.length}** |\n\n`;

  md += `--- \n\n`;

  md += `## 🔴 High Competition Root Keywords (1-2 Words)\n\n`;
  md += `Top broad keywords used by users. Highest search volume, maximum competition.\n\n`;
  md += `| Keyword | Category | Intent |\n`;
  md += `| :--- | :--- | :--- |\n`;
  for (const k of highComp) {
    md += `| \`${k.keyword}\` | ${k.category} | ${k.intent} |\n`;
  }

  md += `\n---\n\n`;
  md += `## 🟡 Medium Competition Core Keywords (3-4 Words)\n\n`;
  md += `Target high-intent keywords for App Store Title, Subtitle, Promoted In-App Purchases and ASA Exact Match.\n\n`;
  md += `| Keyword | Category | Intent |\n`;
  md += `| :--- | :--- | :--- |\n`;
  for (const k of medComp) {
    md += `| \`${k.keyword}\` | ${k.category} | ${k.intent} |\n`;
  }

  md += `\n---\n\n`;
  md += `## 🟢 Low Competition Long-Tail Keywords (5+ Words)\n\n`;
  md += `Highly targeted queries for Search Ads Mining, App Descriptions, and niche landing pages.\n\n`;
  md += `| Keyword | Category | Intent |\n`;
  md += `| :--- | :--- | :--- |\n`;
  for (const k of lowComp) {
    md += `| \`${k.keyword}\` | ${k.category} | ${k.intent} |\n`;
  }

  const outPath = path.resolve(vaultDir, 'keywords_en.md');
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`💾 Saved complete Semantic Core to: ${outPath}`);

  // Also save JSON dump
  fs.writeFileSync(path.resolve(vaultDir, 'keywords_en.json'), JSON.stringify(categorized, null, 2), 'utf8');
  console.log(`💾 Saved JSON dataset to: ${path.resolve(vaultDir, 'keywords_en.json')}`);
}

main().catch(console.error);
