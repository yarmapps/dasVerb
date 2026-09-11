# Руководство по генерации карточек глаголов (specs/verb-generation-guide.md)

Данная спецификация является строгим эталонным руководством для AI-агентов и разработчиков по созданию, заполнению и валидации новых JSON-карточек немецких глаголов в директории `data/`.

---

## 1. Обязательное правило полноты генерации карточек (КРИТИЧЕСКИ ВАЖНО)

При добавлении нового глагола в базу **ОБЯЗАТЕЛЬНО генерировать карточки для ВСЕХ общеупотребительных комбинаций**, подпадающих под следующие 4 грамматических случая:

---

### 📌 Случай 1: Двойное прямое управление (Dativ + Akkusativ)
* **Характеристика:** Глагол требует одновременно два дополнения: лицо (*Wem? Кому?* $\rightarrow$ Dativ) и предмет (*Was? Что?* $\rightarrow$ Akkusativ).
* **Примеры:** *geben, schenken, zeigen, erklären, empfehlen, schreiben, mitbringen*.
* **Формат карточки:** 1 JSON-файл (`geben.json`).
  * `"direct_case": "Dativ + Akkusativ"`
  * В интерфейсе выводятся два бейджа: `[ + Dat ]` (фиолетовый) и `[ + Akk ]` (синий).
  * В примерах обязательно размечаются `"dativ_parts"` (*mir, ihm*) и `"akkusativ_parts"` (*das Buch, das Salz*).

---

### 📌 Случай 2: Предлоги двойного управления (Wechselpräpositionen — Раздельные карточки)
* **Характеристика:** Предлоги *in, an, auf, neben, hinter, über, unter, vor, zwischen*. Падеж меняется в зависимости от вопроса:
  * **Куда? (*Wohin?*)** $\rightarrow$ **Akkusativ** (перемещение в новое место, действие).
  * **Где? (*Wo?*)** $\rightarrow$ **Dativ** (покой или нахождение внутри/на месте).
* **Примеры:** *gehen, fahren, laufen, schwimmen*.
* **Формат карточек:** **2 раздельные карточки** (`[verb]_akk.json` и `[verb]_dat.json`):
  * `gehen_akk.json` (*идти, направляться (куда?)*, `[ in + Akk ]` 🔵).
  * `gehen_dat.json` (*гулять, ходить (где?)*, `[ in + Dat ]` 🟣).
  * `fahren_akk.json` (*ехать (куда?)*, `[ in + Akk ]` 🔵).
  * `fahren_dat.json` (*кататься (где?)*, `[ in + Dat ]` 🟣).

---

### 📌 Случай 3: Разные предложные управления глагола (Несколько карточек)
* **Характеристика:** Глагол имеет несколько разных устойчивых предлогов или падежей (*sprechen, denken, warten, sich freuen, schreiben*).
* **Правило:** Создаются **отдельные карточки для КАЖДОЙ общеупотребительной комбинации**:
  * Именование по принципу **минимальной дифференциации**:
    * **Один предлог на падеж:** `[verb]_[case].json` (например: `sprechen_akk.json` для *über + Akk*).
    * **Несколько предлогов на один падеж:** `[verb]_[case]_[prep].json` (например: `sprechen_dat_mit.json`, `sprechen_dat_von.json`).
    * **Для возвратных:** `[verb]_sich_[case]_[prep].json` (`freuen_sich_akk_auf.json`, `freuen_sich_akk_ueber.json`).
  * Пример для *sprechen*:
    1. `sprechen_dat_mit.json` (*sprechen mit + Dat* — говорить с кем-то)
    2. `sprechen_akk.json` (*sprechen über + Akk* — говорить о чём-то)
    3. `sprechen_dat_von.json` (*sprechen von + Dat* — упоминать кого-то/что-то)

