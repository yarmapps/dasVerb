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
   * При правильном заполнении карточки немецкое предложение озвучивается вслух через `expo-speech` на немецком языке (`de-DE`) мужским голосом (`male`).
   * В `settingsService` сохраняется настройка `speakOnCorrectAnswer: boolean` (по умолчанию `true`).
2. **Переход к следующему вопросу:**
   * Автопереход по таймеру отключен. Переход осуществляется **исключительно по тапу пользователя** на экран или кнопку «Продолжить».
3. **Модальное окно настроек квиза (`QuizSettingsModal`):**
   * В правом верхнем углу карточки задания размещена кнопка с иконкой шестеренки.
   * Открывает shared-компонент `QuizSettingsModal`, позволяющий управлять произношением правильного ответа во время тренировки.

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
3. **Expo Go, Dev-окружение и Feature Flags (`src/config/features.js`):**
   * `ENABLE_ADS` — управление показом и загрузкой мобильной рекламы AdMob.
   * `ENABLE_ANALYTICS` — при отключении бандлер Metro перенаправляет вызовы на `src/analytics/mock.ts`, обеспечивая запуск в Expo Go и прогон unit-тестов без необходимости наличия скомпилированных нативных библиотек.
   * `ENABLE_PREMIUM` — при значении `false` полностью отключает логику RevenueCat (не вызывает `Purchases.configure`), скрывает иконку бриллианта (алмаза) в шапке, убирает кнопку покупки Premium и разделитель из модального окна лимита квизов (оставляя только просмотр рекламы) и не открывает экран пейволла (`PremiumSubscribeSheet`).
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

## 11. Правила работы с Git

* **Строгий запрет на автоматические коммиты, мерджи и пуши:** никакие команды `git commit`, `git merge`, `git push` не выполняются автоматически.
* Любые действия с Git производятся **исключительно по прямому запросу пользователя**.

---

## 12. Режим тренировки глаголов с приставками (Prefix Practice)

1. **Архитектура уровней и база данных:**
   * В таблице `verbs` добавлены поля `prefix_type` (`'separable' | 'inseparable' | 'dual' | 'none'`) и `prefix` (строка приставки или `NULL`).
   * В SQLite создана таблица `prefix_levels`: `id`, `cefr_level`, `subgroup_type` (`'separable' | 'inseparable' | 'opposites' | 'dual' | 'checkpoint'`), `level_number`, `title`, `verbs_json`, `exercise_sentence_ids_json`.
   * На этапе сборки (`scripts/buildDatabase.ts`) 311 глаголов с приставками компилируются в уровни CEFR (A1, A2, B1, B2) и подгруппы.
   * Каждый стандартный уровень содержит строго 10 упражнений. Каждый чекпоинт секции содержит 20 упражнений.
2. **Формат упражнений (Dual-Slot Exercise):**
   * В предложениях с отделением приставки тренируются 2 слота:
     * Слот 1: спрягаемая форма глагола в позиции 2 предложения.
     * Слот 2: отделяемая приставка в конце предложения (или `'—'` для неотделяемых глаголов).
   * Упражнения уровня перемешиваются алгоритмом `shuffleArray(exercises)` при каждом запуске квиза для обеспечения случайного порядка.
   * При неправильном ответе показывается карточка грамматической подсказки (`PrefixGrammarHint`) с правилом отделения для соответствующего типа приставки.
   * В Smart Quiz ошибки на глаголах с приставками автоматически тренируются в формате `prefix_dual_slot`.
3. **Навигация и масштабируемый экран результатов:**
   * Экран списка уровней `PrefixPracticeListScreen` доступен из `PracticeScreen` через баннер-карточку `PrefixPracticeCard`.
   * `VerbQuizScreen` передает в `QuizResultsScreen` параметры `nextQuizParams` и `returnRouteName`, делая логику экрана результатов полностью универсальной и масштабируемой.
