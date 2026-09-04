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
4. **Корневые контейнеры экранов и запрет `SafeAreaView` в корне экранов (по образцу derArtikel):**
   * Все экраны приложения в качестве корневого контейнера обязаны использовать `<ScreenBackground>` (компонент на базе `LinearGradient` с `{ flex: 1 }`).
   * **СТРОГИЙ ЗАПРЕТ `SafeAreaView` в корне экранов:** на Android нативный `RNCSafeAreaView` из `react-native-safe-area-context` при навигационных переходах возврата (`goBack` / `slide_from_right`) пересчитывает insets в 0 и схлопывает дочерние элементы (`onMeasure(0,0)`), что приводит к исчезновению всего контента и белому экрану во время анимации сдвига.
   * Безопасные отступы сверху (`insets.top`) обрабатываются исключительно внутри `<ScreenHeader>` через хук `useSafeAreaInsets()`.

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

4. **Частотный ранг глаголов (`frequency_rank`):**
   * Все карточки глаголов обязаны содержать числовое поле `frequency_rank` (ранг частотности в немецком языке на базе корпусов Routledge / Goethe-Institut).
   * В практике глаголы сортируются по уровню CEFR (`A1` → `A2` → `B1` → `B2` → `C1` → `C2`), а внутри уровня — строго по `frequency_rank ASC`, затем `infinitive_lower ASC`.

---

## 6. Стандарты интернационализации (i18n) и запрет defaultMessage (Строго)

* **Стек:** `react-intl` (FormatJS), дерево компонентов обязательно обернуто в `<IntlProvider>`.
* **Использование `useIntl`:** Все тексты пользовательского интерфейса извлекаются исключительно через хук `useIntl().formatMessage({ id: 'key' })`.
* **СТРОГИЙ ЗАПРЕТ `defaultMessage`:**
  * В вызовах `formatMessage` и `<FormattedMessage>` **категорически запрещено передавать свойство `defaultMessage`**.
  * Все ключи и тексты обязаны находиться исключительно в файлах `src/translations/*.json`.
  * Данное правило гарантирует чистоту архитектуры, отсутствие дублирования и контролируется автоматическим unit-тестом `src/__tests__/i18n.test.ts`.
* **Языки по умолчанию (ТОЛЬКО EN и RU):**
  * Переводы по умолчанию создаются **исключительно для английского (`en.json`) и русского (`ru.json`) языков**.
  * Добавление переводов на остальные 9 языков (`es`, `fr`, `it`, `pl`, `pt`, `tr`, `uk`, `ar`, `fa`) производится **только по прямому и явному указанию пользователя**. При отсутствии перевода `intlService` автоматически подставляет английский fallback.

---

## 7. Промежуточные проверочные тесты (Checkpoints) и отслеживание ошибок

1. **Отслеживание статистики на уровне предложений (`sentence_error_stats`):**
   * Для каждого предложения (`${verbCard.id || infinitive}_${sentence.id}`) сервис `progressService` сохраняет объект статистики `SentenceProgressStats` (`attempts`, `correct`, `incorrect`).
2. **Четырехуровневая система приоритетов при формировании промежуточного теста (20 упражнений):**
   * Из пула всех предложений 10 пройденных глаголов (включая все варианты управления) алгоритм формирует 20 упражнений строго по 4 уровням приоритета:
     * **Tier 1 (Наивысший приоритет):** Предложения, на которые **всегда был дан неверный ответ** (100% ошибок, `attempts > 0`, `correct === 0`). Внутри сортируются по убыванию количества ошибок (`incorrect DESC`).
     * **Tier 2 (Смешанные ответы):** Предложения, где были и правильные, и неправильные ответы (`correct > 0`, `incorrect > 0`). Сортируются по проценту правильных ответов по возрастанию (чем меньше % верных ответов, тем выше приоритет).
     * **Tier 3 (Всегда верные):** Предложения, на которые **всегда был дан верный ответ** (100% успеха, `incorrect === 0`).
     * **Tier 4 (Наименьший приоритет):** Предложения, которые **еще не встречались в квизах ни разу** (`attempts === 0`).
3. **Прогресс чекпоинта (`checkpoint_progress`) и система наград:**
   * Результаты прохождения чекпоинта сохраняются в отдельном хранилище `checkpoint_progress`.
   * До прохождения карточка отображает пунктирный бейдж с иконкой флажка. После прохождения отображается заработанная награда (бронзовая/серебряная медаль или золотой кубок), идентично карточкам глаголов.

---

## 8. Синтез речи (TTS) и настройки тренировки

