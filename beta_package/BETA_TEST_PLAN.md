# GovScheme Controlled Beta Test Plan

**Version:** 1.0.0-beta  
**Environment:** Staging / Controlled Pilot (Isolated from Production)  
**Target Release:** GovScheme Web Platform  
**Target Audience:** Pilot Testers, CSC (Common Service Centre) Kiosk Operators, QA Leads  

---

## 1. Executive Summary and Scope

The GovScheme Controlled Beta Test Plan provides an operational framework to validate the platform's reliability, accessibility, multilingual fidelity, and eligibility logic across diverse citizen scenarios.

### Core Testing Scope
1. **Multilingual Localization:** English (`en`) and 6 supported Indian-language locales: Hindi (`hi`), Tamil (`ta`), Telugu (`te`), Malayalam (`ml`), Marathi (`mr`), and Gujarati (`gu`).
2. **Search and Discovery:** Positive thematic queries, negative category/state filters, and graceful handling of invalid/fake queries.
3. **Deterministic Eligibility Evaluation:** Verifying satisfied (`ELIGIBLE_POTENTIAL_MATCH`), unsatisfied (`DOES_NOT_MATCH`), and incomplete (`NEEDS_MORE_INFORMATION`) statuses against the 75-scheme canonical catalogue.
4. **Synthetic Document Vault & Isolated Authorization:** Verification of document uploads and tenant isolation using synthetic documents without collecting or storing real citizen PII.
5. **Multi-Device Responsiveness:** Testing from 320px (compact mobile / feature touch) to 1440px (desktop / CSC kiosk terminal).
6. **Accessibility & Keyboard Navigation:** Screen-reader labels, focus management, modal focus trapping, and keyboard navigation.
7. **External Redirect Integrity:** Clear advisory disclaimers and verified official application links.

---

## 2. Synthetic Citizen Personas & Deterministic Expected Outcomes

> **Important:** All synthetic personas use artificial data. No real citizen names, Aadhaar numbers, or contact details may be used in testing.  
> Expected results are computed and verified directly using the canonical 75-scheme rule engine (`server/services/schemeRecommendationEngine.js`).

```
+----------------------------------------------------------------------------------------------------+
|                                    SYNTHETIC PERSONA TEST MATRIX                                   |
+---+----------------------+-----+--------+-------------+-------------+----------+-----------+-------+
| # | Persona Name         | Age | Gender | State       | Occupation  | Income   | Cat. / Ed | Match |
+---+----------------------+-----+--------+-------------+-------------+----------+-----------+-------+
| 1 | Ramesh Patel         | 48  | Male   | Gujarat     | Farmer      | ₹95,000  | OBC / 10th| 27/75 |
| 2 | Ananya Sundaram      | 19  | Female | Tamil Nadu  | Student     | ₹110,000 | BC / UG   | 24/75 |
| 3 | Leela Ben            | 67  | Female | Gujarat     | Artisan     | ₹55,000  | Gen / Lit | 16/75 |
| 4 | Mohammad Tariq       | 35  | Male   | Delhi       | St. Vendor  | ₹120,000 | Gen / 8th | 18/75 |
| 5 | Sunita Sharma (Anon) | --  | Female | --          | --          | --       | -- / --   | 2/75  |
+---+----------------------+-----+--------+-------------+-------------+----------+-----------+-------+
```

### Persona 1: Ramesh Patel — Rural Marginal Farmer
* **Profile Attributes:**
  * **Age:** 48 | **Gender:** Male | **State:** Gujarat | **Location:** Rural
  * **Occupation:** Farmer | **Annual Income:** ₹95,000 | **Land Holding:** 2.5 Acres
  * **Social Category:** OBC | **Disability:** None | **Education:** 10th Pass
  * **Synthetic Documents:** Synthetic Aadhaar, Synthetic Bank Passbook, Synthetic 7/12 Land Record