4. **Управление данными в Настройках:**
   * В `SettingsScreen` разделены опции «Сбросить прогресс обучения» (`progressService.clearAllProgress()`, очищает прогресс глаголов и уровней приставок) и «Сбросить настройки» (`resetAllSettings()`, возвращает тему, звук и уведомления к значениям по умолчанию без потери прогресса). Обе операции требуют подтверждения в диалоге `Alert.alert`.
5. **CEFR-переключатель уровней в списке глаголов (`VerbsPracticeListScreen`):**
   * Вместо единого длинного списка экран `VerbsPracticeListScreen` оснащен переключателем вкладок уровней CEFR (`A1`, `A2`, `B1`, `B2`), как в `PrefixPracticeListScreen`.
   * При выборе таба список мгновенно фильтрует глаголы и чекпоинты выбранного уровня сложности, воспроизводится тап-звук (`soundService.playTapSound()`), а скролл сбрасывается к началу.
   * В режиме тематических категорий (`categoryId`) вкладки скрываются, отображая тематическую подборку.
6. **Оптимизация производительности длинных списков (Performance & FlatList):**
   * **In-memory кэширование:** Статичные данные глаголов (`cachedOrderedVerbs`, `cachedPrefixLevels`) в `verbDataService` и базовая группировка `baseGroupsRef` в `VerbsPracticeListScreen` исключают повторные обращения к SQLite и парсинг 4 000+ JSON-строк при возврате с квизов.
   * **Мемоизация компонентов:** Карточки списков (`PracticeVerbCard`, `PracticeCheckpointCard`) строго мемоизируются через `React.memo` со стабильными колбэками.
   * **Тюнинг виртуализации FlatList:** `removeClippedSubviews={true}`, `windowSize={5}`, `initialNumToRender={12}`, `maxToRenderPerBatch={10}` снижают потребление памяти в 2 раза и поддерживают стабильные 60 FPS при быстром скролле.
   * **Плавный fallback скролла:** `onScrollToIndexFailed` использует `scrollToOffset` на базе `averageItemLength` для предотвращения мерцания и рекурсивных ошибок.
   * **Устранение дублирующих запросов:** В `PrefixPracticeListScreen` удален избыточный параллельный `loadData` на первом монтировании.

---

## 13. Режим тренировки спряжений (Konjugationstrainer / Conjugation Practice)

1. **Архитектура уровней и база данных:**
   * В SQLite создана таблица `conjugation_levels`: `id`, `cefr_level`, `subgroup_type` (`'standard' | 'checkpoint' | 'final_test'`), `level_number`, `order_index`, `title`, `verbs_json`.
   * На этапе сборки базы (`scripts/buildDatabase.ts`) исходный массив глаголов дедуплицируется по уникальным инфинитивам (~310 глаголов для A1–B2).
   * Структура прогрессии для каждого CEFR-уровня:
     * Стандартные уровни: по 5 глаголов в уровне.
     * Промежуточные чекпоинты: каждые 10 стандартных уровней, содержат 10 случайных глаголов из ранее пройденного диапазона. Размещаются строго между блоками уровней (между 10 и 11, 20 и 21 и т.д.) с помощью сквозной сортировки `order_index`.
     * Финальный тест CEFR: в конце каждого уровня, содержит 15 случайных глаголов всего уровня.
