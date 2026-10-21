# GovScheme Controlled Beta Pilot Execution Plan

**Document Version:** 1.0.0-pilot  
**Phase:** Phase 12 — Controlled Beta Pilot  
**Target Environment:** Staging & Public Frontend (`https://govhelp.vercel.app` backed by `https://govscheme-api.onrender.com`)  
**Authorization Status:** **BLOCKED PENDING STAKEHOLDER APPROVAL (Gate G-10)**  
**Audience:** Technical Lead, Pilot Operations Coordinator, Designated Internal Testers, Approved CSC Operators  

---

## 1. Pilot Objectives & Operational Scope

The Controlled Beta Pilot evaluates GovScheme's discovery, search relevance, deterministic eligibility calculation, multilingual rendering, and accessibility under real-world operator conditions before general public release.

### Core Testing Mandate
* **Zero Real PII:** All testing must strictly use the 5 synthetic citizen personas and synthetic document watermarks.
* **Safe, Non-Mutating Testing:** Public production testers must never create dummy accounts with real citizen names or submit live applications.
* **Time-Boxed Discipline:** A 5-day structured testing sprint with daily test quotas and scheduled triage checkpoints.
* **Formal Exit Criteria:** Strict operational metrics required prior to any recommendation for public release.

---

## 2. Roles and Responsibilities

| Role | Designated Assignee | Core Responsibilities |
| :--- | :--- | :--- |
| **Pilot Operations Coordinator** | Operations Lead | Manages pilot schedule, coordinates CSC operators, verifies daily log completion, chairs triage meetings. |
| **Technical Lead** | Lead Engineer | Monitors Render backend health, reviews P0/P1 defect reports, manages rollback procedures if triggered. |
| **QA / Accessibility Lead** | Test Specialist | Audits viewport responsiveness (320px–1440px), keyboard navigation, screen-reader compliance, and localization tokens. |
| **CSC Kiosk Operators (3)** | Approved Field Operators | Tests high-contrast kiosk mode, thermal receipt formatting, regional language clarity (Tamil, Hindi, Gujarati). |
| **Internal Pilot Testers (2)** | Internal Staff | Validates synthetic citizen journeys (Ramesh, Ananya, Leela, Tariq, Sunita) and search precision. |

---

## 3. Pilot Schedule and Daily Test Allocation (5-Day Timebox)

```
+-------+-----------------------------+------------------------------------+-----------------------------+
| Day   | Focus Domain                | Personas & Locales                 | Key Verification Targets    |
+-------+-----------------------------+------------------------------------+-----------------------------+
| Day 1 | Baseline Reachability &     | All 7 Locales:                     | Frontend & Backend health;  |
|       | Multilingual Localization   | EN, HI, TA, TE, ML, MR, GU         | No raw template tokens      |
|       |                             |                                    | (e.g. {count}, {total})     |
+-------+-----------------------------+------------------------------------+-----------------------------+
| Day 2 | Search Relevance &          | Positive, Negative, and            | Search ranking; state/cat   |
|       | Exclusion Filters           | Invalid/Fake Queries               | filters; zero hallucination |
|       |                             |                                    | on fake schemes             |
+-------+-----------------------------+------------------------------------+-----------------------------+
| Day 3 | Deterministic Eligibility & | Persona 1 (Farmer, Ramesh)         | Satisfied, Unsatisfied, and |
|       | Scheme Details              | Persona 2 (Student, Ananya)        | Information Needed counts;  |
|       |                             | Persona 3 (Artisan, Leela)         | Trust panel & official links|
|       |                             | Persona 4 (Vendor, Tariq)          |                             |
|       |                             | Persona 5 (Visitor, Sunita)        |                             |
+-------+-----------------------------+------------------------------------+-----------------------------+
| Day 4 | Viewport Responsiveness &   | 320px, 360px, 390px, 768px, 1440px | No horizontal scroll leaks; |
|       | Accessibility (a11y)        | Touch targets ≥ 44px;              | Modal focus trap & Escape;  |
|       |                             | Screen readers (NVDA/VoiceOver)    | ARIA label completeness     |
+-------+-----------------------------+------------------------------------+-----------------------------+
| Day 5 | Document Vault Isolation &  | Synthetic Documents Only           | Cross-tenant doc isolation; |
|       | Exit Review Meeting         | Final Issue Triage                 | Pilot Exit Report sign-off  |
+-------+-----------------------------+------------------------------------+-----------------------------+
```

---

## 4. Synthetic Personas & Deterministic Verification Targets

All test runs must evaluate against the exact deterministic outcomes established by the canonical 75-scheme rule engine:

