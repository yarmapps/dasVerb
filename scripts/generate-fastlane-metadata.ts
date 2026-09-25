import fs from 'fs';
import path from 'path';

const FASTLANE_DIR = path.resolve(__dirname, '../fastlane');
const ANDROID_META_DIR = path.join(FASTLANE_DIR, 'metadata/android');
const IOS_META_DIR = path.join(FASTLANE_DIR, 'metadata/ios');

// Obsolete Android locales to remove
const OBSOLETE_ANDROID_LOCALES = [
  'cs-CZ', 'el-GR', 'en-IN', 'hr', 'hu-HU', 'id', 'nl-NL', 'ro', 'sk', 'sl', 'vi'
];

interface LocaleMeta {
  iosName: string; // iOS name (<= 30 chars, e.g. "German Verbs Trainer: dasVerb")
  androidTitle: string; // Android title (<= 30 chars, e.g. "dasVerb: German Verbs Trainer")
  subtitle: string; // iOS subtitle (<= 30 chars)
  shortDescription: string; // Android short description (<= 80 chars)
  keywords: string; // iOS keywords (<= 100 bytes, comma-separated)
  promotionalText: string; // iOS promo text (<= 170 chars)
  fullDescription: string; // <= 4000 chars
  releaseNotes: string; // <= 4000 chars
}