2. **Формат упражнений (`conjugation_fill`):**
   * Одно упражнение тренирует 1 глагол по всем 6 личным местоимениям немецкого языка (`ich`, `du`, `er/sie/es`, `wir`, `ihr`, `sie/Sie`).
   * Квиз состоит из 5 упражнений (глаголов), отображая прогресс в шапке от `1/5` до `5/5`.
   * Пул опций ответа формируется динамически из уникальных форм спряжения данного глагола в Präsens (4 чипа для регулярных слабых глаголов, 5 чипов для глаголов с чередованием гласных). Пул не исчерпывается при выборе.
   * Адаптивная раскладка вариантов: 4 опции размещаются сеткой 2x2; 5 опций — 2x2 плюс полноширинная кнопка 5-го варианта.
   * Поддержка грамматических подтипов:
     * Возвратные глаголы (`reflexive`): возвратное местоимение (`mich`, `dich`, `sich`, `uns`, `euch`, `sich`) фиксируется в строке после слота ответа; чип содержит исключительно спрягаемую форму глагола.
     * Отделяемые глаголы (`separable`): приставка включается в чип ответа (`[ rufe an ]`).
   * Автоматическая валидация: срабатывает мгновенно при заполнении всех 6 слотов.
   * Тактильная отдача (Haptics): легкий отклик на выбор чипа, строгая негативная хэптика (`NotificationFeedbackType.Error`) при наличии хотя бы одной ошибки.
   * Визуализация ошибок и подсказки:
     * Ошибочный слот зачеркивается красным (`strikethroughText`), рядом отображается правильный ответ зеленым цветом.
     * Под карточкой отображается грамматическая подсказка `ConjugationGrammarHint` при наличии чередования корневой гласной (`e -> i`, `e -> ie`, `a -> ä`, `au -> äu`).
   * Озвучка (TTS): отключена в режиме спряжений.
3. **Хранение прогресса и навигация:**
   * Прогресс уровней хранится в AsyncStorage по ключу `@conjugation_levels_progress` (`Record<string, { stars: number, completedAt: string, score: number }>`).
   * Сброс прогресса спряжений интегрирован в `progressService.clearAllProgress()`.
   * Экран списка `ConjugationPracticeListScreen` открывается с карточки `ConjugationPracticeCard` на `PracticeScreen`.
   * Результаты квиза обрабатываются через универсальный экран `QuizResultsScreen` с маршрутом возврата `returnRouteName: 'ConjugationPracticeList'`.

---

### 14. Режим тренировки неправильных глаголов (Irregular Verbs / 3 Verb Forms Practice)

1. **Архитектура уровней и база данных:**
   * В SQLite создана таблица `verb_forms_levels`: `id`, `cefr_level`, `subgroup_type` (`'standard' | 'checkpoint' | 'final_test'`), `level_number`, `order_index`, `title`, `verbs_json`.
   * На этапе сборки базы (`scripts/buildDatabase.ts`) массив уникальных инфинитивов **неправильных/сильных глаголов** (`verb_class !== 'weak'`, ~230 глаголов A1–B2) компилируется в 51 уровень:
     * Стандартные уровни: по 5 глаголов (5 упражнений, 1 раунд).
     * Промежуточные чекпоинты: по 10 глаголов из ранее пройденного диапазона (10 упражнений, 1 раунд).
     * Финальные тесты CEFR: по 15 глаголов соответствующего уровня (15 упражнений, 1 раунд).
2. **Формат упражнения (`verb_forms_fill`):**
   * Карточка упражнения `VerbFormsFillExercise` отображает:
     * Заголовок карточки: «Заполните карточку» (`verbQuizScreen.fillCard`).
     * Верхний статичный блок с инфинитивом глагола.
     * Слот Präteritum (3-е лицо ед.ч., например, `[ ging ]`).
     * Слот вспомогательного глагола (`[ hat ]` / `[ ist ]`).
     * Слот Partizip II (например, `[ gegangen ]`).
   * Взаимодействие и управление:
     * Пользователь может нажимать на любой слот для смены фокуса и перевыбора варианта.
     * Снизу выводится сетка из 4 опций (для Präteritum и Partizip II) или панель выбора из 2 кнопок (`hat` / `ist`).
     * Отделяемые глаголы отображают приставку в чипе (`[ rief an ]`, `[ angerufen ]`).
     * Возвратные глаголы отображают местоимение в чипе (`[ freute sich ]`, `[ sich gefreut ]`).
   * Дистракторы: генерируются динамически в `quizGeneratorService` с ловушками слабых окончаний (`-te`, `ge-...-t`), аблаутными сдвигами корневых гласных и формами соседних глаголов.
   * Валидация:
     * Выполняется автоматически только при заполнении всех 3 слотов.
     * При успехе: позитивная тактильная отдача, задержка 1.2 с для перехода к следующему вопросу. TTS отключен (`speakOnCorrectAnswer` игнорируется).
     * При ошибке: негативная тактильная отдача, подсветка ошибочных слотов красным, отображение грамматической подсказки `VerbFormsGrammarHint` (бейдж класса глагола, аблаутный паттерн гласных `e → i → a`, локализованное правило без дублирования 3 форм).
