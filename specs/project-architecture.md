# Архитектура и стандарты разработки dasVerb (specs/project-architecture.md)

Данный документ фиксирует технологический стек, стандарты структуры кода, стилизации и процессов верификации для проекта **dasVerb**.

---

## 1. Технологический стек

* **Фреймворк:** React Native (Expo SDK 54+)
* **Язык:** TypeScript (строгий режим `strict: true`)
* **Стилизация:** Модульные стили компонентов (`[ComponentName].styles.ts`) на базе `StyleSheet.create` с поддержкой Светлой и Темной темы (`ThemeColors`).
* **База данных:** `expo-sqlite` (для хранения каталога глаголов, прогресса и SRS-повторений).
* **Контроль качества:** ESLint, Prettier, Stylelint, Jest.

---

## 2. Структура проекта

```
dasVerb/
├── data/                  # Исходные JSON-карточки глаголов (1 файл на 1 глагол)
├── docs/                  # Документация и типы данных (verb.types.ts)
├── specs/                 # Спецификации архитектуры, правил (file-naming-rules.md) и фичей
├── src/
│   ├── components/        # UI-компоненты (Каждый компонент в своей папке: Name/Name.tsx, Name.styles.ts)
│   ├── screens/           # Экраны приложения (ScreenName/ScreenName.tsx, ScreenName.styles.ts)
│   ├── styles/            # Темизация (themeColors.ts, typography.ts, spacing.ts, variables.ts)
│   ├── services/          # Сервисы (verbDataService.ts, settingsService.ts, storageService.ts, intlService.ts)
│   ├── types/             # Экспорт TypeScript-типов (intl.ts, navigation.ts)
│   └── __tests__/         # Автоматические тесты (Jest)
├── App.tsx                # Точка входа в приложение
├── GEMINI.md              # Правила и указания для AI-агентов
├── package.json
└── tsconfig.json
```

---

## 3. Стандарты модульности и экспортов (Строго)

1. **Никаких `export default` вообще:**
   * Все функции, компоненты, экраны и сервисы экспортируются исключительно **именованным экспортом**:
     ```typescript
     // ПРАВИЛЬНО:
     export function DictionaryScreen(): React.JSX.Element { ... }
     export const verbDataService = { ... };

     // ЗАПРЕЩЕНО:
     export default function DictionaryScreen() { ... }
     export default DictionaryScreen;
     ```
   * В ESLint включено строгое правило `import/no-default-export` (с исключением только для корневого `App.tsx` под бандлер Expo).

2. **Никаких `index.ts` / `index.tsx` файлов вообще:**
   * В проекте **запрещено** создавать barrel-файлы (`index.ts`).
   * Все импорты осуществляются напрямую по имени файла компонента:
     ```typescript
     // ПРАВИЛЬНО:
     import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
     import { FormInput } from '../../components/FormInput/FormInput';
     import { useAppTheme } from '../../context/ThemeContext';

     // ЗАПРЕЩЕНО:
     import { ScreenHeader } from '../../components/ScreenHeader';
     import { ScreenHeader } from '../../components';
     ```

3. **Обязательная деструктуризация (prefer-destructuring):**
   * При извлечении свойств объектов всегда используется синтаксис деструктуризации:
     ```typescript
     // ПРАВИЛЬНО:
     const { dictionaryScreen, navigation } = translations;

     // ЗАПРЕЩЕНО:
     const dictionaryScreen = translations.dictionaryScreen;
     ```
   * В ESLint включено правило `prefer-destructuring`.

4. **Понятные и осмысленные имена переменных (Self-Explanatory Naming):**
   * Все переменные, аргументы функций, пропсы и константы должны иметь ясные, полные и самодокументируемые имена на английском языке.
   * **СТРОГО ЗАПРЕЩЕНЫ** загадочные сокращения и однобуквенные/двухбуквенные имена (например: `pCase`, `dCase`, `q`, `t`, `el`, `cb`, `val`, `res`).
   * **ПРИМЕРЫ:**
     ```typescript
     // ПРАВИЛЬНО:
     const formattedPrepositionCase = caseMap[prepositionCase];
     const formattedDirectCase = caseMap[directCase];
     const trimmedSearchQuery = searchQuery.trim();
     const languageCode = locale.split('-')[0];

     // ЗАПРЕЩЕНО:
     const pCase = caseMap[rawCase];
     const dCase = caseMap[rawCase];
     const q = query.trim();
     const lang = locale.split('-')[0];
     ```

5. **Категорический запрет вложенных тернарных операторов (No Nested Ternaries):**
   * В кодовой базе **СТРОГО ЗАПРЕЩЕНЫ** вложенные тернарники (`a ? b : c ? d : e`).
   * Включены правила `no-nested-ternary` и `unicorn/no-nested-ternary` (плагин `eslint-plugin-unicorn`).
   * **Альтернативы:**
     * Таблицы соответствий (Object lookup maps / Record)
     * Вспомогательные функции с конструкцией `switch` / `return`
     * Простые блоки `if / else`