1. **Озвучивание правильного ответа (`speechService`):**
   * При правильном заполнении карточки немецкое предложение озвучивается вслух через `expo-speech` на немецком языке (`de-DE`).
   * В `settingsService` сохраняется настройка `speakOnCorrectAnswer: boolean` (по умолчанию `true`) и `ttsVoiceGender: 'female' | 'male'` (по умолчанию `'female'`).
2. **Переход к следующему вопросу:**
   * Автопереход по таймеру отключен. Переход осуществляется **исключительно по тапу пользователя** на экран или кнопку «Продолжить».
3. **Модальное окно настроек квиза (`QuizSettingsModal`):**
   * В правом верхнем углу карточки задания размещена кнопка с иконкой шестеренки.
   * Открывает shared-компонент `QuizSettingsModal`, позволяющий переключать произношение и голос прямо во время тренировки.

---

## 9. Аналитика и телеметрия (Firebase & Google Analytics 4)

1. **Единый SDK:**
   * Сбор аналитики и поведенческих метрик мобильного приложения осуществляется через официальный SDK `@react-native-firebase/app` и `@react-native-firebase/analytics`.
   * Отдельного Google Analytics SDK не требуется — данные из Firebase автоматически синхронизируются в Google Analytics 4 (GA4 App Data Stream).
2. **Фасад `analyticsService` (`src/services/analyticsService.ts`):**
   * Все события типизированы (`src/types/analytics.types.ts`), логируются через `trackEvent`, `trackScreenView`, `setUserProperty`.
   * Префиксы событий строго разделены по функциональным областям:
     * `dictionary_*` — поиск (`dictionary_search` с `search_term` и `results_count`, `dictionary_search_no_results`), очистка строки поиска, разворачивание/сворачивание карточки глагола.
     * `quiz_*` — старт квиза (`quiz_started`), завершение с результатами (`quiz_completed`), досрочный выход (`quiz_interrupted`).
     * `daily_limit_*` — показ окна лимита (`daily_limit_shown`), выбор просмотра рекламы (`daily_limit_ad_chosen`), отказ/закрытие (`daily_limit_ad_declined`), переход на Premium (`daily_limit_premium_clicked`).
     * `ad_reward_*` — факт показа рекламы (`ad_reward_viewed`) и успешное начисление награды (`ad_reward_earned`).
     * `settings_*` — переключение звука, уведомлений, озвучки, пола диктора, темы, выбор языка интерфейса, клик по обратной связи.
   * Все вызовы изолированы в `try ... catch` — сбои нативного модуля никогда не приводят к падению приложения.
3. **Expo Go & Dev-окружение:**
   * При отключенном `ENABLE_ANALYTICS` в `src/config/features.js` бандлер Metro перенаправляет вызовы на `src/analytics/mock.ts`, обеспечивая запуск в Expo Go и прогон unit-тестов без необходимости наличия скомпилированных нативных библиотек.
4. **Конфигурация нативной сборки iOS (CocoaPods & SPM):**
   * В `app.json` плагин `@react-native-firebase/app` настроен с `{ "ios": { "disableSPM": true } }`, отключая Swift Package Manager в пользу стабильного CocoaPods (`$RNFirebaseDisableSPM = true`).
   * В связке с `expo-build-properties` (`ios.useFrameworks: "static"`) подключен плагин `./plugins/withNonModularHeaders` для настройки статических библиотек и флага `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = 'YES'`.
5. **Автоматический трекинг экранов (`useScreenTracking`):**
   * Хук `src/hooks/useScreenTracking.ts` подключается к `NavigationContainer` в `App.tsx` и автоматически отправляет `screen_view` при смене активного экрана.

---

## 10. Обязательные скрипты верификации (Yarn)

Перед каждым коммитом или сдачей задачи должны выполняться проверки:

* `yarn build:db` — сборка SQLite базы из JSON-файлов.
* `yarn type-check` (или `yarn typecheck`) — проверка типов TypeScript (`tsc --noEmit`).
* `yarn lint` — статический анализ кода (ESLint).
* `yarn lint:fix` — автоисправление ошибок форматирования.
* `yarn lint:style` — проверка стилей через Stylelint.
* `yarn format` — форматирование Prettier.
* `yarn test` — запуск тестов Jest.

---

## 9. Правила работы с Git

* **Строгий запрет на автоматические коммиты, мерджи и пуши:** никакие команды `git commit`, `git merge`, `git push` не выполняются автоматически.
* Любые действия с Git производятся **исключительно по прямому запросу пользователя**.

---

## 10. Актуализация спецификаций и документации (Строго)

* При любых изменениях архитектурных решений, правил именования, форматов файлов или моделей данных **обязательно немедленно обновлять соответствующие спецификации (`specs/*.md`) и файл `GEMINI.md`**.
* Все спецификации и правила проекта **всегда обязаны поддерживаться в 100% актуальном состоянии**.