* **Deterministic Engine Verification:**
  * **Eligible Potential Matches (27 Schemes):**
    * `pm-kisan` (PM Kisan Samman Nidhi) — Satisfies: Farmer status, Land holding ≤ 2 hectares, Income criteria.
    * `pmay-g` (PMAY Gramin) — Satisfies: Rural resident, low income, farmer category.
    * `pmjay-ayushman` (Ayushman Bharat PM-JAY) — Satisfies: Income ≤ ₹2,50,000.
    * `mgnrega` (MGNREGA Rural Employment) — Satisfies: Adult rural citizen.
    * `pm-fasal-bima` (PMFBY Crop Insurance) — Satisfies: Farmer with agricultural land.
    * `agri-kisan-credit-card` (KCC) — Satisfies: Eligible farmer/cultivator.
    * `house-pm-surya-ghar-solar-rooftop` — Satisfies: Household income criteria.
  * **Excluded / Does Not Match (48 Schemes):**
    * `pm-ujjwala` — Excluded: Scheme restricted to Female citizens.
    * `sukanya-samriddhi` — Excluded: Age 48 is outside eligible girl-child range (0–10 years).
    * `nsap-old-age-pension` — Excluded: Age 48 is below senior threshold (60+ years).
    * `pm-vishwakarma` — Excluded: Restricted to traditional craft occupations (Artisan, Carpenter, etc.).
    * `tn-pudhumai-penn` — Excluded: State mismatch (Gujarat vs Tamil Nadu) and Gender/Student mismatch.
  * **Information Needed (0 Schemes):** All profile dimensions provided.

---

### Persona 2: Ananya Sundaram — College Undergraduate Student
* **Profile Attributes:**
  * **Age:** 19 | **Gender:** Female | **State:** Tamil Nadu | **Location:** Semi-Urban
  * **Occupation:** Student | **Annual Income:** ₹110,000 | **Land Holding:** 0
  * **Social Category:** BC (Backward Class) | **Disability:** None | **Education:** Undergraduate
  * **Synthetic Documents:** Synthetic Aadhaar, Synthetic 10th/12th Marksheet, Synthetic College ID
* **Deterministic Engine Verification:**
  * **Eligible Potential Matches (24 Schemes):**
    * `tn-pudhumai-penn` (Higher Education Assurance) — Satisfies: Female student in Tamil Nadu.
    * `pm-ujjwala` — Satisfies: Female citizen, family income within threshold.
    * `atal-pension-yojana` — Satisfies: Age between 18 and 40 years.
    * `pm-jan-dhan` — Satisfies: Indian citizen age ≥ 10 years.
    * `edu-tn-free-education-degree` — Satisfies: Tamil Nadu undergraduate student.
    * `pmjay-ayushman` — Satisfies: Income ≤ ₹2,50,000.
  * **Excluded / Does Not Match (51 Schemes):**
    * `pm-kisan` — Excluded: Requires farmer / cultivator occupation.
    * `pmay-g` — Excluded: Requires rural cultivator/homeless status.
    * `sukanya-samriddhi` — Excluded: Age 19 exceeds maximum age limit of 10 years.
    * `nsap-old-age-pension` — Excluded: Age 19 is below 60 years.
    * `pm-svanidhi` — Excluded: Requires street vendor occupation.
  * **Information Needed (0 Schemes):** Complete criteria satisfied.

---

### Persona 3: Leela Ben — Elderly Traditional Artisan
* **Profile Attributes:**
  * **Age:** 67 | **Gender:** Female | **State:** Gujarat | **Location:** Rural
  * **Occupation:** Artisan (Handicraft/Textiles) | **Annual Income:** ₹55,000 | **Land Holding:** 0
  * **Social Category:** General | **Disability:** None | **Education:** Literate
  * **Synthetic Documents:** Synthetic Aadhaar, Synthetic Bank Passbook
* **Deterministic Engine Verification:**
  * **Eligible Potential Matches (16 Schemes):**
    * `nsap-old-age-pension` (IGNOAPS) — Satisfies: Age ≥ 60 years, BPL/low-income threshold.
    * `pm-vishwakarma` — Satisfies: Artisan occupation, traditional craftsperson.
    * `pm-mudra` — Satisfies: Micro-enterprise craftsperson.
    * `pm-ujjwala` — Satisfies: Female citizen, low income.
    * `pmjay-ayushman` — Satisfies: Senior citizen, income ≤ ₹2,50,000.
  * **Excluded / Does Not Match (59 Schemes):**
    * `pm-kisan` — Excluded: Requires farmer occupation and agricultural land.
    * `atal-pension-yojana` — Excluded: Age 67 exceeds 40-year enrollment cap.
    * `pm-svanidhi` — Excluded: Restricted to street vendors.
    * `sukanya-samriddhi` — Excluded: Age exceeds 10 years.
  * **Information Needed (0 Schemes):** Complete criteria satisfied.

---

### Persona 4: Mohammad Tariq — Urban Micro-Entrepreneur
* **Profile Attributes:**
  * **Age:** 35 | **Gender:** Male | **State:** Delhi | **Location:** Urban
  * **Occupation:** Street Vendor | **Annual Income:** ₹120,000 | **Land Holding:** 0
  * **Social Category:** General | **Disability:** None | **Education:** 8th Pass
  * **Synthetic Documents:** Synthetic Aadhaar, Synthetic Vending Certificate, Synthetic Bank Passbook