```
+---+----------------------+-----+--------+-------------+-------------+----------+-----------+-------------------+
| # | Persona Name         | Age | Gender | State       | Occupation  | Income   | Cat. / Ed | Expected Status   |
+---+----------------------+-----+--------+-------------+-------------+----------+-----------+-------------------+
| 1 | Ramesh Patel         | 48  | Male   | Gujarat     | Farmer      | ₹95,000  | OBC / 10th| 27 Eligible Match |
|   | (Rural Farmer)       |     |        |             |             |          |           | 0 Info Needed     |
|   |                      |     |        |             |             |          |           | 48 Excluded       |
+---+----------------------+-----+--------+-------------+-------------+----------+-----------+-------------------+
| 2 | Ananya Sundaram      | 19  | Female | Tamil Nadu  | Student     | ₹110,000 | BC / UG   | 24 Eligible Match |
|   | (College Student)    |     |        |             |             |          |           | 0 Info Needed     |
|   |                      |     |        |             |             |          |           | 51 Excluded       |
+---+----------------------+-----+--------+-------------+-------------+----------+-----------+-------------------+
| 3 | Leela Ben            | 67  | Female | Gujarat     | Artisan     | ₹55,000  | Gen / Lit | 16 Eligible Match |
|   | (Senior Artisan)     |     |        |             |             |          |           | 0 Info Needed     |
|   |                      |     |        |             |             |          |           | 59 Excluded       |
+---+----------------------+-----+--------+-------------+-------------+----------+-----------+-------------------+
| 4 | Mohammad Tariq       | 35  | Male   | Delhi       | St. Vendor  | ₹120,000 | Gen / 8th | 18 Eligible Match |
|   | (Street Vendor)      |     |        |             |             |          |           | 0 Info Needed     |
|   |                      |     |        |             |             |          |           | 57 Excluded       |
+---+----------------------+-----+--------+-------------+-------------+----------+-----------+-------------------+
| 5 | Sunita Sharma        | --  | Female | --          | --          | --       | -- / --   | 2 Universal Match |
|   | (Incomplete Visitor) |     |        |             |             |          |           | 72 Info Needed    |
|   |                      |     |        |             |             |          |           | 1 Excluded        |
+---+----------------------+-----+--------+-------------+-------------+----------+-----------+-------------------+
```

---

## 5. Test Scope Breakdown

### 5.1. Multilingual Localization (7 Locales)
* **Locales Tested:** English (`en`), Hindi (`hi`), Tamil (`ta`), Telugu (`te`), Malayalam (`ml`), Marathi (`mr`), and Gujarati (`gu`).
* **Checks:**
  1. Header navigation labels render in regional script.
  2. Filter chips and category labels render accurately without English fallbacks for standard categories.
  3. Dynamic strings with template variables (e.g. `{count} of {total}`) interpolate without raw curly-brace leakage.
  4. Scheme detail disclaimers are legible and fully translated.

### 5.2. Search Relevance & Negative Filtering
* **Positive Queries:** `"kisan"`, `"scholarship"`, `"pension"`, `"housing"`, `"artisan"`. Confirm top 3 results are relevant.
* **Negative State Filters:** Select state = `"Gujarat"`, confirm schemes exclusive to other states (e.g. `tn-pudhumai-penn`) are strictly excluded.
* **Fake/Gibberish Queries:** Enter `"instant grant 50000"`, `"crypto scheme"`, `"xyz999fake"`. Confirm zero results returned with clean advisory message; no application crash or unhandled exceptions.

### 5.3. Viewports & Responsiveness
* **Mobile (320px × 568px):** Verify single-column layout, horizontal overflow absence (`scrollWidth === clientWidth`), readable font sizing.
* **Standard Mobile (360px & 390px):** Verify touch targets ≥ 44px × 44px, sticky header responsiveness, accessible burger menu.
* **Tablet (768px × 1024px):** Verify 2-column card grid, smooth modal animation.
* **Desktop (1440px × 900px):** Verify 3-column grid, comparison view, thermal print layout.

### 5.4. Accessibility & Keyboard Navigation
* **Tab Order:** Verify focus moves logically: Skip Link -> Logo -> Navigation -> Language -> Search -> Filters -> Cards.
* **Modal Trap:** Verify focus is trapped inside `SchemeModal` when open.
* **Escape Key:** Verify pressing `Escape` closes active modal and returns focus to the triggering element.
* **Screen Reader Labels:** Verify all icon-only buttons (`Bell`, `Settings2`, `Languages`) have clear `aria-label` attributes.

### 5.5. Isolated Document Authorization
* **Strict Rule:** Document testing must occur **only** in local or isolated test environments.
* **Prohibition:** Never upload files to production storage.
* **Tenant Isolation Verification:** Verify User B cannot access, read, or download User A's uploaded synthetic document (`403 Forbidden` enforced).

---

## 6. Feedback Collection & Issue Triage Workflow

```
Tester Identifies Defect
          │
          ▼
Sanitize Data (Strip all PII: Aadhaar, Phone, Names)
          │
          ▼
Log in beta_package/PILOT_ISSUE_REGISTER.md
          │
          ▼
Assign Severity Level (P0, P1, P2, P3)
          │
          ├── P0 (Critical): Immediate Escalation to Tech Lead (< 15 mins)
          ├── P1 (High): Triaged within 2 hours
          ├── P2 (Medium): Triaged within 24 hours
          └── P3 (Low): Scheduled for next release cycle
```

---

## 7. Pilot Exit Criteria

The controlled beta pilot concludes successfully only when all following criteria are satisfied:

1. **Test Completion:** 100% of planned test cases in [`beta_package/PILOT_EXECUTION_LOG.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_EXECUTION_LOG.md) executed.
2. **Critical Bugs:** **0 Open P0 or P1 issues** in [`beta_package/PILOT_ISSUE_REGISTER.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_ISSUE_REGISTER.md).
3. **Persona Accuracy:** 5 out of 5 synthetic personas match deterministic rule engine outcomes.
4. **Multilingual Stability:** Zero raw interpolation syntax errors across all 7 locales.
5. **Scheme Source Clarity:** All 14 non-gov URLs display advisory source notifications.
6. **Formal Sign-Off:** Dual sign-off completed by Technical Lead and Pilot Operations Coordinator.
