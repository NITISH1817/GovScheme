# GovScheme Controlled Beta Pilot Issue Register

**Document Version:** 1.0.0-pilot  
**Phase:** Phase 12 — Controlled Beta Pilot  
**Triage Policy:** All P0/P1 defects halt testing; zero real PII permitted in logs.  

---

## Severity Definitions
* **P0 (Critical):** Service unavailable, database corruption, or security/PII leak. Immediate escalation.
* **P1 (High):** Major functional workflow blocked (e.g. search failure, eligibility calculation crash).
* **P2 (Medium):** Feature degraded or incorrect text/styling, with viable workaround available.
* **P3 (Low):** Minor cosmetic defect, alignment flaw, or localized typo not impeding core usage.

---

## Issue Register Table

| Issue ID | Date Logged | Area / Component | Severity | Summary | Steps to Reproduce (Sanitized) | Expected vs Actual | Assigned Owner | Status | Retest Status |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| `ISS-001` | 2026-10-21 | Backend API Infrastructure | `P2` | Render free-tier cold start delay on first request | 1. Leave API idle for >15 minutes.<br>2. Send `GET /api/health`. | Expected: <2s response.<br>Actual: 42.5s response on cold start. | Lead DevOps | `OPEN` | `NOT RETESTED` |
| `ISS-002` | 2026-10-21 | Scheme Discovery Modal | `P2` | 14 non-gov portal links lack statutory entity indicator | 1. Open scheme modal for `pm-mudra` or `atal-pension-yojana`.<br>2. Inspect official link banner. | Expected: Clear note explaining SIDBI/Protean ownership.<br>Actual: Generic domain displayed. | Content Team | `OPEN` | `NOT RETESTED` |
| `ISS-003` | 2026-10-21 | Application Guidance | `P3` | 34 schemes have only 2 high-level application steps | 1. Open scheme details for `agri-kisan-credit-card`.<br>2. Inspect application steps. | Expected: 3+ steps covering offline CSC submission.<br>Actual: 2 steps shown. | Content Team | `OPEN` | `NOT RETESTED` |

---

## Resolution Notes & History
* **`ISS-001` Mitigation:** In free-tier pilot environment, operators must be informed that the initial daily health check or request may take up to 45 seconds to spin up the container. Not a code defect.
* **`ISS-002` Mitigation:** Non-gov URLs queued in [`beta_package/SCHEME_VERIFICATION_QUEUE.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/SCHEME_VERIFICATION_QUEUE.md). Static verification completed; awaiting editorial badge integration in next phase.
* **`ISS-003` Mitigation:** Editorial step enrichment queued in [`beta_package/SCHEME_VERIFICATION_QUEUE.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/SCHEME_VERIFICATION_QUEUE.md).
