# GovScheme Controlled Beta Package (Phase 12)

Welcome to the **GovScheme Controlled Beta Package**. This directory contains the operational, testing, verification, governance, and logging templates for the Controlled Beta Pilot.

---

## Package Manifest

### 1. Governance & Authorization
| Document | File Path | Purpose & Highlights |
| :--- | :--- | :--- |
| **Pilot Decision Packet** | [`PILOT_DECISION_PACKET.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_DECISION_PACKET.md) | Concise executive summary of approval status, reconciled test coverage, blockers, and gate criteria. |
| **Pilot Approval Request** | [`PILOT_APPROVAL_REQUEST.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_APPROVAL_REQUEST.md) | Formal stakeholder sign-off request template for Technical Lead and Pilot Operations Coordinator. **Status: BLOCKED PENDING APPROVAL.** |
| **Release Go/No-Go Checklist** | [`RELEASE_GO_NO_GO_CHECKLIST.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/RELEASE_GO_NO_GO_CHECKLIST.md) | 10 release verification gates (automated test suite, build guard, hosting, tenant isolation, approval sign-off). |

### 2. Operational Planning & Risk Management
| Document | File Path | Purpose & Highlights |
| :--- | :--- | :--- |
| **Pilot Execution Plan** | [`PILOT_EXECUTION_PLAN.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_EXECUTION_PLAN.md) | Roles, 5-day time-box schedule, test allocations, synthetic persona targets, and formal pilot exit criteria. |
| **Operational Risks & Mitigations** | [`PILOT_OPERATIONAL_RISKS.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_OPERATIONAL_RISKS.md) | Detailed analysis of Render cold-start latency, build-time dependency advisories, and external portal handling. |
| **Dependency Maintenance Plan** | [`DEPENDENCY_MAINTENANCE_PLAN.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/DEPENDENCY_MAINTENANCE_PLAN.md) | Audit of 10 build/dev tool vulnerabilities (`tailwindcss`, `vite`, `esbuild`), zero production runtime exposure justification, and post-beta roadmap. |
| **Feedback & Incident Runbook** | [`FEEDBACK_AND_INCIDENT_RUNBOOK.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/FEEDBACK_AND_INCIDENT_RUNBOOK.md) | Privacy-minimizing defect reporting template (omitting citizen PII), P0–P3 triage SLAs, and multi-tier rollback procedures. |

### 3. Test Specifications & Execution Tracking
| Document | File Path | Purpose & Highlights |
| :--- | :--- | :--- |
| **Beta Test Plan** | [`BETA_TEST_PLAN.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/BETA_TEST_PLAN.md) | 5 verified synthetic citizen personas with deterministic rule outcomes, 7-locale matrix (EN, HI, TA, TE, ML, MR, GU), responsive viewports (320px–1440px), a11y keyboard navigation, and isolated document vault testing. |
| **Pilot Execution Log** | [`PILOT_EXECUTION_LOG.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_EXECUTION_LOG.md) | Structured test run-sheet with 24 pre-populated test cases, execution status, evidence links, and defect cross-references. |
| **Pilot Issue Register** | [`PILOT_ISSUE_REGISTER.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_ISSUE_REGISTER.md) | Standardized issue log tracking severity (P0–P3), reproduction steps, assigned owners, resolution status, and retest evidence. |
| **Scheme Verification Queue** | [`SCHEME_VERIFICATION_QUEUE.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/SCHEME_VERIFICATION_QUEUE.md) | Prioritized verification audit for 14 non-`.gov.in` URLs and procedural step enrichment queue for 34 schemes with brief instructions. Includes Section 5 statutory audit log. |
| **Pilot Exit Report (Template)** | [`PILOT_EXIT_REPORT_TEMPLATE.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_EXIT_REPORT_TEMPLATE.md) | Formal end-of-pilot assessment template evaluating test completion, defect counts, persona determinism, and final public release recommendation. |

---

## Operating Instructions & Constraints
* **Environment:** Staging & Public Frontend (`https://govhelp.vercel.app` backed by `https://govscheme-api.onrender.com`).
* **Strict Prohibitions:**
  * Do NOT use real citizen names, Aadhaar numbers, or personal documents.
  * Do NOT deploy, push to `main`, or run `git reset`.
  * Do NOT upgrade dependencies via `npm audit fix --force`.
  * Do NOT execute production database migrations or synchronization scripts.
  * Do NOT onboard external users until [`PILOT_APPROVAL_REQUEST.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_APPROVAL_REQUEST.md) is signed.
