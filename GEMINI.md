# dasVerb — Инструкции для Gemini / Агентов

Проект **dasVerb** — интерактивное мобильное приложение для изучения и тренировки немецких глаголов (уровни A1–B2).

---

## 📚 Архитектура и стандарты проекта

При написании кода, создании компонентов, стилизации или генерации данных строго следуйте утвержденным спецификациям:

1. **Архитектура и стек проекта:**
   * См. спецификацию: [`specs/project-architecture.md`](file:///Users/alexander.yarmosh/yapps/dasVerb/specs/project-architecture.md)
   * Стек: React Native, Expo, TypeScript, `expo-sqlite`, модульные стили `[ComponentName].styles.ts` с поддержкой тем (`ThemeColors`), ESLint, Stylelint, Jest.
   * **Структура компонентов:** каждый компонент и экран обязан иметь собственную папку (`src/components/Name/Name.tsx`, `Name.styles.ts`).
   * **Никаких `export default`:** только именованные экспорты (`export function Component()`).
   * **Никаких `index.ts` файлов:** импорты осуществляются напрямую из целевого файла компонента (`import { Name } from '../components/Name/Name'`).
   * **Обязательная деструктуризация:** использовать `const { prop } = object;` вместо `object.prop`.
   * **Понятные и осмысленные имена переменных:** никаких `pCase`, `dCase`, `q`, `t`, `val` — только полные описательные имена (`formattedPrepositionCase`, `trimmedSearchQuery`, `languageCode`).
   * **Никаких вложенных тернарников:** запрещены `a ? b : c ? d : e` (`unicorn/no-nested-ternary`). Использовать Object map или `switch`.
   * **Корневой контейнер экранов (`ScreenBackground`):** все экраны обязаны использовать `<ScreenBackground>` в корне. Запрещено использовать `<SafeAreaView>` как корень экрана (на Android вызывает схлопывание контента при возврате назад). Insets обрабатываются через `<ScreenHeader>`.

2. **Правила именования файлов и идентификаторов:**
   * См. спецификацию: [`specs/file-naming-rules.md`](file:///Users/alexander.yarmosh/yapps/dasVerb/specs/file-naming-rules.md)
   * Ключевое: транслитерация умлаутов (`ö` $\rightarrow$ `oe`, `ä` $\rightarrow$ `ae`, `ü` $\rightarrow$ `ue`, `ß` $\rightarrow$ `ss`), суффикс `_sich` для возвратных глаголов (`freuen_sich.json`).

3. **Генерация новых глаголов (Строго):**
   * См. спецификацию: [`specs/verb-generation-guide.md`](file:///Users/alexander.yarmosh/yapps/dasVerb/specs/verb-generation-guide.md)
   * **Обязательная полнота генерации:** генерировать карточки для ВСЕХ общеупотребительных комбинаций (4 грамматических случая: двойное управление Dativ+Akkusativ, Wechselpräpositionen, разные предлоги, омографы/позиционные пары).
   * **Обязательная структура предложений (8 примеров):** ровно 8 аутентичных предложений на карточку: 5 в `Präsens`, 1 в `Präteritum`, 1 в `Perfekt`, 1 в `Imperativ`. В совокупности предложения **обязаны охватывать ВСЕ 6 личных местоимений** (`ich`, `du`, `er/sie/es`, `wir`, `ihr`, `sie/Sie`) и форму повелительного наклонения.
   * **Частотный ранг (`frequency_rank`):** обязательное поле для сортировки глаголов по реальной частотности употребления в немецком языке (Routledge Frequency Dictionary / Goethe-Institut).
   * **Строгие правила Satzklammer (`bracket_parts`):** в `bracket_parts` включается ТОЛЬКО сам изучаемый глагол (и его рамка в Perfekt / приставка). Запрещено включать предлоги, наречия или зависимые чужие инфинитивы! Ровно 2 элемента для `Perfekt` и отделяемых (`separable`) глаголов; ровно 1 элемент для всех остальных глаголов (простые неотделяемые, возвратные, модальные) в `Präsens`, `Präteritum`, `Imperativ`. Все элементы `bracket_parts`, `dativ_parts` и `akkusativ_parts` обязаны буквально присутствовать в строке `german`.
   * **Модальные глаголы (`verb_class: "modal"`):** в карточках модальных глаголов изучается и тренируется **исключительно сам модальный глагол**; зависимые инфинитивы (`sprechen`, `helfen`, `lösen`) остаются обычным контекстным текстом предложения и не входят в `bracket_parts`.

4. **Модель данных и TypeScript-типы:**
   * См. типы: [`docs/verb.types.ts`](file:///Users/alexander.yarmosh/yapps/dasVerb/docs/verb.types.ts)
   * Все карточки в папке `data/*.json` должны строго валидироваться интерфейсом `VerbCard` (включая обязательное свойство `frequency_rank`).

5. **Интернационализация и локализация (`react-intl`, Строго):**
   * См. спецификацию: [`specs/i18n-guidelines.md`](file:///Users/alexander.yarmosh/yapps/dasVerb/specs/i18n-guidelines.md)
   * Все переводы извлекаются исключительно через `useIntl().formatMessage({ id: 'key' })`.
   * **СТРОГИЙ ЗАПРЕТ `defaultMessage`:** категорически запрещено передавать свойство `defaultMessage` в `formatMessage` или `<FormattedMessage>`. Все тексты обязаны находиться исключительно в файлах `src/translations/*.json`. Отсутствие `defaultMessage` контролируется unit-тестом `src/__tests__/i18n.test.ts`.
   * **Языки по умолчанию (ТОЛЬКО EN и RU):** новые ключи и переводы по умолчанию добавляются **СТРОГО ТОЛЬКО для английского (`en.json`) и русского (`ru.json`) языков** (а также в `Translation` тип). Переводы на все остальные языки (`es`, `fr`, `it`, `pl`, `pt`, `tr`, `uk`, `ar`, `fa`) выполняются **только по прямому и явному указанию пользователя** (для остальных языков работает автоматический fallback на английский).

6. **Аналитика и телеметрия (Firebase & Google Analytics 4):**
   * См. спецификацию: [`specs/project-architecture.md`](file:///Users/alexander.yarmosh/yapps/dasVerb/specs/project-architecture.md)
   * Мобильная аналитика работает через единый SDK `@react-native-firebase/app` и `@react-native-firebase/analytics` (GA4 App stream).
   * Трекинг осуществляется строго через фасад [`src/services/analyticsService.ts`](file:///Users/alexander.yarmosh/yapps/dasVerb/src/services/analyticsService.ts) с типизированными событиями [`src/types/analytics.types.ts`](file:///Users/alexander.yarmosh/yapps/dasVerb/src/types/analytics.types.ts).
   * Для тестирования и Expo Go предусмотрен fallback-мок (`src/analytics/mock.ts`), управляемый флагом `ENABLE_ANALYTICS` в `src/config/features.js`.

7. **Синхронизация и актуализация правил (Строго):**
   * При любых изменениях логики, архитектурных решений, структуры данных или формата именования **ОБЯЗАТЕЛЬНО немедленно обновлять соответствующие файлы спецификаций (`specs/*.md`) и данный `GEMINI.md`**.
   * Все правила, гайдлайны и спецификации проекта **всегда обязаны поддерживаться в 100% актуальном состоянии**.

---

## 🛠 Обязательные команды верификации

Перед завершением любой задачи обязательно запускайте проверки:
```bash
yarn validate:data # Проверка грамматики и bracket_parts в карточках
yarn build:db     # Сборка SQLite базы
yarn type-check   # Проверка TypeScript
yarn lint         # Проверка ESLint
yarn lint:style   # Проверка Stylelint
yarn test         # Запуск тестов Jest
```

---

## 🚫 Правила работы с Git (Строго)

* **Никаких автоматических коммитов, мерджей и пушей (`git commit`, `git merge`, `git push`)!**
* Выполнять Git-операции изменения истории или отправки в удаленный репозиторий разрешено **только по прямому и явному указанию пользователя**.

---

## 📂 Структура директорий

* `data/` — исходные JSON-карточки глаголов (1 файл на 1 глагол/значение).
* `docs/` — документация схемы типов.
* `specs/` — архитектурные спецификации, правила именования и гайдлайны разработки.
* `src/` — исходный код приложения (компоненты, экраны, сервисы, стили).
