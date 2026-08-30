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

2. **Правила именования файлов и идентификаторов:**
   * См. спецификацию: [`specs/file-naming-rules.md`](file:///Users/alexander.yarmosh/yapps/dasVerb/specs/file-naming-rules.md)
   * Ключевое: транслитерация умлаутов (`ö` $\rightarrow$ `oe`, `ä` $\rightarrow$ `ae`, `ü` $\rightarrow$ `ue`, `ß` $\rightarrow$ `ss`), суффикс `_sich` для возвратных глаголов (`freuen_sich.json`).

3. **Генерация новых глаголов (Строго):**
   * См. спецификацию: [`specs/verb-generation-guide.md`](file:///Users/alexander.yarmosh/yapps/dasVerb/specs/verb-generation-guide.md)
   * **Обязательная полнота генерации:** генерировать карточки для ВСЕХ общеупотребительных комбинаций (4 грамматических случая: двойное управление Dativ+Akkusativ, Wechselpräpositionen, разные предлоги, омографы/позиционные пары).
   * Только чистые предлоги в `rektion.preposition` (`"in"`, `"an"`, `"auf"`, `"mit"`, `"zu"` — никаких `im`, `am`, `zum`!).
   * Цветовая разметка в предложениях: `bracket_parts` (глагол), `dativ_parts` (Dativ, фиолетовый), `akkusativ_parts` (Akkusativ, синий). Обязательно 3-е предложение в Imperativ.

4. **Модель данных и TypeScript-типы:**
   * См. типы: [`docs/verb.types.ts`](file:///Users/alexander.yarmosh/yapps/dasVerb/docs/verb.types.ts)
   * Все карточки в папке `data/*.json` должны строго валидироваться интерфейсом `VerbCard`.

5. **Интернационализация и локализация (`react-intl`, Строго):**
   * См. спецификацию: [`specs/i18n-guidelines.md`](file:///Users/alexander.yarmosh/yapps/dasVerb/specs/i18n-guidelines.md)
   * Все переводы извлекаются исключительно через `useIntl().formatMessage({ id: 'key' })`.
   * **СТРОГИЙ ЗАПРЕТ `defaultMessage`:** категорически запрещено передавать свойство `defaultMessage` в `formatMessage` или `<FormattedMessage>`. Все тексты обязаны находиться исключительно в файлах `src/translations/*.json`. Отсутствие `defaultMessage` контролируется unit-тестом `src/__tests__/i18n.test.ts`.

6. **Синхронизация и актуализация правил (Строго):**
   * При любых изменениях логики, архитектурных решений, структуры данных или формата именования **ОБЯЗАТЕЛЬНО немедленно обновлять соответствующие файлы спецификаций (`specs/*.md`) и данный `GEMINI.md`**.
   * Все правила, гайдлайны и спецификации проекта **всегда обязаны поддерживаться в 100% актуальном состоянии**.

---

## 🛠 Обязательные команды верификации

Перед завершением любой задачи обязательно запускайте проверки:
```bash
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