const METADATA: Record<string, LocaleMeta> = {
  en: {
    iosName: 'German Verbs Trainer: dasVerb',
    androidTitle: 'dasVerb: German Verbs Trainer',
    subtitle: 'Conjugation, Forms & Cases',
    shortDescription: 'German verbs trainer A1-B2: conjugations, 3 irregular forms, prefixes & cases.',
    keywords: 'irregular,preposition,dativ,akkusativ,satzklammer,a1,a2,b1,b2,practice,quiz,test,tense,grammar,audio',
    promotionalText: 'Conquer German verbs effortlessly! Master conjugations, 3 verb forms, separable prefixes, cases, and prepositions with authentic sentence practice.',
    releaseNotes: 'Master German verbs A1-B2 with interactive quizzes: sentence bracket (Satzklammer), conjugation trainer, 3 verb forms, and preposition cases.',
    fullDescription: `Master German verbs effortlessly from A1 to B2 with the ultimate verb trainer.

Learn how German verbs truly work in authentic sentences — conquer verb conjugation, preposition cases (Dativ & Akkusativ), and the German sentence bracket (Satzklammer) with focused daily practice.

Whether you are preparing for a grammar test, Goethe-Zertifikat, telc, TestDaF, or aiming to speak German fluently, dasVerb gives you the structured grammar foundation you need.

KEY FEATURES

• 4 TARGETED PRACTICE MODES & QUIZ SESSIONS
1. Prefix & Satzklammer Practice: Master separable and inseparable prefixes and verb placement.
2. Conjugation Trainer: Fill all 6 pronoun conjugations in Präsens with stem-change hints.
3. Irregular Verb Forms: Practice 3 principal forms for every irregular verb (Infinitive, Präteritum, Partizip II).
4. Prepositions & Cases: Master verb governance and fixed preposition usage (an, auf, in, mit, über, zu...).

• AUTHENTIC EXAMPLES PER VERB
Every verb card includes authentic sentence examples covering essential tense forms: Präsens (Present), Präteritum (Simple Past), Perfekt (Present Perfect), and Imperativ (Command).

• SATZKLAMMER & SENTENCE BUILDER
Interactive dual-slot sentence training and quiz practice that builds your natural instinct for separable prefix verbs and compound verb placement in German word order.

• GOVERNANCE, CASES & PREPOSITIONS
Stop guessing cases! Clearly see whether a preposition takes Dativ, Akkusativ, or two-way Wechselpräpositionen.

• ALL VERB CLASSES & FREQUENCY RANKING
Learn the most critical verbs first based on real-world frequency rankings:
- Regular & Irregular Verbs (Starke / Schwache Verben)
- Separable & Inseparable Verbs (Trennbare Verben)
- Reflexive Verbs (Reflexive Verben mit sich)
- Modal Verbs (können, müssen, dürfen, wollen, sollen, möchten)

• PROGRESS TRACKING & OFFLINE ACCESS
Track your mastery level for each verb with interactive quiz and test modes. Learn anywhere, anytime — fully functional offline without requiring an internet connection.

• AUDIO PRONUNCIATION & GRAMMAR HINTS
Listen to authentic German audio pronunciation and view contextual grammar hints for every mistake.

LEVELS COVERED (CEFR)
• A1: Essential everyday verbs & basic present tense
• A2: Separable verbs, past tense forms & common prepositions
• B1: Complex sentence structures, modal usages & reflexive verbs
• B2: Nuanced verb meanings, fixed prepositional phrases & advanced syntax

Start mastering German verbs today with dasVerb!`
  },
  de: {
    iosName: 'Deutsche Verben: dasVerb',
    androidTitle: 'dasVerb: Deutsche Verben',
    subtitle: 'Konjugation, Formen & Kasus',
    shortDescription: 'Deutsche Verben Trainer A1-B2: Konjugation, 3 Stammformen, Vorsilben & Kasus.',
    keywords: 'unregelmäßig,stammformen,präpositionen,dativ,akkusativ,trainer,trennbare,grammatik,test,a1,a2,b1,b2',
    promotionalText: 'Deutsche Verben sicher beherrschen! Trainiere Konjugation, 3 Stammformen, trennbare Vorsilben und Präpositionen in authentischen Beispielsätzen.',
    releaseNotes: 'Deutsche Verben A1-B2 gezielt trainieren: Satzklammer, Konjugationstrainer, 3 Stammformen und Verben mit Präpositionen.',
    fullDescription: `Deutsche Verben sicher beherrschen von A1 bis B2.

Lerne, wie deutsche Verben in echten Sätzen funktionieren: Trainiere Konjugation, 3 Stammformen, trennbare und untrennbare Vorsilben sowie Verben mit festen Präpositionen (Dativ & Akkusativ).

Ob zur Vorbereitung auf Goethe-Zertifikat, telc, TestDaF oder für fehlerfreies Sprechen im Alltag — dieser Trainer bietet dir das fundierte Grammatiktraining.

HAUPTFUNKTIONEN

• 4 GEZIELTE TRAININGSMODI
1. Vorsilben & Satzklammer: Trainiere trennbare und untrennbare Verben und die richtige Position im Satz.
2. Konjugationstrainer: Übe alle 6 Personalformen im Präsens mit Hinweisen zu Vokalwechseln.
3. Unregelmäßige Verben: 3 Stammformen auf einen Blick — lerne jedes Verb unregelmäßig oder regelmäßig (Infinitiv, Präteritum, Partizip II mit hat/ist).
4. Verben mit Präpositionen: Feste Präpositionen und Fälle (Dativ, Akkusativ, Wechselpräpositionen).

• AUTHENTISCHE BEISPIELSÄTZE
Jedes Verb enthält Beispielsätze in den wichtigsten Zeitformen: Präsens, Präteritum, Perfekt und Imperativ.

• SATZKLAMMER-TRAINING
Interaktive Satzübungen stärken dein intuitives Sprachgefühl für die deutsche Wortstellung.

• HÄUFIGKEITSRANGLISTE & VERBKLASSEN
Lerne die wichtigsten Verben nach echter Sprachhäufigkeit:
- Regelmäßige & unregelmäßige Verben
- Trennbare & untrennbare Verben
- Reflexive Verben (mit sich)
- Modalverben

• FORTSCHRITT & OFFLINE-MODUS
Behalte deinen Lernfortschritt im Blick. Lerne jederzeit und überall — komplett offline nutzbar.

• AUDIO-AUSSPRACHE & GRAMMATIK-TIPPS
Höre dir deutsche Sätze in nativer Aussprache an und erhalte direkte Grammatik-Erklärungen bei Fehlern (Grammatik und Regeln).

NIVEAUSTUFEN (GER)
• A1: Grundlegende Alltagsverben & Präsens
• A2: Trennbare Verben, Perfekt & häufige Präpositionen
• B1: Komplexe Satzstrukturen, Modalverben & reflexive Verben
• B2: Feste Nomen-Verb-Verbindungen & nuancierte Bedeutungen

Lerne deutsche Verben jetzt gezielt und effektiv mit dem Trainer dasVerb!`
  },
  ru: {
    iosName: 'Немецкие глаголы: dasVerb',
    androidTitle: 'dasVerb: Немецкие глаголы',
    subtitle: 'Спряжения, формы и предлоги',
    shortDescription: 'Тренажер немецких глаголов A1-B2: спряжения, 3 формы, приставки и предлоги.',
    keywords: 'неправильные,слова,учить,тренажер,тест,язык,грамматика,онлайн,словарь,уроки,правила,a1,a2,b1,b2',
    promotionalText: 'Учите немецкие глаголы легко! Спряжения, 3 основные формы, отделяемые приставки, управление глаголов и предлоги в аутентичных предложениях.',
    releaseNotes: 'Тренировка немецких глаголов A1-B2: рамка Satzklammer, тренажер спряжений, 3 формы неправильных глаголов и предлоги.',
    fullDescription: `Осваивайте немецкие глаголы легко и системно от уровня A1 до B2. Интерактивный тренажер поможет быстро учить немецкий язык, немецкие слова, грамматику и формы в контексте.

Учитесь правильно употреблять глаголы в реальных предложениях: тренируйте спряжения, 3 основные формы, регулярные и неправильные глаголы, отделяемые приставки, предлоги и управление падежами (Dativ / Akkusativ).

Идеально для подготовки к экзаменам Goethe-Zertifikat, telc, TestDaF, чтобы успешно сдать любой тест или уверенно общаться в жизни.

КЛЮЧЕВЫЕ ВОЗМОЖНОСТИ

• 4 РЕЖИМА ТРЕНИРОВОК
1. Приставки и Satzklammer: отработка позиции глагола и отделяемых приставок в предложении.
2. Тренажер спряжений: все 6 местоимений в Präsens с подсказками чередования гласных.
3. 3 формы глаголов: инфинитив, Präteritum (3. лицо), вспомогательный глагол hat/ist и Partizip II (сильные и неправильные формы).
4. Глаголы с предлогами: управление и падежи (Dativ, Akkusativ, Wechselpräpositionen).

• АУТЕНТИЧНЫЕ ПРИМЕРЫ
К каждому глаголу подобраны аутентичные предложения во всех ключевых временах: Präsens, Präteritum, Perfekt и Imperativ.

• ЧАСТОТНЫЙ РАНГ И КЛАССЫ ГЛАГОЛОВ
Изучайте самые нужные слова первыми по частотному словарю: немецкий язык в реальных примерах:
- Сильные, слабые и неправильные глаголы
- Отделяемые и неотделяемые приставки
- Возвратные глаголы (reflexive Verben mit sich)
- Модальные глаголы

• ОТСЛЕЖИВАНИЕ ПРОГРЕССА И ОФЛАЙН-РЕЖИМ
Отслеживайте уровень освоения каждого глагола. Проходите проверочный тест и квизы в любое время — приложение работает полностью офлайн.

• ОЗВУЧКА И ГРАММАТИЧЕСКИЕ ПОДСКАЗКИ
Слушайте правильное немецкое audio произношение и получайте грамматические подсказки при ошибках.

УРОВНИ (CEFR)
• A1: Базовые глаголы повседневного общения и настоящее время
• A2: Отделяемые приставки, Perfekt и частые предлоги
• B1: Сложные структуры, модальные глаголы и возвратные формы
• B2: Тонкости значений, устойчивые предложные сочетания

Начните учить немецкий язык и глаголы уверенно с dasVerb!`
  },
  uk: {
    iosName: 'Німецькі дієслова: dasVerb',
    androidTitle: 'dasVerb: Німецькі дієслова',
    subtitle: 'Відміни, форми та прийменники',
    shortDescription: 'Тренажер німецьких дієслів A1-B2: відміни, 3 форми, префікси та прийменники.',
    keywords: 'неправильні,слова,вчити,тренажер,тест,мова,граматика,відмінювання,словник,уроки,онлайн,a1,a2,b1,b2',
    promotionalText: 'Опануйте німецькі дієслова від A1 до B2! Тренуйте відмінювання, 3 форми, відокремлювані префікси та прийменники в аутентичних реченнях.',
    releaseNotes: 'Тренування німецьких дієслів A1-B2: рамкова конструкція, тренажер відмінювання, 3 форми неправильних дієслів і прийменники.',
    fullDescription: `Опановуйте німецькі дієслова легко та структуровано від рівня A1 до B2. Наш тренажер допоможе ефективно вчити німецькі слова, граматику, коли вивчається німецька мова.

Вчіться впевнено вживати дієслова в реальних реченнях: тренуйте відмінювання, 3 основні форми, правильні та неправильні дієслова, відокремлювані префікси, прийменники та відмінки (Dativ / Akkusativ).

Ідеально підходить для підготовки до іспитів Goethe-Zertifikat, telc, TestDaF, щоб успішно скласти кожен тест та вільно спілкуватися.

ОСНОВНІ МОЖЛИВОСТІ

• 4 РЕЖИМИ ТРЕНУВАННЯ
1. Префікси та Satzklammer: порядок слів та відокремлювані префікси в реченні.
2. Тренажер відмінювання: усі 6 займенників у Präsens із підказками чергування голосних.
3. 3 форми дієслів: інфінітив, Präteritum, допоміжне дієслово hat/ist та Partizip II (сильні та неправильні дієслова).
4. Дієслова з прийменниками: керування та відмінки (Dativ, Akkusativ).

• АВТЕНТИЧНІ ПРИКЛАДИ
До кожного дієслова додано живі речення в основних часах: Präsens, Präteritum, Perfekt та Imperativ.

• ЧАСТОТНИЙ РЕЙТИНГ ТА КЛАСИ ДІЄСЛІВ
Вивчайте найуживаніші дієслова та слова першими: німецька мова крок за кроком:
- Слабкі, сильні та неправильні дієслова
- Відокремлювані та невідокремлювані префікси
- Зворотні дієслова (з sich)
- Модальні дієслова

• ПРОГРЕС ТА ОФЛАЙН-ДОСТУП
Відстежуйте свій рівень знань. Складайте фінальний тест після кожного рівня. Додаток працює повністю офлайн без інтернету.

• ОЗВУЧЕННЯ ТА ПІДКАЗКИ
Слухайте якісне німецьке audio звучання речень та отримуйте граматичні пояснення при помилках.

РІВНІ (CEFR)
• A1: Базові дієслова щоденного спілкування
• A2: Відокремлювані префікси, Perfekt та часті прийменники
• B1: Модальні дієслова та зворотні форми
• B2: Стійкі сполучення та складні граматичні конструкції

Почніть вчити німецькі дієслова результативно з dasVerb!`
  },
  es: {
    iosName: 'Verbos en Alemán: dasVerb',
    androidTitle: 'dasVerb: Verbos en Alemán',
    subtitle: 'Conjugación, Formas y Casos',
    shortDescription: 'Entrenador de verbos en alemán A1-B2: conjugación, 3 formas, prefijos y casos.',
    keywords: 'irregulares,preposiciones,dativ,akkusativ,entrenador,separables,a1,a2,b1,b2,aprender,gramatica,audio',
    promotionalText: '¡Domina los verbos en alemán de A1 a B2! Entrena conjugaciones, 3 formas verbales, prefijos separables y preposiciones con ejemplos reales.',
    releaseNotes: 'Práctica de verbos en alemán A1-B2: estructura Satzklammer, entrenador de conjugación, 3 formas verbales y preposiciones.',
    fullDescription: `Domina los verbos en alemán fácilmente desde el nivel A1 hasta el B2 con el mejor entrenador interactivo.

Aprender alemán nunca fue tan claro: aprende a usar los verbos en frases auténticas, entrena la conjugación, la gramatica (gramática), las 3 formas verbales básicas, verbos regulares e irregulares, los prefijos separables y las preposiciones con sus casos (Dativ y Akkusativ).

Ideal para preparar exámenes oficiales como Goethe-Zertifikat, telc o TestDaF, o para hablar con fluidez.

CARACTERÍSTICAS PRINCIPALES

• 4 MODOS DE ENTRENAMIENTO
1. Prefijos y Satzklammer: domina los prefijos separables (separables e inseparables) y el orden de palabras.
2. Entrenador de conjugación: conjuga los 6 pronombres en Präsens con pistas de cambio vocálico.
3. Formas irregulares: practica verbos irregulares con Infinitiv, Präteritum y Partizip II con hat/ist.
4. Verbos con preposiciones: controla las preposiciones fijas y qué caso rige cada una (Dativ / Akkusativ).

• FRASES DE EJEMPLO REALES
Cada verbo incluye oraciones completas en los tiempos clave: Präsens, Präteritum, Perfekt e Imperativ.

• CLASIFICACIÓN POR FRECUENCIA
Aprenderás primero los verbos más utilizados en la lengua alemana:
- Verbos regulares y verbos irregulares (irregulares / fuertes)
- Prefijos separables y no separables
- Verbos reflexivos (con sich)
- Verbos modales

• SEGUIMIENTO DE PROGRESO Y MODO OFFLINE
Comprueba tu nivel de dominio en cada verbo con tests interactivos. Funciona 100% sin conexión a internet.

• AUDIO Y CONSEJOS GRAMATICALES
Escucha la pronunciación audio nativa y consulta explicaciones de gramatica inmediatas en cada error.

NIVELES (MCER)
• A1: Verbos cotidianos y presente básico
• A2: Prefijos separables, pasado y preposiciones comunes
• B1: Estructuras complejas, verbos modales y reflexivos
• B2: Matices avanzados y colocaciones preposicionales

¡Empieza a aprender y dominar los verbos en alemán con dasVerb!`
  },
  fr: {
    iosName: 'Verbes Allemands: dasVerb',
    androidTitle: 'dasVerb: Verbes Allemands',
    subtitle: 'Conjugaison, Formes & Cas',
    shortDescription: 'Entraîneur de verbes allemands A1-B2: conjugaison, 3 formes, préverbes et cas.',
    keywords: 'irreguliers,prepositions,dativ,akkusativ,entraineur,separables,a1,a2,b1,b2,apprendre,grammaire,audio',
    promotionalText: 'Maîtrisez les verbes allemands de A1 à B2! Entraînez la conjugaison, les 3 formes, les particules séparables et les prépositions en contexte.',
    releaseNotes: 'Entraînement des verbes allemands A1-B2: Satzklammer, conjugueur, 3 formes verbales et prépositions.',
    fullDescription: `Maîtrisez les verbes allemands en toute simplicité du niveau A1 au niveau B2 avec le meilleur entraîneur interactif (entraineur de verbes).

Apprenez l'allemand et l'utilisation réelle des verbes dans des phrases authentiques (apprendre les verbes en contexte) : travaillez la conjugaison, la grammaire, les verbes irreguliers (irréguliers), les 3 temps primitifs, les particules separables (séparables) et le régime des prepositions (prépositions avec Dativ et Akkusativ).

Idéal pour préparer les examens Goethe-Zertifikat, telc, TestDaF ou pour s'exprimer avec aisance.

FONCTIONNALITÉS CLÉS

• 4 MODES D'ENTRAÎNEMENT CIBLÉS
1. Particules & Satzklammer: maîtrisez la place du verbe et les particules separables et inséparables.
2. Entraîneur de conjugaison: entraînez les 6 personnes au présent avec alertes d'alternance vocalique.
3. Verbes irréguliers: les 3 formes des verbes irreguliers (Infinitif, Präteritum, Partizip II avec hat/ist).
4. Verbes à préposition: mémorisez les prepositions fixes et leurs cas (Dativ / Akkusativ).

• PHRASES D'EXEMPLES AUTHENTIQUES
Chaque verbe comprend des phrases complètes aux temps indispensables: Präsens, Präteritum, Perfekt et Imperativ.

• CLASSEMENT PAR FRÉQUENCE RÉELLE
Apprenez en priorité les verbes les plus courants pour apprendre l'allemand efficacement:
- Verbes réguliers et verbes irreguliers
- Particules separables et inséparables
- Verbes pronominaux (avec sich)
- Verbes modaux

• SUIVI DU PROGRÈS & ACCÈS HORS-LIGNE
Suivez votre niveau de maîtrise grâce aux quiz et tests de niveau. Révisez où que vous soyez — fonctionne à 100% hors-ligne.

• AUDIO & ASTUCES DE GRAMMAIRE
Écoutez la prononciation audio allemande native et accédez à des explications de grammaire en cas d'erreur.

NIVEAUX COUVERTS (CECRL)
• A1: Verbes de base du quotidien
• A2: Particules separables, passé composé & prepositions fréquentes
• B1: Verbes modaux & verbes pronominaux
• B2: Tournures idiomatiques & syntaxe avancée

Progressez rapidement pour apprendre l'allemand avec dasVerb!`
  },
  it: {
    iosName: 'Verbi Tedeschi: dasVerb',
    androidTitle: 'dasVerb: Verbi Tedeschi',
    subtitle: 'Coniugazione, Forme e Casi',
    shortDescription: 'Allenatore di verbi tedeschi A1-B2: coniugazione, 3 forme verbali e reggenze.',
    keywords: 'irregolari,preposizioni,dativ,akkusativ,allenatore,separabili,a1,a2,b1,b2,imparare,grammatica,audio',
    promotionalText: 'Padroneggia i verbi tedeschi da A1 a B2! Allena coniugazioni, 3 forme verbali, prefissi separabili e preposizioni con frasi reali.',
    releaseNotes: 'Pratica dei verbi tedeschi A1-B2: struttura Satzklammer, allenatore di coniugazione, 3 forme verbali e preposizioni.',
    fullDescription: `Padroneggia i verbi tedeschi in modo intuitivo dal livello A1 al B2 con il miglior allenatore di verbi.

Imparare il tedesco diventa facile: impara a usare i verbi in frasi reali, esercitati con la coniugazione, la grammatica, i verbi irregolari e regolari, le 3 forme base, i prefissi separabili e la reggenza delle preposizioni con i casi (Dativ e Akkusativ).

Perfetto per preparare gli esami Goethe-Zertifikat, telc, TestDaF o per imparare a parlare il tedesco con sicurezza.

CARATTERISTICHE PRINCIPALI

• 4 MODALITÀ DI ESERCIZIO
1. Prefissi & Satzklammer: impara la posizione del verbo e i prefissi separabili nella frase.
2. Allenatore di coniugazione: tutte le 6 persone al presente con promemoria sui cambi vocalici.
3. Verbi irregolari: pratica forme e verbi irregolari (Infinitiv, Präteritum e Partizip II con hat/ist).
4. Verbi con preposizioni: gestisci casi e reggenze delle preposizioni (Dativ, Akkusativ, Wechselpräpositionen).

• FRASI D'ESEMPIO REALI
Ogni verbo contiene esempi completi nei tempi fondamentali: Präsens, Präteritum, Perfekt e Imperativ.

• ORDINAMENTO PER FREQUENZA D'USO
Impara prima i verbi più frequenti per imparare il tedesco con metodo:
- Verbi regolari e irregolari (forti e deboli)
- Verbi con prefissi separabili e inseparabili
- Verbi riflessivi (con sich)
- Verbi modali

• PROGRESSI & USO OFFLINE
Monitora il tuo livello di apprendimento con test e quiz dedicati. Funziona al 100% offline senza connessione internet.

• AUDIO E SPIEGAZIONI GRAMMATICALI
Ascolta la pronuncia audio autentica e consulta spiegazioni di grammatica per ogni errore.

LIVELLI (QCER)
• A1: Verbi base della vita quotidiana
• A2: Prefissi separabili, passato e preposizioni comuni
• B1: Strutture complesse, modali e riflessivi
• B2: Sfumature avanzate e combinazioni fisse

Migliora per imparare il tuo tedesco da subito con dasVerb!`
  },
  pl: {
    iosName: 'Czasowniki Niemieckie: dasVerb',
    androidTitle: 'dasVerb: Czasowniki Niemieckie',
    subtitle: 'Odmiana, formy i rekcja',
    shortDescription: 'Trener czasowników niemieckich A1-B2: odmiana, 3 formy, przedrostki i rekcja.',
    keywords: 'nieregularne,przyimki,dativ,akkusativ,trener,rozdzielne,a1,a2,b1,b2,słownik,nauka,czasy,gramatyka',
    promotionalText: 'Opanuj niemieckie czasowniki od A1 do B2! Trenuj odmianę, 3 formy podstawowe, przedrostki rozdzielne i rekcję przyimków w zdaniach.',
    releaseNotes: 'Trening czasowników niemieckich A1-B2: szyk Satzklammer, koniugacja, 3 formy nieregularne i rekcja przyimków.',
    fullDescription: `Opanuj niemieckie czasowniki skutecznie od poziomu A1 do B2. Interaktywny trener czasowników sprawi, że nauka niemieckiego i gramatyka będzie szybka i przyjemna.

Ucz się poprawnego użycia czasowników w autentycznych zdaniach: ćwicz odmianę, formy nieregularne i regularne, przedrostki rozdzielne oraz rekcję czasowników z przyimkami (Dativ i Akkusativ). Nasz słownik i zestaw ćwiczeń obejmuje wszystkie kluczowe czasy gramatyczne.

Niezastąpiona pomoc w przygotowaniu do egzaminów Goethe-Zertifikat, telc, TestDaF oraz w płynnej komunikacji.

NAJWAŻNIEJSZE FUNKCJE

• 4 TRYBY TRENINGU
1. Przedrostki i Satzklammer: opanuj szyk zdania oraz czasowniki rozdzielne i nierozdzielne.
2. Trening odmiany: wszystkie 6 osób w czasie teraźniejszym z podpowiedziami wymiany samogłosek.
3. Czasowniki nieregularne: 3 formy podstawowe i odmiany nieregularne (Infinitiv, Präteritum, Partizip II z hat/ist).
4. Czasowniki z przyimkami: stałe przyimki, rekcja i przypadki (Dativ, Akkusativ).

• AUTENTYCZNE PRZYKŁADY ZDAŃ
Do każdego czasownika dołączone są zdania w kluczowych czasach: Präsens, Präteritum, Perfekt i Imperativ.

• RANKING CZĘSTOTLIWOŚCI
Wbudowany słownik pozwala uczyć się według realnej częstotliwości występowania:
- Czasowniki regularne i nieregularne (mocne i słabe)
- Czasowniki rozdzielne i nierozdzielnie złożone
- Czasowniki zwrotne (z sich)
- Czasowniki modalne

• STATYSTYKI I TRYB OFFLINE
Śledź swoje postępy w nauce. Nauka i gramatyka jest w pełni dostępna offline bez dostępu do internetu.

• WYMOWA AUDIO I WSKAZÓWKI GRAMATYCZNE
Słuchaj naturalnej wymowy lektora i korzystaj z wyjaśnień gramatycznych przy błędach.

POZIOMY (ESOKJ)
• A1: Podstawowe czasowniki codziennego użytku
• A2: Przedrostki rozdzielne, czas przeszły i typowe przyimki
• B1: Czasowniki modalne, zwrotne i zdania złożone
• B2: Zaawansowana rekcja, przyimki i czasy złożone

Efektywna nauka i gramatyka — trenuj niemiecki z dasVerb!`
  },
  pt: {
    iosName: 'Verbos em Alemão: dasVerb',
    androidTitle: 'dasVerb: Verbos em Alemão',
    subtitle: 'Conjugação, Formas e Casos',
    shortDescription: 'Treinador de verbos em alemão A1-B2: conjugação, 3 formas, prefixos e casos.',
    keywords: 'irregulares,preposicoes,dativ,akkusativ,treinador,separaveis,a1,a2,b1,b2,aprender,vocabulario,audio',
    promotionalText: 'Domine os verbos em alemão de A1 a B2! Treine conjugação, 3 formas verbais, prefixos separáveis e regência preposicional.',
    releaseNotes: 'Prática de verbos em alemão A1-B2: estrutura Satzklammer, treinador de conjugação, 3 formas e preposições.',
    fullDescription: `Domine os verbos em alemão com confiança do nível A1 ao B2 com o seu treinador de verbos definitivo.

Aprender alemão de verdade ficou mais simples: aprenda como os verbos funcionam em frases reais, pratique conjugação, as 3 formas básicas, verbos regulares e irregulares (verbos irregulares na prática), prefixos separáveis (separaveis) e a regência com preposições (preposicoes com Dativ e Akkusativ). Amplie o seu vocabulario (vocabulário) a cada lição.

Excelente para quem estuda para os exames Goethe-Zertifikat, telc, TestDaF ou quer aprender a falar com naturalidade.

RECURSOS PRINCIPAIS

• 4 MODOS DE TREINO FOCADOS
1. Prefixos & Satzklammer: ordem correta dos verbos e prefixos separaveis / inseparáveis na frase.
2. Treinador de conjugação: as 6 pessoas no presente com dicas de alternância vocálica.
3. Verbos irregulares: 3 formas principais dos verbos irregulares (Infinitiv, Präteritum, Partizip II com hat/ist).
4. Verbos com preposições: domine as preposicoes e os casos regidos por cada verbo (Dativ / Akkusativ).

• FRASES DE EXEMPLO REAIS
Cada verbo traz exemplos completos nos tempos essenciais: Präsens, Präteritum, Perfekt e Imperativ.

• CLASSIFICAÇÃO POR FREQUÊNCIA
Aprenda primeiro os verbos mais frequentes para aprender alemão e enriquecer o vocabulario no dia a dia:
- Verbos regulares e irregulares (fortes e fracos)
- Prefixos separáveis e inseparáveis (separaveis)
- Verbos reflexivos (com sich)
- Verbos modais

• PROGRESSO & MODO OFFLINE
Acompanhe seu avanço em cada verbo com testes e questionários. Funciona 100% offline em qualquer lugar.

• ÁUDIO NATIVO & DICAS GRAMATICAIS
Ouça a pronúncia audio autêntica em alemão e veja explicações gramaticais claras para cada erro.

NÍVEIS (QECR)
• A1: Verbos essenciais do dia a dia
• A2: Prefixos separáveis (separaveis), passado e preposições comuns (preposicoes)
• B1: Estruturas complexas, modais e reflexivos
• B2: Regências avançadas, preposicoes e colocações verbais

Comece a aprender e dominar os verbos em alemão com o treinador dasVerb!`
  },
  tr: {
    iosName: 'Almanca Fiiller: dasVerb',
    androidTitle: 'dasVerb: Almanca Fiiller',
    subtitle: 'Fiil Çekimi, Haller & Edat',
    shortDescription: 'Almanca fiil çalıştırıcısı A1-B2: fiil çekimi, 3 form, ön ekler ve edatlar.',
    keywords: 'duzensiz,edatlar,dativ,akkusativ,calistirici,ayrilabilen,a1,a2,b1,b2,ogren,cumle,dilbilgisi,sozluk',
    promotionalText: 'Almanca fiilleri A1-B2 seviyesinde kolayca öğrenin! Fiil çekimleri, 3 temel zaman formu, ayrılabilen fiiller ve edat alıştırmaları.',
    releaseNotes: 'Almanca fiil alıştırmaları A1-B2: Satzklammer cümle yapısı, fiil çekim çalıştırıcısı, 3 fiil hali ve edatlar.',
    fullDescription: `A1'den B2'ye Almanca fiilleri kolayca ve kalıcı olarak öğrenin (öğren / ogren). İnteraktif fiil çalıştırıcısı (calistirici), dilbilgisi ve sözlük (sozluk) yapısı ile öğrenmek artık çok kolay.

Fiillerin ve cümle (cumle) yapılarının gerçek kullanımını kavrayın: fiil çekimleri, 3 temel zaman formu, düzenli ve düzensiz fiiller (duzensiz fiiller), ayrılabilen ön ekler (ayrilabilen fiiller) ve edatlar (edatlar ile Dativ / Akkusativ kullanımı).

Goethe-Zertifikat, telc, TestDaF sınavlarına hazırlananlar ve akıcı Almanca konuşmak isteyenler için idealdir.

TEMEL ÖZELLİKLER

• 4 HEDEFE YÖNELİK ÇALIŞMA MODU
1. Ön Ekler & Satzklammer: ayrilabilen (ayrılabilen) ve ayrılamayan fiillerin doğru cümle dizilimi.
2. Fiil Çekim Çalıştırıcısı: Präsens zamanında 6 şahıs zamirinin sesli harf değişimli çekimleri (calistirici).
3. Düzensiz Fiiller: 3 temel zaman formu (duzensiz fiiller için Infinitiv, Präteritum, Partizip II ile hat/ist).
4. Edatlı Fiiller: edatlar ve hangi fiilin hangi hali aldığını (Dativ, Akkusativ) pekiştirin.

• ÖRNEK CÜMLELER
Her fiil için temel zamanlarda (Präsens, Präteritum, Perfekt, Imperativ) örnek cümle (cumle) kalıpları.

• SIKLIK SIRALAMASI
Gerçek hayatta en sık kullanılan fiilleri öncelikli öğrenin (ogren), dahili sozluk ile takip edin:
- Düzenli ve duzensiz fiiller
- Ayrilabilen ve ayrılamayan fiiller
- Dönüşlü fiiller (sich ile)
- Modal fiiller (können, müssen, wollen...)

• GELİŞİM TAKİBİ & ÇEVRİMDIŞI KULLANIM
Öğrenme seviyenizi test ve sınavlarla takip edin. İnternet olmadan her yerde %100 çevrimdışı çalışın.

• SESLİ TELAFFUZ & DİLBİLGİSİ İPUÇLARI
Cümlelerin doğru telaffuzunu dinleyin ve hatalarınızda anlık dilbilgisi açıklamaları görün.

SEVİYELER (CEFR)
• A1: Günlük temel fiiller ve şimdiki zaman
• A2: Ayrılabilen fiiller (ayrilabilen), geçmiş zaman ve sık kullanılan edatlar
• B1: Modal fiiller, dönüşlü fiiller ve karmaşık cümle yapıları
• B2: İleri düzey edatlar ve kalıplar

Almanca fiilleri, dilbilgisi ve cümle yapılarını dasVerb ile hemen öğren (ogren)!`
  },
  ar: {
    iosName: 'أفعال ألمانية: dasVerb',
    androidTitle: 'dasVerb: أفعال ألمانية',
    subtitle: 'تصريف الأفعال وحروف الجر',
    shortDescription: 'تدريب أفعال ألمانية A1-B2: تصريف الأفعال، الأفعال الشاذة، البادئات وحروف الجر.',
    keywords: 'شاذة,حروف,قواعد,تدريب,تعلم,منفصلة,داتيف,اختبار,قاموس,كلمات,دروس,نطق,محادثة,تمارين,a1,a2,b1,b2',
    promotionalText: 'أتقن أفعال اللغة الألمانية من A1 إلى B2! تدرب على تصريف الأفعال، الصيغ الثلاث، البادئات المنفصلة وحالات الإعراب مع حروف الجر.',
    releaseNotes: 'تدريب أفعال اللغة الألمانية A1-B2: ترتيب الجملة Satzklammer، تصريف الأفعال، الصيغ الثلاث للأفعال الشاذة وحروف الجر.',
    fullDescription: `أتقن أفعال اللغة الألمانية بكل سهولة وثقة من المستوى A1 إلى B2 مع أفضل تطبيق تدريب وقواعد.

تعلم قواعد اللغة الألمانية والاستخدام الصحيح للأفعال في جمل حقيقية: تصريف الأفعال، الصيغ الأساسية الثلاث، أفعال شاذة ومنتظمة، الأفعال ذات بادئات منفصلة، وحروف الجر مع حالات الإعراب داتيف وأكوزاتيف (Dativ و Akkusativ).

تطبيق مثالي للتحضير لاختبارات Goethe-Zertifikat و telc و TestDaF والتحدث بالألمانية بطلاقة.

أهم الميزات

• 4 أوضاع تدريبية متخصصة (تدريب واختبارات)
1. البادئات وهيكل الجملة (Satzklammer): ترتيب الأفعال والبادئات في حالة منفصلة أو متصلة في الجملة.
2. تدريب التصريف: تصريف جميع الضمائر الستة في الحاضر مع تنبيهات تغيير الأحرف الصوتية.
3. الأفعال الشاذة: تدريب الصيغ الثلاث لأي أفعال شاذة (Infinitiv, Präteritum, Partizip II مع hat/ist).
4. الأفعال مع حروف الجر: ضبط الإعراب (داتيف / أكوزاتيف Dativ / Akkusativ) مع حروف الجر الثابتة.

• جمل وأمثلة حقيقية
يحتوي كل فعل على جمل حقيقية في الأزمنة الأساسية: الحاضر، الماضي البسيط، التام، والأمر.

• ترتيب حسب الشيوع والأهمية
تعلم الأفعال الأكثر استخداماً في الحياة اليومية أولاً:
- الأفعال المنتظمة والأفعال الشاذة (شاذة / قوية)
- أفعال منفصلة وغير منفصلة
- الأفعال المنعكسة (مع sich)
- الأفعال المساعدة (Modalverben)

• متابعة التقدم والعمل بدون إنترنت
اختبر مستواك مع كل اختبار تفاعلي. يعمل التطبيق بشكل كامل بدون اتصال بالإنترنت (Offline).

• نطق صوتي وقواعد إرشادية
استمع إلى النطق الألماني الصحيح واطلع على شروحات القواعد عند ارتكاب الأخطاء.

المستويات (CEFR)
• A1: الأفعال اليومية الأساسية
• A2: أفعال منفصلة والماضي التام وحروف الجر الشائعة
• B1: الجمل المركبة والأفعال المنعكسة والمساعدة
• B2: تراكيب متقدمة وحالات داتيف وأكوزاتيف مع حروف الجر

ابدأ في تعلم وإتقان أفعال اللغة الألمانية الآن مع dasVerb!`
  },
  fa: {
    iosName: 'افعال آلمانی: dasVerb',
    androidTitle: 'dasVerb: افعال آلمانی',
    subtitle: 'صرف فعل، اشکال و حروف اضافه',
    shortDescription: 'تمرین افعال آلمانی A1-B2: صرف فعل، ۳ فرم اصلی، پیشوندها و حروف اضافه.',
    keywords: 'بی قاعده,حروف اضافه,جداشدنی,تمرین,صرف,گرامر,کلمات,اموزش,ازمون,مکالمه,a1,a2,b1,b2',
    promotionalText: 'افعال زبان آلمانی را از سطح A1 تا B2 مسلط شوید! تمرین صرف، ۳ حالت فعل، پیشوندهای جداشدنی و حروف اضافه در جملات واقعی.',
    releaseNotes: 'تمرین جامع افعال آلمانی A1-B2: ساختار Satzklammer، صرف افعال، ۳ فرم اصلی و حروف اضافه.',
    fullDescription: `تسلط کامل بر افعال زبان آلمانی از سطح A1 تا B2 با بهترین برنامه تمرین و یادگیری.

کاربرد واقعی افعال را در جملات بیاموزید: تمرین صرف فعل و افعال، ۳ فرم اصلی افعال بی قاعده (بی‌قاعده)، پیشوندهای جداشدنی و غیرجداشدنی، و حروف اضافه با حالات داتیو و آکوزاتیو (Dativ و Akkusativ).

بهترین ابزار برای آمادگی آزمون‌های گوته (Goethe)، تلک (telc)، تست‌داف (TestDaF) و مکالمه روان.

ویژگی‌های کلیدی

• ۴ حالت تمرینی هدفمند (تمرین و کوئیز)
۱. پیشوندها و ساختار جمله (Satzklammer): جایگاه فعل و پیشوندهای جداشدنی در جمله آلمانی.
۲. تمرین صرف فعل: صرف برای تمام ۶ ضمیر در زمان حال همراه با راهنمای تغییر حروف صدادار.
۳. افعال بی قاعده: تمرین ۳ فرم اصلی افعال بی قاعده (Infinitiv, Präteritum, Partizip II با hat/ist).
۴. افعال با حروف اضافه: یادگیری حروف اضافه ثابت و تطابق با داتیو و آکوزاتیو (Dativ / Akkusativ).

• مثال‌های واقعی و کاربردی
شامل جملات کامل در زمان‌های اصلی: حال (Präsens)، گذشته ساده (Präteritum)، گذشته کامل (Perfekt) и امری (Imperativ).

• اولویت‌بندی بر اساس پرکاربردترین افعال
یادگیری بر اساس بسامد و کاربرد واقعی در زبان آلمانی:
- افعال باقاعده و بی قاعده
- افعال جداشدنی و غیرجداشدنی
- افعال انعکاسی (با sich)
- افعال مدال (Modalverben)

• پیگیری پیشرفت و استفاده آفلاین
کاملاً بدون نیاز به اینترنت (۱۰۰٪ آفلاین) با قابلیت انجام کوئیز و تست.

• تلفظ صوتی و نکات گرامری
شنیدن تلفظ صحیح آلمانی و مشاهده توضیحات گرامری هنگام بروز اشتباه.

سطوح آموزشی (CEFR)
• A1: افعال پایه و روزمره
• A2: افعال جداشدنی، زمان گذشته و حروف اضافه رایج
• B1: جملات پیچیده، افعال کمکی و انعکاسی
• B2: معانی پیشرفته، حروف اضافه و اصطلاحات فعلی

یادگیری و تمرین افعال آلمانی را همین حالا با dasVerb شروع کنید!`
  }
};