#### 3.1. Обязательная базовая карточка при наличии самостоятельного значения (`[verb].json`):
* Если глагол помимо предложного управления имеет общеупотребительное первичное безобъектное (непереходное) или прямое значение без предлога (*lachen* — смеяться, *denken* — думать/мыслить, *warten* — ждать, *arbeiten* — работать, *beginnen* — начинать/начинаться, *hoffen* — надеяться, *aufhören* — прекращать/переставать):
  * **ОБЯЗАТЕЛЬНО создается базовая карточка `[verb].json`** (`preposition: null`, примеры демонстрируют первичное базовое употребление: *«Das Kind lacht fröhlich»*, *«Ich warte hier auf dich»*, *«Wir arbeiten fleißig»*).
  * И **отдельные карточки** для устойчивых предложных управлений (`lachen_akk_ueber.json`, `warten_akk_auf.json`, `denken_akk_an.json`, `beginnen_dat_mit.json`).
  * **СТРОГО ЗАПРЕЩЕНО** подменять первичное базовое значение глагола исключительно его предложной формой, если глагол массово используется самостоятельно в повседневной речи (уровни A1–B1).

---

### 📌 Случай 4: Омографы и позиционные пары (Akkusativ vs Dativ)

> ⚠️ **ПРАВИЛО ПЕРЕВОДА:** В поле `"translation"` запрещено писать громоздкие грамматические конструкции вроде *"действие: куда? + Akk"*, так как управление уже отображается цветным бейджиком в интерфейсе. Достаточно кратко указать в скобках: `(действие)` или `(состояние)`.

#### 4.1. Омографы с РАЗНЫМ спряжением (*hängen*):
* **Действие (Куда? + Akkusativ, слабый глагол):** вешать $\rightarrow$ `haengen_akk.json` (*hängt, hängte, gehängt*, перевод: *"вешать (действие)"*, `[ an + Akk ]` 🔵).
* **Состояние (Где? + Dativ, сильный глагол):** висеть $\rightarrow$ `haengen_dat.json` (*hängt, hing, gehangen*, перевод: *"висеть (состояние)"*, `[ an + Dat ]` 🟣).
* ⚠️ **СТРОГО ЗАПРЕЩЕНО объединять в одну карточку!** Создаются **2 раздельные карточки** (`haengen_akk.json` и `haengen_dat.json`).

#### 4.2. Омографы с ОДИНАКОВЫМ спряжением (*stecken*):
* **Действие (Куда? + Akkusativ):** засовывать $\rightarrow$ `stecken_akk.json` (*steckte, gesteckt*, перевод: *"засовывать, вставлять (действие)"*, `[ in + Akk ]` 🔵).
* **Состояние (Где? + Dativ):** торчать/находиться $\rightarrow$ `stecken_dat.json` (*steckte, gesteckt*, перевод: *"торчать, находиться (состояние)"*, `[ in + Dat ]` 🟣).
* Создаются **2 раздельные карточки** (`stecken_akk.json` и `stecken_dat.json`).

#### 4.3. Классические позиционные пары с разными инфинитивами:
* **Куда? (+ Akkusativ)** $\rightarrow$ **Где? (+ Dativ)**
* *legen* (`legen.json`, класть) $\leftrightarrow$ *liegen* (`liegen.json`, лежать)
* *stellen* (`stellen.json`, ставить) $\leftrightarrow$ *stehen* (`stehen.json`, стоять)
* *setzen (sich)* (`setzen_sich.json`, садиться) $\leftrightarrow$ *sitzen* (`sitzen.json`, сидеть)
* Создаются **отдельные карточки для каждого инфинитива** с перекрестной ссылкой в поле `chunk`.

---

## 2. Строгие правила грамматических полей

