# GovScheme Release Go / No-Go Checklist

**Document Version:** 1.0.0-beta  
**Phase:** Phase 10 Controlled Beta Preparation  
**Target Release:** Controlled Beta Candidate (Build Guard Hardened)  
**Status:** RELEASE GATE HOLD ACTIVE (Controlled Beta Authorized in Isolated Pilot)  

---

## 1. Release Evaluation Framework

This checklist defines the non-negotiable gates that must be satisfied before transitioning GovScheme from development to pilot deployment. Every gate requires verification evidence and a binary status (`PASS` / `FAIL`).

```
+----------------------------------------------------------------------------------------------------+
|                                    RELEASE GATES SUMMARY DASHBOARD                                 |
+------+-----------------------------------+--------------------------------+-------------+----------+
| Gate | Verification Domain               | Requirement Summary            | Evidence    | Status   |
+------+-----------------------------------+--------------------------------+-------------+----------+
| G-01 | Automated Test Suite              | 14/14 Regression Suites Pass   | Exit code 0 | PASS     |
| G-02 | Production Build Guard            | Strict HTTPS validation; fails | 8/8 tests   | PASS     |
|      |                                   | on HTTP, localhost, empty URL  | passed      |          |
| G-03 | TypeScript Compilation            | Zero compile/type errors       | Exit code 0 | PASS     |
| G-04 | Working Tree Integrity            | Clean line endings, 0 conflict | Exit code 0 | PASS     |
| G-05 | Hosting Configuration (Vercel)    | VITE_API_URL HTTPS, dist dir   | Static audit| PASS     |
| G-06 | Hosting Configuration (Render)    | JWT_SECRET, CORS, MongoDB URI  | Static audit| PASS     |
| G-07 | Privacy & Tenant Isolation        | Zero PII, mock doc isolation   | Code audit  | PASS     |
| G-08 | Scheme Source Verification        | 14 non-gov URLs documented     | Queue doc   | PASS     |
| G-09 | Incident Response Readiness       | Rollback runbook, /api/health  | Runbook doc | PASS     |
| G-10 | Final Release Approval Sign-off   | Dual sign-off by Tech & QA Lead| Pending     | HOLD     |
+------+-----------------------------------+--------------------------------+-------------+----------+
```

---

## 2. Detailed Release Verification Gates

### Gate G-01: Automated Test Suite (14 Regression Suites)
- [x] **Auth & Token Verification:** JWT signing, role assignment, password hashing.
- [x] **JWT Fail-Fast Guard:** Server immediately halts on startup if `JWT_SECRET` is unset.
- [x] **CORS Configuration:** Origin validation restricts access to authorized domains.
- [x] **Express Security Middleware:** Rate limiting, payload truncation, helmet headers.
- [x] **Document OCR & Vault Isolation:** Upload paths sanitized; cross-tenant document queries blocked.
- [x] **State Persistence:** Filter and user session hydration validated across reloads.
- [x] **Admin Lifecycle:** Role-based access controls for scheme editor and audit views.
- [x] **AI Audit Logging:** Scheme recommendation engine logs anonymized inputs.
- [x] **Semantic Search Engine:** Synonyms and typo-tolerant search queries return relevant matches.
- [x] **Explainable Eligibility Engine:** Deterministic rule evaluation for 75 schemes.
- [x] **Multilingual Localization:** All 7 locales (EN, HI, TA, TE, ML, MR, GU) pass interpolation tests.
- [x] **Production Build Guard:** Build script enforces HTTPS production API endpoints.
- [x] **Kiosk Mode Security:** PIN entry, session auto-reset timer, sanitized thermal receipt data.
- [x] **Profile View Navigation:** Breadcrumb integrity and smooth view switching.
* **Evidence:** `npm test` completed with **14 passed suites, 0 failed, exit code 0**.

---

### Gate G-02: Production Build Guard Hardening
- [x] Fails closed with exit code 1 when `VITE_API_URL` is omitted in production build.
- [x] Fails closed with exit code 1 when `VITE_API_URL` uses insecure `http://`.
- [x] Fails closed with exit code 1 when `VITE_API_URL` points to loopback (`localhost`, `127.0.0.1`).
- [x] Passes with exit code 0 when `VITE_API_URL=https://govscheme-api.onrender.com`.
* **Evidence:** `node tests/production_build_guard.test.js` executed with **8/8 checks passed**.