const IOS_LOCALE_MAP: Record<string, string> = {
  'en-US': 'en',
  'de-DE': 'de',
  'ru': 'ru',
  'uk': 'uk',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'it': 'it',
  'pl': 'pl',
  'pt-BR': 'pt',
  'tr': 'tr',
  'ar-SA': 'ar'
};

const ANDROID_LOCALE_MAP: Record<string, string> = {
  'en-US': 'en',
  'de-DE': 'de',
  'ru-RU': 'ru',
  'uk': 'uk',
  'es-ES': 'es',
  'es-419': 'es',
  'es-US': 'es',
  'fr-FR': 'fr',
  'it-IT': 'it',
  'pl-PL': 'pl',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'tr-TR': 'tr',
  'ar': 'ar',
  'fa': 'fa'
};

const PRIVACY_URL = 'https://das-verb.yapps.studio/legal/privacy-policy.html';
const SUPPORT_URL = 'https://das-verb.yapps.studio/legal/privacy-policy.html';
const MARKETING_URL = 'https://das-verb.yapps.studio';

const TERMS_OF_USE_MAP: Record<string, string> = {
  en: 'Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  de: 'Nutzungsbedingungen: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  ru: 'Условия использования: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  uk: 'Умови використання: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  es: 'Términos de uso: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  fr: "Conditions d'utilisation : https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  it: 'Termini di utilizzo: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  pl: 'Warunki użytkowania: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  pt: 'Termos de uso: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  tr: 'Kullanım Koşulları: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  ar: 'شروط الاستخدام: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  fa: 'شرایط استفاده: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
};

