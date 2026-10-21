# GovScheme Controlled Beta Pilot Execution Log

**Document Version:** 1.1.0-pilot  
**Phase:** Phase 14 — Governance Closure & Reconciled Evidence  
**Environment:** Staging / Controlled Pilot (Frontend: `https://govhelp.vercel.app` backed by `https://govscheme-api.onrender.com`)  
**Authorization Status:** **BLOCKED PENDING STAKEHOLDER APPROVAL (Gate G-10)**  

---

## Instructions for Pilot Testers & Operators
1. **Never use real citizen personal data** (no real names, Aadhaar numbers, phone numbers, or certificates).
2. Record all test executions in the run-sheet below.
3. Test Case Status values:
   * `PASS`: Empirically verified with documented evidence (automated regression test or live read-only check).
   * `FAIL`: Execution resulted in an unexpected defect or unhandled error.
   * `BLOCKED`: Cannot be executed because formal stakeholder approval (Gate G-10) is pending.
   * `NOT RUN`: Scheduled test case not yet executed.
4. All evidence files must be sanitized before referencing.

---

## Reconciled Pilot Execution Run-Sheet (24 Planned Cases)

| Run ID | Test Case ID | Target Feature / Focus | Persona | Evidence Tier & Environment | Expected Behavior | Observed Behavior | Status | Evidence Reference | Issue ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **RUN-01** | `TC-LOC-01` | English Locale Baseline | `P1` | Tier 2: Live Smoke (1440x900 Chrome) | UI text renders cleanly in English | Default English UI verified | `PASS` | `govscheme_landing_1792592046238.png` | -- |
| **RUN-02** | `TC-LOC-02` | Hindi Locale Verification | `P1` | Tier 2: Live Smoke (1440x900 Chrome) | Hindi labels render without raw `{count}` | Dynamic UI switch to Hindi verified | `PASS` | `govscheme_hindi_switched_1792592414978.png` | -- |
| **RUN-03** | `TC-LOC-03` | Tamil Field Usability | `P2` | Tier 3: Field Operator (390x844 iOS) | Tamil labels & scheme titles legible | Awaiting authorized operator onboarding | `BLOCKED` | Approval pending Gate G-10 | -- |
| **RUN-04** | `TC-LOC-04` | Telugu Field Usability | `P1` | Tier 3: Field Operator (360x800 Android) | Telugu navigation & filter chips render | Awaiting authorized operator onboarding | `BLOCKED` | Approval pending Gate G-10 | -- |
| **RUN-05** | `TC-LOC-05` | Malayalam Field Usability | `P2` | Tier 3: Field Operator (390x844 iOS) | Malayalam font kerning & cards clean | Awaiting authorized operator onboarding | `BLOCKED` | Approval pending Gate G-10 | -- |
| **RUN-06** | `TC-LOC-06` | Marathi Field Usability | `P3` | Tier 3: Field Operator (768x1024 iPad) | Marathi filter options & modal text clean | Awaiting authorized operator onboarding | `BLOCKED` | Approval pending Gate G-10 | -- |
| **RUN-07** | `TC-LOC-07` | Gujarati Field Usability | `P1` | Tier 3: Field Operator (1440x900 Edge) | Gujarati text renders without clipping | Awaiting authorized operator onboarding | `BLOCKED` | Approval pending Gate G-10 | -- |
| **RUN-08** | `TC-SRC-01` | Positive Search "kisan" | `P1` | Tier 2: Live Smoke (1440x900 Chrome) | PM-KISAN & KCC top ranked (≥95%) | 99% & 97% matches returned | `PASS` | `govscheme_search_kisan_1792592117470.png` | -- |
| **RUN-09** | `TC-SRC-02` | Positive Search "scholarship" | `P2` | Tier 3: Field Operator (390x844 iOS) | Educational schemes returned to student | Awaiting authorized operator onboarding | `BLOCKED` | Approval pending Gate G-10 | -- |
| **RUN-10** | `TC-SRC-03` | Negative State Exclusion | `P1` | Tier 3: Field Operator (1440x900 Chrome) | TN-only schemes excluded when Gujarat chosen | Awaiting authorized operator onboarding | `BLOCKED` | Approval pending Gate G-10 | -- |
| **RUN-11** | `TC-SRC-04` | Invalid Query Handling | `GEN` | Tier 3: Field Operator (1440x900 Chrome) | Zero results message; no crash or error | Awaiting authorized operator onboarding | `BLOCKED` | Approval pending Gate G-10 | -- |
| **RUN-12** | `TC-DET-01` | Deterministic Persona 1 | `P1` | Tier 1: Regression (Node Harness) | 27 Eligible, 0 Info Needed, 48 Excluded | Verified deterministically in harness | `PASS` | `verify_synthetic_profiles.js` | -- |
| **RUN-13** | `TC-DET-02` | Deterministic Persona 2 | `P2` | Tier 1: Regression (Node Harness) | 24 Eligible, 0 Info Needed, 51 Excluded | Verified deterministically in harness | `PASS` | `verify_synthetic_profiles.js` | -- |
| **RUN-14** | `TC-DET-03` | Deterministic Persona 3 | `P3` | Tier 1: Regression (Node Harness) | 16 Eligible, 0 Info Needed, 59 Excluded | Verified deterministically in harness | `PASS` | `verify_synthetic_profiles.js` | -- |
| **RUN-15** | `TC-DET-04` | Deterministic Persona 4 | `P4` | Tier 1: Regression (Node Harness) | 18 Eligible, 0 Info Needed, 57 Excluded | Verified deterministically in harness | `PASS` | `verify_synthetic_profiles.js` | -- |
| **RUN-16** | `TC-DET-05` | Deterministic Persona 5 | `P5` | Tier 1: Regression (Node Harness) | 2 Universal, 72 Info Needed, 1 Excluded | Verified deterministically in harness | `PASS` | `verify_synthetic_profiles.js` | -- |
| **RUN-17** | `TC-MOD-01` | Scheme Modal Details | `P1` | Tier 2: Live Smoke (1440x900 Chrome) | Shows benefit, trust panel, official link | Trust panel and apply button verified | `PASS` | `govscheme_modal_open_1792592242735.png` | -- |
| **RUN-18** | `TC-MOD-02` | Modal Dismissal (Escape) | `GEN` | Tier 2: Live Smoke (1440x900 Chrome) | Pressing Escape closes modal smoothly | Verified live in browser subagent | `PASS` | `govscheme_modal_closed_1792592282635.png` | -- |
| **RUN-19** | `TC-RSP-01` | Compact Mobile Viewport | `GEN` | Tier 2: Live Smoke (320x568 Emulated) | Single-column, scrollWidth === clientWidth | Verified in responsive audit | `PASS` | `mobile_320_view_1792586657979.png` | -- |
| **RUN-20** | `TC-RSP-02` | Android Mobile Viewport | `GEN` | Tier 2: Live Smoke (360x800 Emulated) | Touch targets ≥ 44px; hamburger menu | Verified in responsive audit | `PASS` | `mobile_360_view_1792586662787.png` | -- |
| **RUN-21** | `TC-RSP-03` | Tablet Viewport (768px) | `GEN` | Tier 2: Live Smoke (768x1024 Emulated) | 2-column grid; centered modal dialog | Verified in responsive audit | `PASS` | `tablet_768_view_1792586674188.png` | -- |
| **RUN-22** | `TC-A11-01` | Screen Reader ARIA Labels | `GEN` | Tier 2: Live Smoke (Live CDN Bundle) | Icon buttons have descriptive aria-label | Verified in bundle index-D1lpL1GV.js | `PASS` | `index-D1lpL1GV.js` | -- |
| **RUN-23** | `TC-A11-02` | Tab Sequential Focus | `GEN` | Tier 3: Field Operator (1440x900 Chrome) | Logical focus progression without trap | Awaiting authorized operator onboarding | `BLOCKED` | Approval pending Gate G-10 | -- |
| **RUN-24** | `TC-VLT-01` | Isolated Doc Vault Sandbox | `P1` | Tier 1: Regression (Local Test Sandbox) | Cross-tenant document query blocked 403 | Verified in regression test suite | `PASS` | `ocr_isolation.test.js` | -- |

---

## Reconciled Summary Statistics
* **Total Defined Test Cases:** 24
* **Tier 1 (Automated Regression Evidence):** 6 Verified (`PASS`)
* **Tier 2 (Live Read-Only Smoke Evidence):** 9 Verified (`PASS`)
* **Total Verified Cases:** **15 / 24 (62.5% Pass Rate)**
* **Tier 3 (Authorized Field Operator Tests):** **9 / 24 (37.5% BLOCKED pending Gate G-10 Approval)**
* **Failed Cases:** **0 / 24 (0.0% Failure Rate)**