---

### Gate G-03: TypeScript Type Safety
- [x] All React components, data interfaces, and translation maps strictly typed.
- [x] No implicit `any` leaks in new components.
* **Evidence:** `npx tsc --noEmit` executed with **0 errors, exit code 0**.

---

### Gate G-04: Working Tree & Code Integrity
- [x] `git diff --check` executed with clean output (no trailing whitespace errors, no conflict markers).
- [x] Every pre-existing modification preserved intact.
- [x] Zero bulk staging (`git add .`) or destructive operations.
* **Evidence:** Verified via `git status --short` and `git diff --check`.

---

### Gate G-05: Vercel Frontend Configuration Checks
- [x] **Project Build Command:** Configured to `npm run build`.
- [x] **Output Directory:** Set to `dist`.
- [x] **Environment Variables:**
  * `VITE_API_URL`: Verified to contain `https://govscheme-api.onrender.com` (no trailing slash).
- [x] **Edge Routing:** `vercel.json` provides rewrite rules routing `/*` to `/index.html` for client-side routing.

---

### Gate G-06: Render Backend Configuration Checks
- [x] **Start Command:** `npm run server`.
- [x] **Environment Variables:**
  * `NODE_ENV`: Set to `production`.
  * `PORT`: Set to `10000` (Render default).
  * `MONGODB_URI`: Points to secure MongoDB Atlas cluster.
  * `JWT_SECRET`: High-entropy 64-character secret.
  * `CLIENT_URL`: Set to `https://govhelp.vercel.app` (matching Vercel domain).
  * `ADMIN_SEED_PASSWORD`: Custom production password (default seed suppressed in production).

---

### Gate G-07: Privacy, Data Protection & Tenant Isolation
- [x] **Zero Real PII:** Repository contains no real citizen Aadhaar numbers, phone numbers, or scanned documents.
- [x] **Tenant Document Isolation:** Backend document endpoints strictly check `req.user._id === document.userId` before returning file streams.
- [x] **CORS Restriction:** API rejects unauthorized external origins with `403 Forbidden`.

---

### Gate G-08: Scheme Source Verification Queue
- [x] **Catalogue Baseline:** 75 canonical schemes documented.
- [x] **Non-Gov Domains Identified:** 12 official websites and 10 application URLs catalogued with statutory agency verification notes (`beta_package/SCHEME_VERIFICATION_QUEUE.md`).
- [x] **Advisory Disclaimer:** Scheme modal explicitly states GovScheme is an informational service and directs citizens to authorized portals.

---

### Gate G-09: Monitoring, Health Check & Incident Response
- [x] Health check endpoint `/api/health` reports status 200 with dynamic MongoDB connection status.
- [x] Tier 1 (Vercel instant rollback) and Tier 2 (Render deploy rollback) procedures documented.
- [x] Tier 3 (Database recovery) strictly gated behind explicit authorization and verified backup manifest.
- [x] Standardized privacy-preserving defect reporting template created (`beta_package/FEEDBACK_AND_INCIDENT_RUNBOOK.md`).

---

### Gate G-10: Release Sign-Off (Hold Active)
- [ ] Technical Lead Sign-Off: `[PENDING FORMAL REVIEW]`
- [ ] Security & Privacy Officer Sign-Off: `[PENDING FORMAL REVIEW]`
- [ ] Pilot Operations Coordinator Sign-Off: `[PENDING FORMAL REVIEW]`

---

## 3. Go / No-Go Recommendation

### Formal Decision: **GO FOR CONTROLLED BETA (IN ISOLATED PILOT) — HOLD ON PRODUCTION MUTATION**

* **Authorized Activity:**  
  The platform is **architecturally, functionally, and operationally ready** for a controlled pilot using synthetic profiles, offline CSC operator testing, and staged feedback collection.
* **Prohibited Activity:**  
  No production database sync, package upgrades (`npm audit fix --force`), DNS changes, or git pushes should be performed during this controlled beta phase. Gate G-10 remains on hold until the pilot test results are compiled.
