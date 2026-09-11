# Mobile Growth, ASO & Automation Framework (MG)

Гайдлайн и спецификация по максимизации органической видимости (ASO), конверсии (CR), поискового ранжирования в App Store/Google Play и эффективности Apple Search Ads (ASA) для проекта **dasVerb**.

---

## 🏛 5 Столпов Mobile Growth (Pillars)

### Pillar 1: High-Conversion ASO & Cross-Storefront Metadata Architecture
1. **Title / Display Name (≤ 30 chars)**:
   - Formula: `[App Name]: [Primary Root Keyword]` (e.g. `dasVerb: German Verbs`).
   - The primary keyword MUST be placed at the very front of the indexing hierarchy.
2. **Subtitle (≤ 30 chars)**:
   - Formula: `[Secondary Keyword & Concrete Benefit]` (e.g. `Learn Verbs, Quiz & Cases`).
   - Zero keyword duplication between Title, Subtitle, and Keywords field.
3. **Keywords Field (≤ 100 bytes)**:
   - Comma-separated, NO spaces after commas.
   - Only individual words, singular forms, no stop words (`app`, `free`, `the`), no duplicate words present in Title or Subtitle.
4. **Cross-Storefront Indexing Strategy (26 App Store Locales)**:
   - Leverage secondary language indexing in primary markets (e.g. `es-MX` + `en-US` in the US; `fr-CA` in North America; `pt-BR` in Global Portuguese; `ar-SA` across MENA).
   - Maintain strict Fastlane metadata files across all 26 locales (`fastlane/metadata/ios/<locale>/`).

---

### Pillar 2: In-App Purchase & Subscription Search Indexing Automation
In-app purchases and subscriptions are indexed by Apple's search algorithm and can appear directly in search results.

1. **Product Name Strategy (≤ 30 chars)**:
   - Embed the primary root keyword + clear value tier across all approved products:
     - Lifetime Non-Consumable: `[Primary Keyword]: Lifetime Premium`
     - Yearly Subscription: `[Primary Keyword]: 1 Year Premium`
     - Monthly Subscription: `[Primary Keyword]: 1 Month Premium`
   - Use "Premium" instead of "Access" to convey value without implying the free tier is locked.
2. **Product Description Strategy (≤ 45 chars)**:
   - Focus 100% on concrete perks: No ads, unlimited features, custom content, quizzes.
   - Formula: `No ads, unlimited custom quizzes & words` (or localized equivalent).
3. **Subscription Group Architecture**:
   - Set **Yearly Subscription to Level 1** (highest tier) and **Monthly to Level 2** (or both at Level 1).
   - Prevents iOS from treating an upgrade from monthly to annual as a delayed downgrade.
4. **REST API Automation**:
   - Maintain a Node.js script using App Store Connect REST API with JWT authentication (`ES256`, `.p8` key) to programmatically sync all 26 locales across all IAP products and subscription groups.

---

### Pillar 3: Apple Search Ads (ASA) Optimization Playbook
1. **High-Intent Exact Match Campaigns**:
   - Group high-intent, brand, and category root keywords with `Exact Match` (e.g. `[core keyword]`).
   - Customer Types: Select **All Users** (not New Users Only) to capture switchers and re-engage churned users.
   - Search Match: **OFF** on exact match campaigns.
2. **Discovery & Mining Campaigns**:
   - Run a secondary low-bid Discovery Campaign with `Broad Match` and `Search Match: ON`.
   - Add all active exact match keywords as **Negative Exact** to avoid self-cannibalization.
3. **Budget Scaling**:
   - If TTR > 10%, CR > 40%, and CPA is profitable, increase daily budget to avoid capping high-converting volume mid-day.

---

### Pillar 4: Automated Screenshot Pipeline (Skia / Canvas / Sharp)
1. **Specs & Quality**:
   - iOS: `1242 x 2688 px` (6.5" / 6.9" Super Retina).
   - Typography: Render captions with high-legibility fonts, optical cap height alignment, dynamic vertical and horizontal bounding-box centering.
   - Rich styling tags support: `<bold>`, `<light>`, `<semibold>`, `<color="#hex">`.
2. **Fastlane Automation**:
   - Fully automated build and screenshot distribution via `fastlane ios release_production` and `yarn generate:screenshots`.

---

### Pillar 5: Execution Protocol
1. **Data-Driven Audits**: Always audit rankings across global storefronts before and after changes.
2. **Zero Assumptions**: Validate character limits (≤ 30 name, ≤ 45 desc, ≤ 100 bytes keywords) in code before sending API requests.
3. **Surgical Automation**: Prefer clean API scripts with error recovery and logging over manual web portal configuration.
