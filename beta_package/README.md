# GovScheme Controlled Beta Package (Phase 10)

Welcome to the **GovScheme Controlled Beta Package**. This directory contains the complete operational, testing, verification, and governance documentation prepared for Phase 10 controlled beta readiness.

---

## Package Manifest

| Document | File Path | Purpose & Highlights |
| :--- | :--- | :--- |
| **Beta Test Plan** | [`BETA_TEST_PLAN.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/BETA_TEST_PLAN.md) | 5 verified synthetic citizen personas with deterministic rule engine outcomes, 7-locale matrix (EN, HI, TA, TE, ML, MR, GU), responsive viewports (320px–1440px), a11y keyboard navigation, and isolated document vault testing. |
| **Feedback & Incident Runbook** | [`FEEDBACK_AND_INCIDENT_RUNBOOK.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/FEEDBACK_AND_INCIDENT_RUNBOOK.md) | Privacy-minimizing defect reporting template (omitting citizen PII), P0–P3 triage SLAs, and multi-tier rollback procedures (Vercel frontend, Render backend, and strictly authorized database recovery). |
| **Scheme Verification Queue** | [`SCHEME_VERIFICATION_QUEUE.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/SCHEME_VERIFICATION_QUEUE.md) | Prioritized verification audit for 14 non-`.gov.in` URLs (MUDRA, APY, Stand-Up India, etc.) and procedural step enrichment queue for 34 schemes with brief instructions. |
| **Dependency Maintenance Plan** | [`DEPENDENCY_MAINTENANCE_PLAN.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/DEPENDENCY_MAINTENANCE_PLAN.md) | Analysis of 10 build/dev tool vulnerabilities (`tailwindcss`, `vite`, `esbuild`), zero production runtime exposure justification, and safe post-beta patch plan. |
| **Release Go/No-Go Checklist** | [`RELEASE_GO_NO_GO_CHECKLIST.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/RELEASE_GO_NO_GO_CHECKLIST.md) | 10 release verification gates (automated test suite, build guard, hosting, tenant isolation, approval sign-off) and final controlled beta recommendation. |

---

## Operating Instructions & Constraints
* **Environment:** Staging / Isolated Pilot only.
* **Prohibitions:** Do not deploy, push to `main`, run `git reset`, upgrade dependencies via `npm audit fix --force`, or execute production database migrations during this phase.
