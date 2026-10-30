# GovScheme Phase 21 — Migration Evidence Correction & Release Gate Revalidation

**Audit Date:** October 30, 2026  
**Repository:** https://github.com/NITISH1817/GovScheme  
**Target Branch:** `main`  
**Current HEAD:** `6c6506897e814391e27329a74fc886ffc52045e9`  
**Active Production URLs:**
- Frontend: https://govhelp.vercel.app/
- Backend: https://govscheme-api.onrender.com/
- Database: MongoDB Atlas — Cluster0 (`bzxblcw.mongodb.net`), Database: `govscheme`

---

## 1. Repository & Source Control Verification

- **Branch:** `main`
- **Pushed Commit on Origin:** `6c6506897e814391e27329a74fc886ffc52045e9`
- **Local Working Tree Status:** All Phase 18–21 code enhancements, schema fields, localization strings, and migration utilities remain strictly **UNCOMMITTED and UNPUSHED**.
- **Tracked Modified Files (14):**
  - `public/locales/en/translation.json`
  - `public/locales/gu/translation.json`
  - `public/locales/hi/translation.json`
  - `public/locales/ml/translation.json`
  - `public/locales/mr/translation.json`
  - `public/locales/ta/translation.json`
  - `public/locales/te/translation.json`
  - `scripts/sync_mongodb_75.js`
  - `server/controllers/applicationController.js`
  - `server/models/Application.js`
  - `src/App.tsx`
  - `src/components/ApplicationTracker.tsx`
  - `src/components/admin/ApplicationManagementView.tsx`
  - `src/components/admin/CitizenManagementView.tsx`
- **Untracked Scripts & Tests (5):**
  - `scripts/migrate_application_numbers.cjs`
  - `scripts/migrate_central_schemes_classification.cjs`
  - `scripts/rollback_central_schemes_classification.cjs`
  - `tests/application_number_integrity.test.js`
  - `tests/central_state_scheme_classification.test.js`
- **Ignored Files:** `.env`, `.env.production.local`, `backups/`, `dist/`, `final_report_submission/`, `node_modules/`, `scratch/`, `scripts/secure_save_prod_uri.js`, `uploads/`.
- **`git diff --check` Result:** 0 whitespace or formatting errors.

---

## 2. Corrected Central Scheme Migration Manifest & Evidence Reconciliation

### Target Criteria & Invariants
- Total Canonical Schemes: **75**
- Targeted Central Schemes: Exactly **54** (`state: "Central"`)
- Excluded State Schemes: Exactly **21** (`state` in Tamil Nadu, Maharashtra, Karnataka, Uttar Pradesh, Delhi, Telangana)
- Corrected Field: `governmentLevel: "Central"` (100% verified across all 54 records)

### Reconciled Residence Classification Breakdown (54 Schemes)
The Phase 20 inconsistency where geographic operating areas or differentiated subsidies were conflated with applicant residence restrictions has been resolved:

1. **Universal Pan-India (`Citizen of India`): 43 schemes**
   - Corrected PMEGP (`GOV-ENT-001`): MSME/KVIC guidelines permit any Indian citizen above 18 to establish projects in *both* rural and urban areas (subsidy is 15-25% urban vs 25-35% rural). Applicant residence is universal pan-India citizenship.
   - Corrected PMUY 2.0 (`pm-ujjwala`): MoPNG guidelines provide connections to adult women from poor households across India, explicitly including urban migrant families via self-declaration of address.
   - Corrected 41 additional national schemes (PM-KISAN, APY, SSY, PMJDY, PM-Mudra, PM-Vishwakarma, etc.).

2. **Statutory Rural Residence (`Resident of Rural India`): 4 schemes**
   - `mgnrega`: Section 3(1) of MGNREGA Act 2005 statutorily restricts employment guarantee to adult members of rural households.
   - `pmay-g`: MoRD Guidelines restrict housing grants to homeless/kutcha house dwellers in rural village areas.
   - `pm-svamitva-property-card`: MoPR Framework mandates survey and property titling for rural village Abadi land.
   - `house-swachh-bharat-ग्रामीण-toilet`: MoJS/DDWS SBM(G) guidelines restrict IHHL grants to rural households lacking latrines under Gram Panchayat jurisdiction.

3. **Statutory Urban Residence (`Resident of Urban Area`): 4 schemes**
   - `house-pmay-urban-2`: MoHUA PMAY-U 2.0 Guidelines (Aug 2024) restrict benefits to EWS/LIG/MIG families residing in statutory towns.
   - `pm-svanidhi`: MoHUA Guidelines restrict credit facility to street vendors vending within Urban Local Bodies (`Resident of Urban / Peri-Urban Area`).
   - `deendayal-antodaya-shelter`: MoHUA DAY-NULM SUH Framework mandates shelters for urban homeless in city municipalities.
   - `affordable-rental-housing`: MoHUA ARHC Guidelines restrict rental housing complexes to urban migrants and poor in statutory urban towns.

