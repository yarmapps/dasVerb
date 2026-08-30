# dasVerb — Руководство по интернационализации (i18n)

В проекте **dasVerb** интернационализация реализована на базе официальной библиотеки **`react-intl`** (FormatJS).

---

## 1. Архитектура и стек i18n

* **Библиотека:** `react-intl` (FormatJS).
* **Провайдер:** дерево компонентов приложения обязательно обернуто в `<IntlProvider locale={locale} messages={messages}>` (внутри `LocaleProvider`).
* **Файлы переводов:** `src/translations/{locale}.json` (11 поддерживаемых языков: `en`, `de`, `es`, `fr`, `it`, `pl`, `pt`, `ru`, `tr`, `uk`, `ar`, `fa`).

---

## 2. Использование переводов в компонентах

Для извлечения локализованных строк используется хук `useIntl`:

```typescript
import { useIntl } from 'react-intl';

export function MyComponent() {
  const intl = useIntl();

  return (
    <Text>{intl.formatMessage({ id: 'practiceScreen.title' })}</Text>
  );
}
```

Для сообщений с переменными:
```typescript
const message = intl.formatMessage(
  { id: 'verbsPracticeListScreen.verbCount' },
  { count: 46 }
);
```

---

## 3. 🚫 СТРОГИЙ ЗАПРЕТ `defaultMessage` (КРИТИЧЕСКИ ВАЖНО)

* **`defaultMessage` КАТЕГОРИЧЕСКИ ЗАПРЕЩЕН во всем проекте.**
* ❌ **СТРОГО ЗАПРЕЩЕНО:**
  ```typescript
  // НЕЛЬЗЯ ТАК ДЕЛАТЬ!
  intl.formatMessage({ id: 'screen.title', defaultMessage: 'Practice' });
  ```
* ✅ **ЕДИНСТВЕННО ПРАВИЛЬНЫЙ ФОРМАТ:**
  ```typescript
  // ТОЛЬКО ТАК:
  intl.formatMessage({ id: 'screen.title' });
  ```
* **Причина:** Все переводы обязаны храниться централизованно в JSON-файлах словарей `src/translations/*.json`. Дублирование строк по кодовой базе в качестве `defaultMessage` приводит к рассинхронизации текстов, размытию единого источника правды и ошибкам локализации.
* **Автоматический контроль:** отсутствие `defaultMessage` во всей директории `src/` строго проверяется автоматическим unit-тестом `src/__tests__/i18n.test.ts`.

---

## 4. Добавление новых ключей переводов

При добавлении нового ключа в интерфейс:
1. Добавить поле в TypeScript-интерфейс `Translation` в [`src/types/intl.ts`](../src/types/intl.ts).
2. Добавить перевод во все 11 JSON-файлов в директории `src/translations/*.json`.
3. Запустить `yarn test`, чтобы убедиться в прохождении тестов полноты переводов.