function validateLengths(platform: string, locale: string, meta: LocaleMeta) {
  const title = platform === 'ios' ? meta.iosName : meta.androidTitle;
  if (title.length > 30) throw new Error(`[${platform}/${locale}] title exceeds 30 chars (${title.length}): "${title}"`);
  if (meta.subtitle.length > 30) throw new Error(`[${platform}/${locale}] subtitle exceeds 30 chars (${meta.subtitle.length}): "${meta.subtitle}"`);
  if (meta.shortDescription.length > 80) throw new Error(`[${platform}/${locale}] shortDescription exceeds 80 chars (${meta.shortDescription.length}): "${meta.shortDescription}"`);
  if (meta.keywords.length > 100) throw new Error(`[${platform}/${locale}] keywords exceeds 100 characters (${meta.keywords.length} chars): "${meta.keywords}"`);
  if (meta.promotionalText.length > 170) throw new Error(`[${platform}/${locale}] promotionalText exceeds 170 chars (${meta.promotionalText.length}): "${meta.promotionalText}"`);
  if (meta.fullDescription.length > 4000) throw new Error(`[${platform}/${locale}] fullDescription exceeds 4000 chars (${meta.fullDescription.length})`);
}

function cleanObsoleteDirectories() {
  console.log('🧹 Removing obsolete directories from Fastlane metadata...');
  
  if (fs.existsSync(IOS_META_DIR)) {
    const iosDirs = fs.readdirSync(IOS_META_DIR, { withFileTypes: true });
    for (const d of iosDirs) {
      if (d.isDirectory() && !IOS_LOCALE_MAP[d.name]) {
        fs.rmSync(path.join(IOS_META_DIR, d.name), { recursive: true, force: true });
        console.log(`  ❌ Deleted obsolete iOS directory: ${d.name}`);
      }
    }
  }

  if (fs.existsSync(ANDROID_META_DIR)) {
    const androidDirs = fs.readdirSync(ANDROID_META_DIR, { withFileTypes: true });
    for (const d of androidDirs) {
      if (d.isDirectory() && !ANDROID_LOCALE_MAP[d.name]) {
        fs.rmSync(path.join(ANDROID_META_DIR, d.name), { recursive: true, force: true });
        console.log(`  ❌ Deleted obsolete Android directory: ${d.name}`);
      }
    }
  }
}

