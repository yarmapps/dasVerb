import * as fs from 'fs';
import * as path from 'path';

const translationsDir = path.resolve(__dirname, '../src/translations');

const translations: Record<string, string> = {
  ru: 'Правильный ответ:',
  en: 'Correct answer:',
  es: 'Respuesta correcta:',
  fr: 'Bonne réponse :',
  it: 'Risposta corretta:',
  pl: 'Prawidłowa odpowiedź:',
  pt: 'Resposta correta:',
  tr: 'Doğru cevap:',
  uk: 'Правильна відповідь:',
  ar: 'الإجابة الصحيحة:',
  fa: 'پاسخ صحیح:',
};

for (const [lang, val] of Object.entries(translations)) {
  const filePath = path.join(translationsDir, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    continue;
  }
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!content.verbQuizScreen) {
    content.verbQuizScreen = {};
  }
  content.verbQuizScreen.correctAnswer = val;
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${lang}.json`);
}
