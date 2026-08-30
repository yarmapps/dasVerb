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

### 2.2. Примеры предложений (`sentences`) и цветовая разметка:
* **СТРОГОЕ СООТВЕТСТВИЕ ПРЕДЛОГА В ПРИМЕРАХ:** Все 3 предложения-примера в карточке **обязаны использовать ТОЛЬКО ТОТ предлог**, который заявлен в `rektion.preposition` данной карточки (или его естественные слитные формы: *in $\rightarrow$ im/ins*, *zu $\rightarrow$ zum/zur*, *an $\rightarrow$ am/ans*). Посторонние предлоги в примерах карточки категорически запрещены.
* Каждое предложение должно содержать:
  1. `bracket_parts`: массив элементов глагольной рамки (*Satzklammer*, полужирный шрифт).
  2. `dativ_parts`: массив фраз в Dativ (🟣 фиолетовый цвет, `colors.secondary`).
  3. `akkusativ_parts`: массив фраз в Akkusativ (🔵 синий цвет, `colors.primary`).
* Обязательно наличие 3-го примера в повелительном наклонении (`"tense": "Imperativ"`).

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
      "id": "s2",
      "tense": "Perfekt",
      "german": "Sie hat ihm das Buch zurückgegeben.",
      "translation": {
        "ru": "Она вернула ему книгу.",
        "en": "She gave the book back to him."
      },
      "bracket_parts": ["hat", "zurückgegeben"],
      "dativ_parts": ["ihm"],
      "akkusativ_parts": ["das Buch"]
    },
    {
      "id": "s3",
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
