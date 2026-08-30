# Правила именования файлов глаголов (File Naming Conventions)

Данный документ регламентирует структуру идентификаторов (`id`) и правила именования JSON-файлов для базы глаголов в проекте **dasVerb**.

---

## 1. Базовые принципы

1. **Нижний регистр (lowercase):** все имена файлов и идентификаторы записываются только строчными латинскими буквами.
2. **Разделитель:** пробелы и дефисы запрещены, в качестве разделителя используется нижнее подчеркивание `_`.
3. **Расширение:** `.json`.
4. **Полнота комбинаций управлений:** при добавлении глагола, имеющего несколько управлений с предлогами, **обязательно генерируются отдельные карточки для всех его общеупотребительных комбинаций**.

---

## 2. Транслитерация немецких спецсимволов и умлаутов

Для обеспечения кроссплатформенной стабильности в Git, macOS, Linux, Windows, iOS и Android все специфические немецкие символы в именах файлов и `id` транслитерируются по стандартным правилам:

| Символ в инфинитиве | Замена в имени файла / id | Пример инфинитива | Имя файла |
| :---: | :---: | :---: | :---: |
| **ä** | `ae` | *ändern* | `aendern.json` |
| **ö** | `oe` | *können* | `koennen.json` |
| **ü** | `ue` | *üben* | `ueben.json` |
| **ß** | `ss` | *schließen* | `schliessen.json` |

> 📌 **Важно:** Внутри самого JSON-файла в полях `"infinitive"`, `"sentences"`, `"conjugation"` и др. используется оригинальное немецкое написание с умлаутами (*„können“*, *„schließen“*).

---

## 3. Возвратные глаголы (Reflexive Verben)

Для возвратных глаголов частица `sich` всегда добавляется в виде **суффикса** через нижнее подчеркивание `_sich`:

* `interessieren_sich.json` (инфинитив: *sich interessieren*)
* `konzentrieren_sich.json` (инфинитив: *sich konzentrieren*)
* `waschen_sich.json` (инфинитив: *sich waschen*)

---

## 4. Именование файлов при нескольких управлениях и предлогах

Когда глагол имеет несколько вариантов управления, имя файла и его `id` строятся по правилу **минимально необходимой дифференциации**:

### А. Для данного падежа у глагола только ОДИН вариант/предлог (`[verb]_[case]`):
* Если в рамках падежа нет коллизии, предлог в имя файла НЕ добавляется:
  * `sprechen_akk.json` (*sprechen über + Akkusativ* — так как для Akkusativ у *sprechen* только один предлог `über`).
  * `warten_akk.json` (*warten auf + Akkusativ* — только один предлог `auf`).
  * `helfen_dat.json` (*helfen + Dativ* — только один прямой падеж).

### Б. Для одного и того же падежа есть НЕСКОЛЬКО разных предлогов (`[verb]_[case]_[prep]`):
* Если в рамках одного падежа есть несколько предлогов, добавляется суффикс предлога для устранения коллизии:
  * `sprechen_dat_mit.json` (*sprechen mit + Dativ*)
  * `sprechen_dat_von.json` (*sprechen von + Dativ*)
  * `denken_akk_an.json` (*denken an + Akkusativ*)
  * `denken_akk_ueber.json` (*denken über + Akkusativ*)

### В. Возвратные глаголы с коллизиями (`[verb]_sich_[case]_[prep]` или `[verb]_sich_[case]`):
* `freuen_sich_akk_auf.json` (*sich freuen auf + Akkusativ*)
* `freuen_sich_akk_ueber.json` (*sich freuen über + Akkusativ*)
* `interessieren_sich_akk.json` (*sich interessieren für + Akkusativ* — единственный предлог `für`).

### Г. Прямой падеж / Омографы (`[verb]_[case]`):
* `haengen_dat.json` — висеть (сильный глагол: *hing, gehangen*, Dativ)
* `haengen_akk.json` — вешать (слабый глагол: *hängte, gehängt*, Akkusativ)

---

## 5. Сводная таблица примеров

| Тип глагола | Инфинитив и управление | ID / Имя файла |
| :--- | :--- | :--- |
| Обычный регулярный | *machen (+ Akk)* | `machen.json` |
| С умлаутом | *können* | `koennen.json` |
| С эсцет (ß) | *schließen* | `schliessen.json` |
| С отделяемой приставкой | *anrufen (+ Akk)* | `anrufen.json` |
| Несколько предлогов | *sprechen (mit + Dat)* | `sprechen_dat_mit.json` |
| Несколько предлогов | *sprechen (über + Akk)* | `sprechen_akk.json` |
| Несколько предлогов | *sprechen (von + Dat)* | `sprechen_dat_von.json` |
| Возвратный с предлогом | *sich freuen (auf + Akk)* | `freuen_sich_akk_auf.json` |
| Возвратный с предлогом | *sich freuen (über + Akk)* | `freuen_sich_akk_ueber.json` |
| Омограф с разным спряжением (Dativ) | *hängen (висеть)* | `haengen_dat.json` |
| Омограф с разным спряжением (Akkusativ) | *hängen (вешать)* | `haengen_akk.json` |
| Омограф с одинаковым спряжением (Akkusativ) | *stecken (засовывать)* | `stecken_akk.json` |
| Омограф с одинаковым спряжением (Dativ) | *stecken (торчать)* | `stecken_dat.json` |
