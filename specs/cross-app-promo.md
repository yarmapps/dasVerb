# Specification: Cross-App Promotion & Ecosystem Attribution Engine

## 1. Feature Overview & Value Proposition

### 1.1 Purpose
The **Cross-App Promotion Engine** provides high-value internal house ad units promoting companion applications (specifically *der Artikel - German Articles & Nouns*) across the learning ecosystem. It operates in two primary modes:
1. **Fallback House Ad for Free Users**: Replaces blank ad inventory when third-party ad networks return `no-fill`, network errors, or when ads are disabled, preventing layout collapse (Cumulative Layout Shift, Anti-CLS) and retaining learner engagement within our companion ecosystem.
2. **Ecosystem Discovery Card for Premium Users**: Delivers clean, non-intrusive product recommendations tailored to learners expanding their German mastery beyond verbs into nouns, noun genders, and declensions.

### 1.2 Target Outcomes
- **LTV Expansion & Ecosystem Cross-Pollination**: Drives qualified, high-intent German language learners into the partner app (*der Artikel*).
- **Anti-CLS (Cumulative Layout Shift) Guarantee**: Ensures fixed-height card slots (in Dictionary and Practice screens) maintain consistent height regardless of whether a Google AdMob native ad succeeds or fails.
- **Deep Attribution Tracking**: Passes platform-specific attribution parameters (App Store campaign tokens and Google Play install referrers) to measure install volume, conversion rate, and cohort performance.

---

## 2. Architecture & Data Contract

### 2.1 Component Architecture & Slot Injection
The promo unit is encapsulated in `DerArtikelPromoCard`, which is rendered directly inside native ad wrappers (`DictionaryNativeAdCard`, `PracticeNativeAdCard`).

```
+--------------------------------------------------------------------------+
|                     Ad Slot Container (e.g. Practice / Dictionary)       |
+--------------------------------------------------------------------------+
                                     |
                       Is user subscribed (isPremium)?
                                     |
                    +----------------+----------------+
                    |                                 |
                   YES                                NO
                    |                                 |
                    v                                 v
         [DerArtikelPromoCard]              Fetch Google Native Ad
       (Clean House Ad Style)                         |
                                            Did ad load successfully?
                                                      |
                                            +---------+---------+
                                            |                   |
                                           YES                  NO (No-Fill/Offline)
                                            |                   |
                                            v                   v
                                     [AdMob Native Ad]   [DerArtikelPromoCard]
                                                         (Fallback House Ad)
```

### 2.2 Deep Link & Store Attribution Contract
URLs encode platform-specific marketing tags to enable accurate cohort reporting in App Store Connect and Google Play Console.

#### 1. iOS App Store URL Contract:
- **Base URL**: `https://apps.apple.com/app/apple-store/id6760616325`
- **Parameters**:
  - `pt`: Provider Token / Apple Team ID (`128661768`)
  - `ct`: Campaign Token (`das_verb_dictionary` / `das_verb_practice`)
  - `mt`: Media Type (`8` for Software/Apps)
- **Full iOS URL**:
  `https://apps.apple.com/app/apple-store/id6760616325?pt=128661768&ct=das_verb_${source}&mt=8`

#### 2. Android Google Play Store URL Contract:
- **Base URL**: `https://play.google.com/store/apps/details?id=com.yarm.apps.derartikel`
- **Parameters**:
  - `referrer`: URL-encoded UTM parameters:
    - `utm_source=das_verb`
    - `utm_medium=cross_promo`
    - `utm_campaign=${source}`
- **Full Android URL**:
  `https://play.google.com/store/apps/details?id=com.yarm.apps.derartikel&referrer=utm_source%3Ddas_verb%26utm_medium%3Dcross_promo%26utm_campaign%3D${source}`

---

## 3. Comprehensive Business Logic & Calculation Rules

### 3.1 Display Logic
- **In Practice Screen**:
  - Embedded inside `PracticeNativeAdCard`.
  - When native ad fails, is throttled, offline, or for Premium subscribers, `DerArtikelPromoCard` is displayed.
- **In Dictionary Screen**:
  - Embedded inside `DictionaryNativeAdCard` at the end of the search results list.
  - Falls back seamlessly to `DerArtikelPromoCard` on error or no-fill.