### 2.1. Управление и предлоги (`rektion`) — КРИТИЧЕСКИ ВАЖНО:
* **Только чистые базовые предлоги в `rektion.preposition`:**
  * ✅ **РАЗРЕШЕНО:** `"in"`, `"an"`, `"auf"`, `"mit"`, `"bei"`, `"von"`, `"aus"`, `"zu"`, `"nach"`, `"über"`, `"unter"`, `"vor"`, `"hinter"`, `"neben"`, `"zwischen"`, `"für"`, `"gegen"`, `"ohne"`, `"durch"`, `"um"`.
  * ❌ **СТРОГО ЗАПРЕЩЕНО:** использовать слитные формы с артиклями (`im`, `am`, `zum`, `zur`, `beim`, `ins`, `ans`, `vom`, `aufs`, `fürs`).
* **Падеж предлога (`rektion.preposition_case`):** `'Akkusativ' | 'Dativ' | 'Genitiv' | 'Akkusativ + Dativ' | null`.
* **Прямой падеж (`rektion.direct_case`):** `'Akkusativ' | 'Dativ' | 'Genitiv' | 'Dativ + Akkusativ' | null`.

### 2.2. Примеры предложений (`sentences`) и охват всех местоимений (СТРОГО):
* **ОБЯЗАТЕЛЬНАЯ СТРУКТУРА ПРИМЕРОВ (ровно 8 предложений на карточку):**
  Каждая карточка глагола в массиве `sentences` обязана содержать **8 аутентичных предложений**:
  1. **5 примеров в `Präsens`** (настоящее время).
  2. **1 пример в `Präteritum`** (прошедшее повествовательное время).
  3. **1 пример в `Perfekt`** (разговорное прошедшее время с вспомогательным *haben/sein* + *Partizip II*).
  4. **1 пример в `Imperativ`** (повелительное наклонение, форма *du*, *ihr* или *Sie*).
* **ОБЯЗАТЕЛЬНЫЙ ОХВАТ ВСЕХ МЕСТОИМЕНИЙ (КРИТИЧЕСКИ ВАЖНО):**
  В совокупности эти 8 предложений **обязаны задействовать ВСЕ 6 личных местоимений** немецкого языка:
  * `ich`, `du`, `er/sie/es`, `wir`, `ihr`, `sie/Sie`, а также форму *Imperativ*.
  * Не допускается повторение одних и тех же местоимений в ущерб пропущенным.
* **СТРОГОЕ СООТВЕТСТВИЕ ПРЕДЛОГА В ПРИМЕРАХ:** Все предложения в карточке **обязаны использовать ТОЛЬКО ТОТ предлог**, который заявлен в `rektion.preposition` данной карточки (или его естественные слитные формы: *in $\rightarrow$ im/ins*, *zu $\rightarrow$ zum/zur*, *an $\rightarrow$ am/ans*). Посторонние предлоги в примерах карточки категорически запрещены.
* **Цветовая разметка и перевод:**
  1. `bracket_parts`: массив элементов глагольной рамки (*Satzklammer*, полужирный шрифт).
  2. `dativ_parts`: массив фраз в Dativ (🟣 фиолетовый цвет, `colors.secondary`).
  3. `akkusativ_parts`: массив фраз в Akkusativ (🔵 синий цвет, `colors.primary`).
  4. `translation`: полноценные, качественные литературные переводы (`ru`, `en`).

### 2.3. Частотный ранг (`frequency_rank` — СТРОГО ОБЯЗАТЕЛЬНО):
* Каждая карточка обязана содержать целочисленное поле `"frequency_rank": number` (позиция глагола в частотном корпусе немецкого языка, например Routledge Frequency Dictionary / Goethe-Institut).
* Чем популярнее и употребительнее глагол, тем меньше его ранг: *sein* (1), *haben* (2), *können* (4), *machen* (7), *geben* (8), *kommen* (9), *gehen* (12) и т.д.
* Для всех вариантов управления одного и того же глагола (например, `fahren_akk_in.json`, `fahren_dat_mit.json`) устанавливается одинаковый `frequency_rank` базового инфинитива.