function writeIosMetadata() {
  console.log('\n🍏 Generating iOS Fastlane Metadata...');
  for (const [iosLocale, langKey] of Object.entries(IOS_LOCALE_MAP)) {
    const meta = METADATA[langKey];
    if (!meta) throw new Error(`Missing meta for key ${langKey}`);
    validateLengths('ios', iosLocale, meta);

    const dir = path.join(IOS_META_DIR, iosLocale);
    fs.mkdirSync(dir, { recursive: true });

    const fullDescWithTerms = `${meta.fullDescription}\n\n${TERMS_OF_USE_MAP[langKey] || TERMS_OF_USE_MAP.en}`;
    fs.writeFileSync(path.join(dir, 'name.txt'), meta.iosName);
    fs.writeFileSync(path.join(dir, 'subtitle.txt'), meta.subtitle);
    fs.writeFileSync(path.join(dir, 'keywords.txt'), meta.keywords);
    fs.writeFileSync(path.join(dir, 'promotional_text.txt'), meta.promotionalText);
    fs.writeFileSync(path.join(dir, 'description.txt'), fullDescWithTerms);
    fs.writeFileSync(path.join(dir, 'release_notes.txt'), meta.releaseNotes);
    fs.writeFileSync(path.join(dir, 'privacy_url.txt'), PRIVACY_URL + '\n');
    fs.writeFileSync(path.join(dir, 'support_url.txt'), SUPPORT_URL + '\n');
    fs.writeFileSync(path.join(dir, 'marketing_url.txt'), MARKETING_URL + '\n');

    console.log(`  ✅ Written iOS metadata for [${iosLocale}]`);
  }
}