### 3.2 Anti-CLS & Layout Stabilization Rules
1. Container dimensions match the native ad block geometry:
   - Outer card padding `Spacing.lg`.
   - Card border `1px solid colors.blockBorder`, border radius `BorderRadius.xl`.
2. Synchronous rendering of `DerArtikelPromoCard` when `hasError` occurs ensures no flashing or blank jumps.

### 3.3 Audio & Tap Feedback
- Every tap on the promo card container triggers:
  1. UI tap sound: `soundService.playTapSound()`.
  2. Analytics dispatch: `cross_promo_clicked` with payload `{ source, target_app: 'der_artikel', is_premium, platform }`.
  3. External store redirection via `Linking.openURL(storeUrl)`.

---

## 4. UI/UX & Design Token Matrix

### 4.1 Card Decomposition & Theme Styling
The promo card uses the project's native theme tokens (`ThemeColors`):

| UI Element | Light Theme Token | Dark Theme Token | Specifications |
| :--- | :--- | :--- | :--- |
| **Card Container** | `colors.blockBackground` | `colors.blockBackground` | Radius `BorderRadius.xl`, padding `Spacing.lg`, border `1px solid colors.blockBorder` |
| **App Icon** | `assets/icons/der-artikel-icon.png` | `assets/icons/der-artikel-icon.png` | Dimensions `44x44`, radius `BorderRadius.md`, marginRight `Spacing.md` |
| **App Title** | `colors.textPrimary` | `colors.textPrimary` | `fontSize: Typography.fontSize.sm`, `fontWeight: Typography.fontWeight.bold`, `lineHeight: 18` |
| **App Subtitle** | `colors.textSecondary` | `colors.textSecondary` | `fontSize: Typography.fontSize.xs`, `lineHeight: 16` |
| **Badge (Free)** | `colors.headerButtonBackground` | `colors.headerButtonBackground` | Text `colors.textMuted`, label "Sponsored" / "Реклама" |
| **Badge (Premium)** | `colors.badgeBackground` | `colors.badgeBackground` | Text `colors.primary`, label "Recommended" / "Рекомендация" |

---

## 5. Monetization & Ads Paradigm

### 5.1 Free Tier Ad Fallback
- Replaces un-filled or errored native ad slots with `DerArtikelPromoCard`.
- Shows a subtle "Реклама" / "Ad" badge in top right for compliance when displayed in ad inventory.

### 5.2 Premium Subscriber Experience
- For subscribers, third-party ads are removed entirely.
- In `PracticeScreen` or `DictionaryScreen`, the companion app card serves as an educational recommendation ("Рекомендация" / "Recommended Companion"), guiding the learner to noun mastery.

---

## 6. Notifications & Automation Pipeline
Not applicable to inline promo cards.

---

## 7. Analytics & Observability

### 7.1 Telemetry Events
| Event Name | Trigger | Parameters |
| :--- | :--- | :--- |
| `cross_promo_shown` | Promo card mounted | `source` (`'practice'` \| `'dictionary'`), `target_app` (`'der_artikel'`), `is_premium` (`boolean`), `platform` (`'ios'` \| `'android'`) |
| `cross_promo_clicked` | User taps card | `source` (`'practice'` \| `'dictionary'`), `target_app` (`'der_artikel'`), `is_premium` (`boolean`), `platform` (`'ios'` \| `'android'`) |

---

## 8. Localization Dictionary

```json
{
  "crossPromo": {
    "derArtikel": {
      "title": "der Artikel: German Articles",
      "subtitle": "Master der, die, das articles and declension with mnemonics and interactive quizzes in our companion app.",
      "cta": "Get App",
      "badge": "Recommended"
    }
  }
}
```

---

## 9. QA & Debug Verification Checklist

- [ ] **No-Fill Fallback Transition**:
  - Simulate AdMob load failure in `PracticeNativeAdCard` / `DictionaryNativeAdCard`.
  - Verify `DerArtikelPromoCard` renders immediately without layout shift.
- [ ] **Store Linking Verification**:
  - Tap card on iOS -> opens `der Artikel` App Store page.
  - Tap card on Android -> opens `der Artikel` Google Play page.
- [ ] **Theme Switching**:
  - Toggle between dark and light themes; verify borders and text colors match `ThemeColors`.
- [ ] **Analytics Dispatch**:
  - Verify `cross_promo_shown` and `cross_promo_clicked` events in analytics logs.