4. **Centrally Sponsored / State Administration Domicile Nuance: 3 schemes**
   - `pmjay-ayushman`: NHA PM-JAY is centrally sponsored (60:40 Centre:State funding), implemented through State Health Agencies, and tied to state-specific SECC/NFSA ration registries.
   - `nsap-old-age-pension`: MoRD NSAP IGNOAPS is administered through State Social Welfare departments according to state BPL lists with state-funded supplementary pension top-ups.
   - `post-matric-scholarship`: Centrally sponsored, administered via State Scholarship Portals requiring recognized state domicile certificates.

**Reconciled Count Verification:**  
43 (Universal) + 4 (Rural) + 4 (Urban) + 3 (Centrally Sponsored) = **Exactly 54 Central Schemes**.

---

## 3. Benefit Frequency Evidence & Multi-Schedule Model

### Catalogue Distribution (75 Schemes)
- **Periodic (Monthly):** 17 schemes (e.g. Atal Pension Yojana, IGNOAPS, Pudhumai Penn, Ladki Bahin)
- **Periodic (Annual):** 17 schemes (e.g. AICTE Pragati, National Means-cum-Merit, PMJJBY, PMSBY)
- **One-time / Milestone Subsidy:** 21 schemes (e.g. Stand-Up India, PMAY-U, Solar Rooftop)
- **Periodic (Trimester / Installments):** 3 schemes (e.g. PMMVY, Dr. Muthulakshmi Reddy Maternity)
- **Event-Driven / Revolving:** 7 schemes (e.g. PM-JAY cashless hospital claims, KCC credit, PMFBY crop loss compensation)
- **Unverified / Non-monetary / Compound:** 10 schemes (Preserved without unsupported bulk updates)

### Corrected Compound Schedule Evidence
1. **Pradhan Mantri Matru Vandana Yojana (`health-pm-matru-vandana`):**
   - *First Child:* ₹5,000 in two instalments (₹3,000 on early registration + 1 ANC; ₹2,000 on birth registration + 1st vaccination cycle).
   - *Second Child (Girl Child Only):* ₹6,000 in a single instalment after birth registration and full vaccination.
2. **PM SVANidhi (`pm-svanidhi`):**
   - *Working Capital Loan:* 1st tranche ₹10,000 (1-yr tenure) → 2nd tranche ₹20,000 (1.5-yr tenure) → 3rd tranche ₹50,000 (3-yr tenure).
   - *Interest Subsidy:* 7% per annum credited **Quarterly** via DBT upon prompt repayment.
   - *Digital Cashback:* Up to ₹100 **Monthly** (₹1,200/yr) for digital UPI payments.
3. **PMEGP (`GOV-ENT-001`):**
   - *Composite Bank Loan:* Term loan + working capital up to ₹50L (manufacturing) or ₹20L (services).
   - *Margin Money Subsidy:* 15-35% project cost kept in a 3-year term deposit receipt (TDR) lock-in before being credited to the loan principal upon physical verification.

### Preserved Unverified Schemes (10 Records)
No artificial frequencies assigned; preserved as static defaults pending formal ministry circulars:
`agri-soil-health-card`, `deendayal-antodaya-shelter`, `edu-tn-free-education-degree`, `emp-pradhan-mantri-kaushal-vikas-4`, `health-pm-bjp-jan-aushadhi`, `house-swachh-bharat-ग्रामीण-toilet`, `mission-indradhanush`, `paramparagat-krishi-vikas`, `startup-india-seed-fund`, `tele-manas-mental-health`.

---

## 4. Migration & Rollback Safety Hardening

### Safety Guarantees Implemented
1. **Dry-Run Enforcement:** `scripts/migrate_central_schemes_classification.cjs`, `scripts/rollback_central_schemes_classification.cjs`, and `scripts/migrate_application_numbers.cjs` default to read-only execution. Writes strictly require `--execute`.
2. **Manifest Generation:** Execution exports a cryptographic before-and-after audit file to `backups/central_schemes_migration_manifest.json`.
3. **Rollback Guardrails:**
   - Pre-condition check verifies `state === 'Central'`.
   - Compares current database values against the expected migration manifest.
   - **Refuses to overwrite** records whose values differ unexpectedly from the manifest.
4. **Application Number Robustness:**
   - Filters out blank, placeholder, or trivial values (`N/A`, `none`, `-`, `null`).
   - Bounds string length to 100 characters max and strips non-printable control characters.
   - Detects collision/duplicate numbers across applications and logs warnings.
   - Preserves original citizen `remarks` 100% intact.

---

## 5. Backup & Restoration Readiness

- **Cluster Identity:** MongoDB Atlas `Cluster0` (`cluster0.bzxblcw.mongodb.net`)
- **Target Database:** `govscheme`
- **Pre-Migration Collection Counts:**
  - `schemes`: 75
  - `users`: 11
  - `applications`: 1
  - `documents`: 5
  - `notifications`: 6
  - `auditlogs`: 0
  - `chathistories`: 0
