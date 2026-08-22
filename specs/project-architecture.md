# Архитектура и стандарты разработки dasVerb (specs/project-architecture.md)

Данный документ фиксирует технологический стек, стандарты структуры кода, стилизации и процессов верификации для проекта **dasVerb**.

---

## 1. Технологический стек

* **Фреймворк:** React Native (Expo SDK 52+)
* **Язык:** TypeScript (строгий режим `strict: true`)
* **Стилизация:** Модульные стили компонентов (`[ComponentName].styles.ts`) на базе `StyleSheet.create` с поддержкой Светлой и Темной темы (`ThemeColors`).
* **База данных:** `expo-sqlite` (для хранения каталога глаголов, прогресса и SRS-повторений).
* **Контроль качества:** ESLint, Prettier, Stylelint, Jest.

---

## 2. Структура проекта

```
dasVerb/
├── data/                  # Исходные JSON-карточки глаголов (1 файл на 1 глагол)
├── docs/                  # Документация и типы данных (verb.types.ts, file-naming-rules.md)
├── specs/                 # Спецификации архитектуры и фичей проекта
├── src/
│   ├── components/        # UI-компоненты (Каждый компонент в своей папке или с парой .styles.ts)
│   ├── screens/           # Экраны приложения
│   ├── styles/            # Темизация (светлая/темная тема, типографика, отступы)
│   │   ├── themeColors.ts # Палитра темной и светлой тем (включая цвета падежей и грамматики)
│   │   ├── typography.ts  # Шрифты и размеры текста
│   │   ├── spacing.ts     # Отступы и радиусы
│   │   └── variables.ts   # Глобальные токены и константы интерфейса
│   ├── services/          # Сервисы (база данных, SRS-алгоритм, кэш)
│   ├── types/             # Экспорт TypeScript-типов
│   └── __tests__/         # Автоматические тесты (валидация данных, юнит-тесты)
├── App.tsx                # Точка входа в приложение
├── App.styles.ts          # Стили корневого экрана
├── GEMINI.md              # Правила и указания для AI-агентов
├── package.json
└── tsconfig.json
```

---

## 3. Стандарты стилизации и темизации

1. **Никаких сырых инлайн-стилей:** Все стили выносятся в отдельный файл `[ComponentName].styles.ts`.
2. **Фабрика стилей под тему:**
   ```typescript
   import { StyleSheet } from 'react-native';
   import { ThemeColors } from '../styles/themeColors';
   import { Spacing, Typography } from '../styles/variables';

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
3. **Грамматические токены цвета:** В теме предусмотрены выделенные семантические цвета для немецкой грамматики:
   * Падежи: `nominativ`, `akkusativ`, `dativ`, `genitiv`.
   * Вспомогательные глаголы: `habenBadge`, `seinBadge`.
   * Глагольная рамка (*Satzklammer*): `bracketLeft`, `bracketRight`.

---

## 4. Обязательные скрипты верификации (Yarn)

Перед каждым коммитом или сдачей задачи должны выполняться проверки:

* `yarn type-check` (или `yarn typecheck`) — проверка типов TypeScript (`tsc --noEmit`).
* `yarn lint` — статический анализ кода (ESLint).
* `yarn lint:fix` — автоисправление ошибок форматирования.
* `yarn lint:style` — проверка стилей через Stylelint.
* `yarn format` — форматирование Prettier.
* `yarn test` — запуск тестов Jest.