3. **Хранение прогресса и экран результатов:**
   * Прогресс хранится в MMKV по ключу `@verb_forms_levels_progress` (`Record<string, VerbProgress>`).
   * На экране `QuizResultsScreen`:
     * Успешные упражнения: `gehen — ging — ist gegangen` с зеленой галочкой.
     * Ошибочные упражнения: `gehen — ging — ~hat gegangen~ ist gegangen` с зачеркиванием неверных вариантов и полужирным зеленым шрифтом для исправлений (без скобок).
   * Баннер на экране практики озаглавлен «Неправильные глаголы» (`verbFormsBannerTitle`).
   * Кнопка «Следующий уровень» бесшовно ведет на следующий уровень или чекпоинт.
   * Сброс прогресса интегрирован в `progressService.clearAllProgress()`.

---

### 15. Режим тренировки глаголов с предлогами (Verbs with Prepositions / Preposition Practice)

1. **Архитектура уровней и база данных:**
   * В SQLite создана таблица `preposition_levels`: `id`, `cefr_level`, `subgroup_type` (`'standard' | 'checkpoint' | 'final_test'`), `level_number`, `order_index`, `title`, `verbs_json`.
   * На этапе сборки базы (`scripts/buildDatabase.ts`) 169 глаголов с предложным управлением компилируются в 41 уровень (A1–B2):
     * Стандартные уровни: по 5 глаголов (1 раунд = 5 упражнений).
     * Промежуточные чекпоинты: по 10 глаголов из ранее пройденного диапазона (10 упражнений, 1 раунд).
     * Финальные тесты CEFR: по 15 глаголов соответствующего уровня (15 упражнений, 1 раунд).
2. **Формат упражнения (`preposition_fill`):**
   * Выполняется на базе компонента `SentenceFillExercise` в `VerbQuizScreen`.
   * Адаптивный слот на месте предложной группы в аутентичном предложении:
     * Предлог + артикль / притяжательное местоимение (например, `[ auf den ]`).
     * Слитные формы (например, `[ vom ]`, `[ ins ]`, `[ beim ]`).
     * Одиночный предлог без артикля (например, `[ auf ]`).
   * Генерация дистракторов: 4 варианта в чипах (1 верный + 3 дистрактора):
     * Падежная ловушка (тот же предлог + противоположный падеж: `auf den` vs `auf dem`).
     * Альтернативный предлог того же падежа.
     * Альтернативный предлог противоположного падежа.
     * Слитные формы Dativ vs Akkusativ (`vom` vs `ans`).
   * Озвучка TTS: при правильном ответе озвучивается полное законченное предложение на немецком языке.
   * Подсказка при ошибке: компонент `PrepositionGrammarHint` показывает:
     * Бейдж правила: `[ auf + Akkusativ ]`.
     * Полную грамматическую конструкцию: `warten auf + Akkusativ`.
     * Вопрос к предложной группе: `Worauf? / Auf wen?` (или `Wovon? / Von wem?`).
3. **Хранение прогресса и экран результатов:**
   * Прогресс хранится в MMKV по ключу `@preposition_levels_progress` (`Record<string, VerbProgress>`).
   * На экране `QuizResultsScreen`:
     * Успешные упражнения: полное предложение с полужирным выделением правильного ответа (`Er wartet **auf den** Bus.`) + бейдж правила (`[ auf + Akkusativ ]`) с зеленой галочкой.
     * Ошибочные упражнения: предложение с зачеркиванием неверного ответа и полужирным выделением правильного (`Er kommt bald ~mit dem~ **in das** neue Team.`) + бейдж правила (`[ auf + Akkusativ ]`).
   * Экран списка `PrepositionsPracticeListScreen` оснащен вкладками CEFR (A1–B2), независимой нумерацией с 1 и автоскроллом к актуальному уровню.
   * Промо-карточка `PrepositionPracticeCard` отображается на `PracticeScreen`.
   * Сброс прогресса интегрирован в `progressService.clearAllProgress()`.