- **Atlas Cloud Backup Status:** Physical automated/on-demand snapshot must be verified directly via MongoDB Atlas Cloud Console by cluster administrator. Application-layer connection cannot trigger or verify cloud provider infrastructure snapshots.
- **Physical Restoration Test Status:** **UNTESTED in this environment.** Full disaster recovery restore from binary BSON dump has not been executed against a disposable replica.
- **Rollback Tool Readiness:** Local surgical rollback script (`scripts/rollback_central_schemes_classification.cjs`) is tested in dry-run mode and verified.

---

## 6. Accountable Approval Register

| Role | Accountable Individual | Authority Level | Formal Sign-off Status | Verification Evidence / Reason |
| :--- | :--- | :--- | :--- | :--- |
| **Technical Lead** | Nitish Priyan R. S. | Primary Architect & Code Owner | **PENDING FORMAL SIGN-OFF** | Code, tests, and dry-run manifests prepared; awaiting manual review of Phase 21 package. |
| **Security & Data Privacy Officer** | Unassigned / Awaiting Appointee | InfoSec & Data Compliance | **PENDING APPOINTMENT & SIGN-OFF** | RBAC, tenant isolation, and input bounding verified; requires human compliance officer review. |
| **Pilot Operations Coordinator** | Unassigned / Awaiting Appointee | Field Pilot & Operational Governance | **PENDING APPOINTMENT & SIGN-OFF** | Disclaimers and multi-language bundles verified; requires operational pilot team sign-off. |

*Note: In accordance with safety rules, no signatures have been simulated or fabricated on behalf of unverified or unappointed human role holders.*

---

## 7. Reconciled Raw Test Execution Summary

Executed command: `node scratch/run_and_count_tests.cjs`

| Suite Name | Assertions Passed | Assertions Failed | Exit Code | Execution Time |
| :--- | :-: | :-: | :-: | :-: |
| `tests/auth_end_to_end_fixes.test.js` | 19 | 0 | 0 | 1.02s |
| `tests/jwt_cors_hardening.test.js` | 14 | 0 | 0 | 0.77s |
| `tests/security_vulnerabilities.test.js` | 13 | 0 | 0 | 1.17s |
| `tests/ocr_isolation_recommendation.test.js` | 10 | 0 | 0 | 0.49s |
| `tests/signup_profile_persistence.test.js` | 14 | 0 | 0 | 1.04s |
| `tests/admin_citizen_lifecycle.test.js` | 12 | 0 | 0 | 1.16s |
| `tests/scheme_recommendation_and_system.test.js` | 4 | 0 | 0 | 0.09s |
| `tests/ai_ml_architecture_audit.test.js` | 10 | 0 | 0 | 6.37s |
| `tests/search_and_grounded_ai.test.js` | 39 | 0 | 0 | 12.54s |
| `tests/explainable_eligibility.test.js` | 22 | 0 | 0 | 11.23s |
| `tests/multilingual_search.test.js` | 15 | 0 | 0 | 12.30s |
| `tests/production_build_guard.test.js` | 13 | 0 | 0 | 0.35s |
| `tests/kiosk_auth_profile_flow.test.js` | 6 | 0 | 0 | 0.13s |
| `tests/profile_schemes_navigation.test.js` | 8 | 0 | 0 | 11.12s |
| `tests/central_state_scheme_classification.test.js` | 5 | 0 | 0 | 0.39s |
| `tests/application_number_integrity.test.js` | 5 | 0 | 0 | 0.35s |
| **TOTALS (16 Suites)** | **209** | **0** | **0** | **49.85s** |

- **TypeScript Typecheck (`npx tsc --noEmit`):** PASS (0 errors)
- **Vite Production Build (`npm run build`):** PASS (3,566 modules transformed, exit code 0)
- **Git Diff Format Check (`git diff --check`):** PASS (0 errors)

---

## 8. Final Release-Gate Decision

### Final Status:
**`BLOCKED — APPROVAL OR BACKUP EVIDENCE MISSING`**

### Gate Evaluation Rationale:
1. **Technical Code Readiness:** `SATISFIED`. The code enhancements, localization strings, migration dry runs, rollback guardrails, and test suites are 100% verified locally with 0 errors across 209 automated assertions.
2. **Data & Evidence Consistency:** `SATISFIED`. PMEGP, PMUY, SBM(G), and PMAY-U 2.0 residence criteria have been reconciled against official ministry guidelines, and all 54 Central schemes match manifest counts without discrepancy.
3. **Physical Backup Evidence:** `BLOCKED`. An on-demand MongoDB Atlas snapshot must be taken and verified via the Atlas UI console before any write script is run. Physical restore remains untested.
4. **Accountable Sign-Offs:** `BLOCKED`. Named human approvers for Security & Data Privacy and Pilot Operations have not yet affixed recorded signatures in the approval register.

**Operational Directive:**  
All production mutation scripts, git commits, code pushes, and cloud deployments remain halted until the human approval register is executed and Atlas snapshot confirmation is recorded.