* **Deterministic Engine Verification:**
  * **Eligible Potential Matches (18 Schemes):**
    * `pm-svanidhi` (PM Street Vendor's AtmaNirbhar Nidhi) — Satisfies: Street Vendor in urban area.
    * `pm-mudra` (PMMY Shishu/Kishore) — Satisfies: Urban micro-entrepreneur.
    * `atal-pension-yojana` — Satisfies: Age 35 (eligible band 18–40).
    * `pm-jan-dhan` — Satisfies: Age ≥ 10 years.
    * `pmjay-ayushman` — Satisfies: Low-income urban informal worker.
  * **Excluded / Does Not Match (57 Schemes):**
    * `pm-kisan` — Excluded: Requires agricultural land and farmer occupation.
    * `pm-ujjwala` — Excluded: Restricted to female household heads.
    * `pm-vishwakarma` — Excluded: Vending is distinct from traditional 18 trade crafts.
    * `sukanya-samriddhi` — Excluded: Age and gender criteria not met.
  * **Information Needed (0 Schemes):** Complete criteria satisfied.

---

### Persona 5: Sunita Sharma — Anonymous / Incomplete Profile Visitor
* **Profile Attributes:**
  * **Age:** Unspecified (`undefined`) | **Gender:** Female | **State:** Unspecified
  * **Occupation:** Unspecified | **Annual Income:** Unspecified | **Land Holding:** Unspecified
  * **Social Category:** Unspecified | **Disability:** Unspecified | **Education:** Unspecified
  * **Synthetic Documents:** None
* **Deterministic Engine Verification:**
  * **Eligible Potential Matches (2 Universal Schemes):**
    * `health-pm-bjp-jan-aushadhi` (Generic Medicines) — Universal access for all citizens regardless of state/income.
    * `health-nikshay-poshan-tb` (TB Nutrition Support) — Clinical eligibility independent of income/caste.
  * **Needs More Information (72 Schemes):**
    * `pm-kisan` — Requires Social Category, Land Holding, and Occupation confirmation.
    * `pmay-g` — Requires Annual Income and Housing Status confirmation.
    * `pmjay-ayushman` — Requires Annual Income confirmation (≤ ₹2,50,000).
  * **Excluded / Does Not Match (1 Scheme):**
    * `edu-tn-tamil-puthalvan` — Excluded: Restricted to male students; profile indicates Female.

---

## 3. Multilingual Test Matrix (7 Locales)

Each locale must be verified for UI labels, dynamic template interpolation, navigation elements, and disclaimer rendering.

```
+-----------+---------------+--------------------------------------+------------------------------------+
| Locale ID | Language      | Sample UI Key Verification           | Dynamic Interpolation Check        |
+-----------+---------------+--------------------------------------+------------------------------------+
| en        | English       | "Explore All Schemes"                | "Showing {count} of {total}"       |
| hi        | Hindi         | "सभी योजनाएं देखें"                 | "{total} में से {count} प्रदर्शित" |
| ta        | Tamil         | "அனைத்து திட்டங்களையும் காண்க"       | "{total} இல் {count} காட்டுகிறது"  |
| te        | Telugu        | "అన్ని పథకాలను అన్వేషించండి"         | "{total} లో {count} చూపిస్తోంది"   |
| ml        | Malayalam     | "എല്ലാ പദ്ധതികളും കണ്ടെത്തുക"         | "{total} ൽ {count} കാണിക്കുന്നു"  |
| mr        | Marathi       | "सर्व योजना एक्सप्लोर करा"          | "{total} पैकी {count} दाखवत आहे"   |
| gu        | Gujarati      | "બધી યોજનાઓ શોધો"                    | "{total} માંથી {count} દર્શાવે છે" |
+-----------+---------------+--------------------------------------+------------------------------------+
```

### Verification Steps
1. Switch to each language using the header locale dropdown.
2. Confirm that no raw interpolation syntax (e.g. `{count}`, `{total}`, `undefined`) is displayed.
3. Verify that font rendering maintains legible kerning on Windows, macOS, Android, and iOS.
4. Verify RTL/LTR consistency (all 7 supported languages use LTR).

---

## 4. Search Relevance and Negative Filter Testing

### Test Scenarios

#### Scenario 4.1: Positive Thematic Discovery
* **Query:** `"kisan"` or `"farmer"`
* **Expected Result:** Top results include `pm-kisan`, `pm-fasal-bima`, and `agri-kisan-credit-card`. Non-agricultural schemes must not appear in top rank.
* **Query:** `"scholarship"`
* **Expected Result:** `edu-pm-usp-central-sector`, `edu-aicte-pragati`, and `edu-national-fellowship-obc`.

#### Scenario 4.2: Negative / Exclusion Filtering
* **Filter Setup:** State = `"Gujarat"`, Category = `"Agriculture"`
* **Expected Result:** Excludes state-specific schemes from other states (e.g. `tn-pudhumai-penn`, `house-tn-kalaignar-kanavu-illam`). Only central schemes and Gujarat state schemes appear.

#### Scenario 4.3: Invalid / Fake Scheme Queries
* **Query:** `"crypto free grant"`, `"instant loan without kyc"`, `"xyz999fake"`
* **Expected Result:** Clean zero-state message ("No matching schemes found"). No crashes, no unhandled exceptions, and helpful suggestions to adjust search keywords or filters.

---

## 5. Viewport Responsiveness Matrix

| Device Class | Viewport Dimensions | Layout Expectations | Key Elements to Verify |
| :--- | :--- | :--- | :--- |
| **Ultra-Compact Mobile** | 320px × 568px (iPhone SE 1st gen) | Single column, sticky header wraps cleanly, no horizontal overflow (`scrollWidth === clientWidth`). | Scheme card buttons, language selector, modal padding (min 12px). |
| **Standard Mobile** | 360px × 800px (Android baseline) | Clean vertical rhythm, touch targets ≥ 44px × 44px. | Filter drawer toggle, search input full width. |
| **Modern Smartphone** | 390px × 844px (iPhone 12/13/14) | Crisp typography, floating quick actions docked above home bar. | Card elevation, sticky filter banner. |
| **Tablet / Kiosk Mini** | 768px × 1024px (iPad portrait) | 2-column grid for scheme cards, persistent sidebar or sticky sub-nav. | Modal dialog centered with backdrop blur. |
| **Desktop / CSC Terminal** | 1440px × 900px (Common Service Centre) | 3-column scheme grid, side-by-side comparison modal, high-contrast text. | Quick print thermal receipt action, full data tables. |

---

## 6. Accessibility & Keyboard Navigation (a11y)

1. **Tab Sequential Navigation:**
   * Starting from address bar, pressing `Tab` must sequentially focus: Skip-to-content -> Logo -> Navigation links -> Language dropdown -> Search input -> Filter chips -> Scheme cards.
2. **Modal Focus Trap:**
   * Opening Scheme Details (`SchemeModal`) must trap focus inside the dialog. Pressing `Tab` cycles only between modal elements (Close button, Tab headers, Official Link button).
   * Pressing `Escape` must immediately close the dialog and restore focus to the triggering card button.
3. **Screen Reader ARIA Attributes:**
   * Modal container has `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
   * Form inputs have descriptive `<label>` or `aria-label`.
   * Interactive icons (`lucide-react`) have `aria-hidden="true"` when accompanied by text.

---

## 7. Isolated Synthetic Document Vault Testing

> **Environment Requirement:** Must be conducted in a local or isolated staging environment with mock MongoDB. Never upload files to production storage.

1. **Synthetic Test Files:**
   * Prepare dummy test files: `sample_aadhaar_synthetic.pdf` (150 KB), `sample_passbook_synthetic.png` (250 KB).
   * Verify file contents contain clearly watermarked synthetic data: `"SYNTHETIC TEST DOCUMENT - NOT REAL CITIZEN DATA"`.
2. **File Isolation Verification:**
   * Log in as User A (`test_user_a@govscheme.local`). Upload synthetic Aadhaar.
   * Log in as User B (`test_user_b@govscheme.local`). Navigate to Document Vault.
   * **Pass Criteria:** User B cannot view, download, or access User A's uploaded file. Attempting direct API request to User A's document ID returns `403 Forbidden` or `404 Not Found`.

---

## 8. Official Links and Advisory Disclaimers

1. **External Link Guard:**
   * Every official link pointing to an external website (`pmkisan.gov.in`, `mudra.org.in`, etc.) must render with `target="_blank"` and `rel="noopener noreferrer"`.
2. **Advisory Banner Display:**
   * Scheme detail modal must clearly display the disclaimer:
     > *"GovScheme is an independent informational discovery service and does not collect application fees or directly issue government approvals. Always submit official applications on the authorized government portal."*
3. **Non-Gov Domain Notification:**
   * When an official portal is operated on a non-`.gov.in` domain (e.g. `mudra.org.in`, `npscra.proteantech.in`), the UI must display the verified agency name (e.g. SIDBI, Protean eGov / PFRDA) to avoid citizen confusion.