---

## 16. Удаленная конфигурация (Remote App Config / `appConfigService`)

1. **Архитектура и таймаут старта (500ms Race):**
   * При старте приложения (`appConfigService.init(500)`) выполняется гонка запроса к удаленному конфигу (`https://das-verb.yapps.studio/app-config.json`) и таймера на 500 мс.
   * Если запрос успешен за $\le 500$ мс: конфиг применяется в памяти и сохраняется в MMKV кэш (`cached_remote_config`).
   * Если запрос превышает 500 мс или падает с ошибкой: приложение не блокируется и мгновенно использует данные из MMKV кэша (или встроенный `assets/app-config.json`, если кэша еще нет).
   * При этом фоновый запрос **не прерывается**: при успешном завершении в фоне он обновляет `currentConfig` в памяти и записывает свежие данные в MMKV кэш для последующих сессий и проверок.
2. **Параметры и управление фичами:**
   * Минимальные и актуальные версии приложения для iOS/Android (`minimum_version`, `latest_version`, `update_url`).
   * Управление дневными лимитами бесплатных квизов (`free_daily_quizzes`) и рекламы (`max_ad_grants_per_day`).
   * Динамическое отключение First-Open Paywall (`disable_first_open_paywall`).

---

## 17. Рекламная архитектура (AdManager, Native Ad, Interstitial Fallback)

1. **Фоновый менеджер рекламы (`AdManager`):**
   * Синглтон `src/ads/adManager.ts` инициализируется при старте приложения (`adManager.init()`).
   * В фоновом режиме параллельно кэширует `RewardedAd` и `InterstitialAd`.
   * Каскадный показ (`showRewardedOrFallback()`):
     1. Если загружен `RewardedAd` $\rightarrow$ показ видео с вознаграждением;
     2. Если `RewardedAd` не готов, но доступен `InterstitialAd` $\rightarrow$ показ межстраничной рекламы как фолбэка;
     3. Если оба не готовы $\rightarrow$ ожидание до 8 секунд (`FALLBACK_TIMEOUT_MS = 8000`);
     4. Если реклама не заполнена за 8 секунд $\rightarrow$ предоставление бесплатного доступа (*grace access*) и аналитическое событие `ad_no_fill`.
2. **Нативный рекламный блок (`PracticeNativeAdCard`):**
   * Размещается на экране практики `PracticeScreen` строго между карточкой смарт-алгоритма (`SmartQuizCard`) и остальными режимами.
   * Скрывается для Premium-пользователей (`isPremium`) и при отключенном флаге `ENABLE_ADS`.