---

## 4. Стандарты стилизации и компонентов

1. **Изоляция компонентов и экранов в отдельных папках:**
   * Каждый компонент и каждый экран располагается в своей папке:
     ```
     src/components/ComponentName/
     ├── ComponentName.tsx
     └── ComponentName.styles.ts
     ```
2. **Никаких сырых инлайн-стилей:** Все стили выносятся в файл `[ComponentName].styles.ts`.
3. **Фабрика стилей под тему:**
   ```typescript
   import { StyleSheet } from 'react-native';
   import { ThemeColors } from '../../styles/themeColors';
   import { Spacing } from '../../styles/spacing';
   import { Typography } from '../../styles/typography';

   export const createStyles = (colors: ThemeColors) =>
     StyleSheet.create({
       container: {
         backgroundColor: colors.background,
         padding: Spacing.md,
       },
       title: {
         color: colors.textPrimary,
         fontSize: Typography.fontSize.lg,
       },
     });
   ```

---

## 5. Стандарты данных глаголов (Rektion и предлоги)

1. **Только чистые базовые предлоги (Base Prepositions):**
   * В поле `rektion.preposition` карточки глагола (`data/*.json`) указываются **строго чистые предлоги без слияния с артиклем**:
     * ✅ **ПРАВИЛЬНО:** `"preposition": "in"`, `"preposition": "an"`, `"preposition": "zu"`, `"preposition": "bei"`, `"preposition": "von"`.
     * ❌ **СТРОГО ЗАПРЕЩЕНО:** `"preposition": "im"`, `"preposition": "am"`, `"preposition": "zum"`, `"preposition": "zur"`, `"preposition": "beim"`, `"preposition": "ins"`, `"preposition": "ans"`, `"preposition": "vom"`.
   * **Обоснование:** Грамматическое управление глагола инвариантно к роду существительного и типу артикля (*in + Dativ* одинаково управляет *in dem (im) Supermarkt*, *in einer Bäckerei*, *in keinem Laden*). Слитные формы `im / am / zum` являются частными случаями употребления с определенным артиклем и допустимы только внутри примеров предложений (`sentences`), но не в поле управления `rektion`.

2. **Обязательное указание падежа предлога (`rektion.preposition_case`):**
   * Всегда указывается падеж, требуемый предлогом: `'Akkusativ' | 'Dativ' | 'Genitiv'`.

3. **Прямое управление (`rektion.direct_case`):**
   * Для переходных и безпредложных глаголов указывается падеж прямого дополнения (`'Akkusativ'` или `'Dativ'`).

---

## 6. Стандарты интернационализации (i18n) и запрет defaultMessage (Строго)

* **Стек:** `react-intl` (FormatJS), дерево компонентов обязательно обернуто в `<IntlProvider>`.
* **Использование `useIntl`:** Все тексты пользовательского интерфейса извлекаются исключительно через хук `useIntl().formatMessage({ id: 'key' })`.
* **СТРОГИЙ ЗАПРЕТ `defaultMessage`:**
  * В вызовах `formatMessage` и `<FormattedMessage>` **категорически запрещено передавать свойство `defaultMessage`**.
  * Все ключи и тексты обязаны находиться исключительно в файлах `src/translations/*.json`.
  * Данное правило гарантирует чистоту архитектуры, отсутствие дублирования и контролируется автоматическим unit-тестом `src/__tests__/i18n.test.ts`.

---

## 7. Обязательные скрипты верификации (Yarn)

Перед каждым коммитом или сдачей задачи должны выполняться проверки:

* `yarn build:db` — сборка SQLite базы из JSON-файлов.
* `yarn type-check` (или `yarn typecheck`) — проверка типов TypeScript (`tsc --noEmit`).
* `yarn lint` — статический анализ кода (ESLint).
* `yarn lint:fix` — автоисправление ошибок форматирования.
* `yarn lint:style` — проверка стилей через Stylelint.
* `yarn format` — форматирование Prettier.
* `yarn test` — запуск тестов Jest.

---

## 8. Правила работы с Git

* **Строгий запрет на автоматические коммиты, мерджи и пуши:** никакие команды `git commit`, `git merge`, `git push` не выполняются автоматически.
* Любые действия с Git производятся **исключительно по прямому запросу пользователя**.

---

## 9. Актуализация спецификаций и документации (Строго)

* При любых изменениях архитектурных решений, правил именования, форматов файлов или моделей данных **обязательно немедленно обновлять соответствующие спецификации (`specs/*.md`) и файл `GEMINI.md`**.
* Все спецификации и правила проекта **всегда обязаны поддерживаться в 100% актуальном состоянии**.