### 2.4. Специфика модальных глаголов (`verb_class: "modal"`):
* **В карточках модальных глаголов тренируется и изучается ТОЛЬКО сам модальный глагол:**
  * Зависимые смысловые инфинитивы (`sprechen`, `helfen`, `schwimmen`) являются обычным контекстным текстом предложения и **НЕ включаются в `bracket_parts`**.
  * В `bracket_parts` предложений модальных глаголов входит **исключительно сам модальный глагол**:
    * В `Präsens`, `Präteritum`, `Imperativ`: **ровно 1 элемент** (личная форма модального глагола: `["kann"]`, `["Kannst"]`, `["konnte"]`, `["Können"]`).
    * В `Perfekt`: **ровно 2 элемента** (вспомогательный глагол `haben` + форма модального глагола: `["haben", "können"]` или `["hat", "gekonnt"]`).

### 2.5. Строгие правила разметки `bracket_parts` (Guardrails):
* `bracket_parts` отвечает **исключительно за целевой глагол карточки (и его рамку в Perfekt / приставку)**. Включать туда предлоги (`auf`, `über`, `in`), наречия или зависимые чужие инфинитивы **КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО**.
* **Количество элементов в `bracket_parts` строго регламентировано:**
  1. **Для `Perfekt` (все глаголы):** ровно **2 элемента** (`[вспомогательный глагол haben/sein, Partizip II / Ersatzinfinitiv]`, например `["haben", "gelegt"]`, `["ist", "gefahren"]`, `["haben", "können"]`, `["haben sich", "gefreut"]`).
  2. **Для `Präsens`, `Präteritum`, `Imperativ`:**
     * **Отделяемые глаголы (`prefix_type: "separable"`):** ровно **2 элемента** (`[спрягаемая основа, отделяемая приставка]`, например `["ruft", "an"]`, `["machte", "auf"]`, `["Komm", "mit"]`).
     * **Все остальные глаголы (простые неотделяемые, возвратные, модальные):** ровно **1 элемент** (только форма самого изучаемого глагола, например `["lege"]`, `["kann"]`, `["konnte"]`, `["lag"]`, `["Lies"]`, `["freut sich"]`). Запрещено добавлять части других глаголов (`Bleib ... liegen`, `Mach ... zu`, `Lies ... vor`, `kann ... sprechen`)!
* **Буквальное совпадение строк:**
  * Каждый элемент массивов `bracket_parts`, `dativ_parts` и `akkusativ_parts` **обязан буквально присутствовать как подстрока в поле `german`**.
  * Для слитных предлогов с артиклями в `dativ_parts` / `akkusativ_parts` указывается фактическая подстрока из предложения (например, `"im Park"`, `"zur Party"`, `"zum Arzt"`, `"am Strand"`, а не абстрактные `"dem Park"`, `"der Party"`).

---

## 3. Эталонный JSON-шаблон карточки

