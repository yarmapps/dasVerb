# dasVerb — Инструкции для Gemini / Агентов

Проект **dasVerb** — интерактивное мобильное приложение для изучения и тренировки немецких глаголов (уровни A1–B2).

---

## 📚 Архитектура и стандарты проекта

При написании кода, создании компонентов, стилизации или генерации данных строго следуйте утвержденным спецификациям:

1. **Архитектура и стек проекта:**
   * См. спецификацию: [`specs/project-architecture.md`](file:///Users/alexander.yarmosh/yapps/dasVerb/specs/project-architecture.md)
   * Стек: React Native, Expo, TypeScript, `expo-sqlite`, модульные стили `[ComponentName].styles.ts` с поддержкой тем (`ThemeColors`), ESLint, Stylelint, Jest.

2. **Правила именования файлов и идентификаторов:**
   * См. спецификацию: [`docs/file-naming-rules.md`](file:///Users/alexander.yarmosh/yapps/dasVerb/docs/file-naming-rules.md)
   * Ключевое: транслитерация умлаутов (`ö` $\rightarrow$ `oe`, `ä` $\rightarrow$ `ae`, `ü` $\rightarrow$ `ue`, `ß` $\rightarrow$ `ss`), суффикс `_sich` для возвратных глаголов (`freuen_sich.json`).

3. **Модель данных и TypeScript-типы:**
   * См. типы: [`docs/verb.types.ts`](file:///Users/alexander.yarmosh/yapps/dasVerb/docs/verb.types.ts)
   * Все карточки в папке `data/*.json` должны строго валидироваться интерфейсом `VerbCard`.

---

## 🛠 Обязательные команды верификации

Перед завершением любой задачи обязательно запускайте проверки:
```bash
yarn type-check   # Проверка TypeScript
yarn lint         # Проверка ESLint
yarn lint:style   # Проверка Stylelint
yarn test         # Запуск тестов Jest
```

---

## 📂 Структура директорий

* `data/` — исходные JSON-карточки глаголов (1 файл на 1 глагол/значение).
* `docs/` — документация схемы типов и правил транслитерации.
* `specs/` — архитектурные спецификации и гайдлайны разработки.
* `src/` — исходный код приложения (компоненты, экраны, сервисы, стили).