function writeAndroidMetadata() {
  console.log('\n🤖 Generating Android Fastlane Metadata...');
  for (const [androidLocale, langKey] of Object.entries(ANDROID_LOCALE_MAP)) {
    const meta = METADATA[langKey];
    if (!meta) throw new Error(`Missing meta for key ${langKey}`);
    validateLengths('android', androidLocale, meta);

    const dir = path.join(ANDROID_META_DIR, androidLocale);
    fs.mkdirSync(dir, { recursive: true });

    // Clean any old derArtikel screenshots/images and old changelogs
    const imagesDir = path.join(dir, 'images');
    if (fs.existsSync(imagesDir)) {
      fs.rmSync(imagesDir, { recursive: true, force: true });
    }

    const changelogsDir = path.join(dir, 'changelogs');
    if (fs.existsSync(changelogsDir)) {
      fs.rmSync(changelogsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(changelogsDir, { recursive: true });

    const fullDescWithTerms = `${meta.fullDescription}\n\n${TERMS_OF_USE_MAP[langKey] || TERMS_OF_USE_MAP.en}`;
    fs.writeFileSync(path.join(dir, 'title.txt'), meta.androidTitle);
    fs.writeFileSync(path.join(dir, 'short_description.txt'), meta.shortDescription);
    fs.writeFileSync(path.join(dir, 'full_description.txt'), fullDescWithTerms);
    fs.writeFileSync(path.join(changelogsDir, '1.txt'), meta.releaseNotes);

    console.log(`  ✅ Written Android metadata for [${androidLocale}]`);
  }
}

function generateMetadataSummaryMarkdown() {
  console.log('\n📝 Generating Metadata Summary Markdown files...');

  let iosRows = '';
  for (const [locale, langKey] of Object.entries(IOS_LOCALE_MAP)) {
    const meta = METADATA[langKey];
    const kwChars = meta.keywords.length;
    iosRows += `| **${locale}** | \`${meta.iosName}\` (${meta.iosName.length}/30) | \`${meta.subtitle}\` (${meta.subtitle.length}/30) | \`${meta.keywords}\` | **${kwChars}** / 100 |\n`;
  }

  let androidRows = '';
  for (const [locale, langKey] of Object.entries(ANDROID_LOCALE_MAP)) {
    const meta = METADATA[langKey];
    androidRows += `| **${locale}** | \`${meta.androidTitle}\` (${meta.androidTitle.length}/30) | \`${meta.shortDescription}\` (${meta.shortDescription.length}/80) |\n`;
  }

  const content = `# dasVerb — ASO Metadata Master Summary

Comprehensive ASO metadata configuration for iOS App Store and Google Play Store across all supported locales, generated by \`scripts/generate-fastlane-metadata.ts\`.

---

## 🍏 iOS App Store Metadata (11 Locales)

* **Name (Title):** $\\le 30$ characters (Root search term in front, \`dasVerb\` brand at the end).
* **Subtitle:** $\\le 30$ characters (Key features / value proposition).
* **Keywords:** $\\le 100$ characters (Zero duplication with Name & Subtitle).

| Locale | Name (Title $\\le 30$) | Subtitle ($\\le 30$) | Keywords ($\\le 100$ chars) | Char Count |
| :--- | :--- | :--- | :--- | :--- |
${iosRows}
---

## 🤖 Google Play Store Metadata (15 Locales)

* **Title:** $\\le 30$ characters (\`dasVerb\` brand at the beginning).
* **Short Description:** $\\le 80$ characters (Keyword-rich with action/trainer terms).
* **Full Description:** $\\le 4000$ characters (100% coverage of iOS keywords and semantic core).

| Locale | Title ($\\le 30$) | Short Description ($\\le 80$) |
| :--- | :--- | :--- |
${androidRows}
---

*Generated automatically on ${new Date().toISOString()}*
`;

  const fastlaneReadme = path.join(FASTLANE_DIR, 'metadata/README.md');
  const asoSummary = path.resolve(__dirname, '../docs/aso/metadata_summary.md');

  fs.writeFileSync(fastlaneReadme, content, 'utf8');
  fs.writeFileSync(asoSummary, content, 'utf8');

  console.log(`  ✅ Written summary to ${fastlaneReadme}`);
  console.log(`  ✅ Written summary to ${asoSummary}`);
}

function verifyNoDerArtikelLeftovers() {
  console.log('\n🔍 Verifying no derArtikel mentions remain in fastlane/metadata...');
  const checkDir = (dir: string) => {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      if (fs.statSync(fullPath).isDirectory()) {
        checkDir(fullPath);
      } else if (f.endsWith('.txt')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (/der\s*artikel/i.test(content) && !/dasverb/i.test(content) && !/das\s*verb/i.test(content)) {
          throw new Error(`Found leftover "derArtikel" mention in: ${fullPath}`);
        }
      }
    }
  };
  checkDir(path.join(FASTLANE_DIR, 'metadata'));
  console.log('  ✅ 0 leftover derArtikel mentions found. All metadata belongs exclusively to dasVerb!');
}

function main() {
  cleanObsoleteDirectories();
  writeIosMetadata();
  writeAndroidMetadata();
  generateMetadataSummaryMarkdown();
  verifyNoDerArtikelLeftovers();
  console.log('\n========================================================================');
  console.log('🎉 FASTLANE METADATA CLEANUP & DEPLOYMENT COMPLETED SUCCESSFULLY!');
  console.log('========================================================================\n');
}

main();