```json
{
  "id": "geben",
  "infinitive": "geben",
  "translation": {
    "ru": "давать, передавать",
    "en": "to give"
  },
  "level": "A1",
  "frequency_rank": 8,
  "auxiliary": "haben",
  "morphology": {
    "verb_class": "strong",
    "prefix_type": "none",
    "prefix": null,
    "is_reflexive": false,
    "reflexive_case": null
  },
  "principal_parts": {
    "infinitive": "geben",
    "present_3sg": "gibt",
    "praeteritum_3sg": "gab",
    "partizip_2": "gegeben"
  },
  "conjugation": {
    "present": {
      "ich": "gebe",
      "du": "gibst",
      "er_sie_es": "gibt",
      "wir": "geben",
      "ihr": "gebt",
      "sie_Sie": "geben",
      "root_vowel_change": "e -> i"
    },
    "praeteritum": {
      "ich": "gab",
      "du": "gabst",
      "er_sie_es": "gab",
      "wir": "gaben",
      "ihr": "gabt",
      "sie_Sie": "gaben"
    },
    "imperative": {
      "du": "gib!",
      "ihr": "gebt!",
      "Sie": "geben Sie!"
    }
  },
  "rektion": {
    "requires_object": true,
    "direct_case": "Dativ + Akkusativ",
    "preposition": null,
    "preposition_case": null
  },
  "chunk": "jemandem (Dat) etwas (Akk) geben",
  "sentences": [
    {
      "id": "s1",
      "tense": "Präsens",
      "german": "Ich gebe dir mein Wort.",
      "translation": {
        "ru": "Я даю тебе свое слово.",
        "en": "I give you my word."
      },
      "bracket_parts": ["gebe"],
      "dativ_parts": ["dir"],
      "akkusativ_parts": ["mein Wort"]
    },
    {
      "id": "s2",
      "tense": "Präsens",
      "german": "Gibst du mir bitte das Salz?",
      "translation": {
        "ru": "Дашь мне, пожалуйста, соль?",
        "en": "Can you please give me the salt?"
      },
      "bracket_parts": ["Gibst"],
      "dativ_parts": ["mir"],
      "akkusativ_parts": ["das Salz"]
    },
    {
      "id": "s3",
      "tense": "Präsens",
      "german": "Er gibt seinem Sohn einen guten Rat.",
      "translation": {
        "ru": "Он дает своему сыну хороший совет.",
        "en": "He gives his son good advice."
      },
      "bracket_parts": ["gibt"],
      "dativ_parts": ["seinem Sohn"],
      "akkusativ_parts": ["einen guten Rat"]
    },
    {
      "id": "s4",
      "tense": "Präsens",
      "german": "Wir geben den Gästen frische Handtücher.",
      "translation": {
        "ru": "Мы даем гостям свежие полотенца.",
        "en": "We give the guests fresh towels."
      },
      "bracket_parts": ["geben"],
      "dativ_parts": ["den Gästen"],
      "akkusativ_parts": ["frische Handtücher"]
    },
    {
      "id": "s5",
      "tense": "Präsens",
      "german": "Gebt ihr den Kindern Schokolade?",
      "translation": {
        "ru": "Вы даете детям шоколад?",
        "en": "Do you give the children chocolate?"
      },
      "bracket_parts": ["Gebt"],
      "dativ_parts": ["den Kindern"],
      "akkusativ_parts": ["Schokolade"]
    },
    {
      "id": "s6",
      "tense": "Präteritum",
      "german": "Gestern gab sie mir den Schlüssel.",
      "translation": {
        "ru": "Вчера она отдала мне ключ.",
        "en": "Yesterday she gave me the key."
      },
      "bracket_parts": ["gab"],
      "dativ_parts": ["mir"],
      "akkusativ_parts": ["den Schlüssel"]
    },
    {
      "id": "s7",
      "tense": "Perfekt",
      "german": "Sie haben uns keine Antwort gegeben.",
      "translation": {
        "ru": "Они не дали нам никакого ответа.",
        "en": "They gave us no answer."
      },
      "bracket_parts": ["haben", "gegeben"],
      "dativ_parts": ["uns"],
      "akkusativ_parts": ["keine Antwort"]
    },
    {
      "id": "s8",
      "tense": "Imperativ",
      "german": "Gib mir bitte kurz das Buch!",
      "translation": {
        "ru": "Дай мне, пожалуйста, на минутку книгу!",
        "en": "Please give me the book for a moment!"
      },
      "bracket_parts": ["Gib"],
      "dativ_parts": ["mir"],
      "akkusativ_parts": ["das Buch"]
    }
  ]
}
```

---

## 4. Обязательный чеклист после добавления новых глаголов

После создания любого файла `data/*.json` обязательно выполните команды:

```bash
yarn build:db     # Компилирует JSON-карточки в SQLite базу assets/main.db
yarn type-check   # Проверка TypeScript типов
yarn lint         # Проверка ESLint (правила unicorn + no-nested-ternary)
yarn lint:style   # Проверка Stylelint
yarn test         # Валидация целостности данных и тестов Jest
```