3. **Редизайн главного экрана (`PracticeScreen`):**
   * Порядок блоков: `FeaturedStartCard` $\rightarrow$ `SmartQuizCard` $\rightarrow$ `PracticeNativeAdCard` $\rightarrow$ Сетка 2x2 (`PrefixPracticeCard` + `ConjugationPracticeCard` / `VerbFormsPracticeCard` + `PrepositionPracticeCard`) $\rightarrow$ `ThematicCategoriesSection`.
   * Карточки очищены от всех теней (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation`) для строгого плоского дизайна.

---

## 18. Управление согласием пользователей (Consent Management: Google UMP & iOS ATT)

1. **Единый сервис согласия (`adConsentService`):**
   * Сервис `src/ads/consentService.ts` реализует обязательный протокол согласия Google (GDPR, EEA, UK, Швейцария) и Apple App Tracking Transparency (iOS ATT).
2. **Последовательность инициализации при старте:**
   * При старте приложения (`App.tsx`) вызывается `adConsentService.initialize()`:
     1. Запрашивает статус согласия через `AdsConsent.requestInfoUpdate()`.
     2. Если требуется — загружает и отображает нативную форму согласия Google (`loadAndShowConsentFormIfRequired()`).
     3. На iOS строго соблюдается правило Apple Review 5.1.1(iv): системный диалог `TrackingTransparency.requestTrackingPermissionsAsync()` вызывается **только если согласие в GDPR получено (`OBTAINED`) или не требуется для региона (`NOT_REQUIRED`)**; при отказе в GDPR вызов ATT пропускается.
     4. Инициализирует Google Mobile Ads SDK и фоновый `AdManager`.
3. **Управление конфиденциальностью в Настройках:**
   * В экран `SettingsScreen` добавлен пункт «Настройки конфиденциальности» (`settingsScreen.privacySettings`), вызывающий `adConsentService.showPrivacyOptions()` для изменения настроек согласия пользователем в любой момент.

---

## 19. Офлайн-режим и проверка сети (Offline Mode & `OfflineLimitModal`)

1. **Архитектура проверки подключения к сети:**
   * Сервис `src/services/networkService.ts` использует `@react-native-community/netinfo` (`NetInfo.fetch()`) для проверки `isConnected && isInternetReachable !== false`.
   * При сбоях вызова NetInfo сервис безопасно возвращает `true` (graceful fallback).
2. **Правила запуска квизов в офлайн-режиме:**
   * Пользователи с активной подпиской Premium (`isPremiumEnabled() === true`) имеют неограниченный доступ к тренировкам и квизам в офлайн-режиме.
   * Бесплатные пользователи при отсутствии интернет-соединения не могут запустить квиз; вместо этого отображается модальное окно `OfflineLimitModal`.
   * Вся логика проверки централизована в хуке `useNavigateToQuiz.tsx`, который обслуживает 100% точек входа в квизы приложения (`PracticeScreen`, `QuizResultsScreen`, `VerbsPracticeListScreen`, `PrefixPracticeListScreen`, `ConjugationPracticeListScreen`, `VerbFormsPracticeListScreen`, `PrepositionsPracticeListScreen`).
3. **Модальное окно `OfflineLimitModal`:**
   * Расположено в `src/components/OfflineLimitModal/OfflineLimitModal.tsx` со стилями `OfflineLimitModal.styles.ts`.
   * Содержит:
     * Иконку `cloud-offline`, заголовок (`offlineModal.title`) и пояснительный текст (`offlineModal.message`).
     * Кнопку перехода к оформлению Premium (`offlineModal.premiumButtonWithTrial` / `offlineModal.premiumButtonNoTrial`), управляемую флагом `ENABLE_PREMIUM` и наличием обработчика `onPremiumCTA`.
     * Кнопку «Повторить» (`offlineModal.retry`), которая при восстановлении соединения автоматически закрывает модалку и запускает отложенный квиз (`pendingQuizParamsRef`).
     * Кнопку закрытия и закрытие по тапу на бэкдроп с отправкой аналитических событий.
4. **Отображение преимуществ офлайн-режима в Paywall:**
   * В пейволлах (`PremiumSubscribeSheet` и `FirstOpenPaywallScreen`) добавлен пункт о возможности тренировок офлайн (`premiumSheets.features.offlineModeTitle` / `offlineModeDesc` и `firstOpenPaywall.timeline.today.benefits.offlineMode`).
5. **Телеметрия офлайн-режима:**
   * События: `offline_limit_modal_shown`, `offline_limit_modal_close_clicked`, `offline_limit_modal_premium_clicked`, `premium_limit_modal_purchase_success`.

---

## 20. Актуализация спецификаций и документации (Строго)

* При любых изменениях архитектурных решений, правил именования, форматов файлов или моделей данных **обязательно немедленно обновлять соответствующие спецификации (`specs/*.md`) и данный `GEMINI.md`**.
* Все спецификации и правила проекта **всегда обязаны поддерживаться в 100% актуальном состоянии**.

