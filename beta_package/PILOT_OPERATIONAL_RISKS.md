# GovScheme Controlled Beta Operational Risks & Mitigations

**Document Version:** 1.0.0-pilot  
**Phase:** Phase 12 — Controlled Beta Pilot  
**Review Scope:** Infrastructure, Dependencies, External Links, and Runtime Operational Constraints  
**Policy Status:** Zero Infrastructure Mutations & Zero Lockfile Updates During Beta  

---

## 1. Executive Summary

This document consolidates known operational risks, environmental constraints, and mitigation strategies for the GovScheme Controlled Beta Pilot. All mitigations are designed to maintain platform stability without introducing changes to production hosting or dependencies.

---

## 2. Risk Matrix Overview

```
+--------+-------------------------------------+----------+------------------------------------+--------------------------+
| Risk ID| Risk Category                       | Severity | Primary Impact                     | Mitigation Status        |
+--------+-------------------------------------+----------+------------------------------------+--------------------------+
| RSK-01 | Render Free-Tier Container Spin-Down| Medium   | 35–50s initial latency on cold start| Documented operator warm |
| RSK-02 | Build-Time Dependency Advisories    | Low      | 10 npm audit items in dev tools    | Zero runtime exposure;   |
|        |                                     |          |                                    | Lockfile freeze enforced |
| RSK-03 | External Non-`.gov.in` Domain Links | Medium   | Tester/Citizen verification doubts | Clear in-app disclaimers |
| RSK-04 | High-Level Procedural Instructions  | Low      | 34 schemes have 2-step guidance    | Offline CSC notes queued |
| RSK-05 | Accidental Production Data Mutation | Critical | Data integrity compromise          | Read-only pilot rule;    |
|        |                                     |          |                                    | DB scripts forbidden     |
+--------+-------------------------------------+----------+------------------------------------+--------------------------+
```

---

## 3. Detailed Operational Risk Analysis

### Risk RSK-01: Render Free-Tier Cold-Start Latency
* **Observed Reality:** During Phase 11 live verification, `GET https://govscheme-api.onrender.com/api/health` required **42.5 seconds** when waking from a spun-down state.
* **Technical Cause:** Render spins down free-tier web services after 15 minutes of inactivity to conserve compute resources.
* **Impact on Beta:** Testers initiating their first session of the day may perceive a temporary freeze if unaware of container startup delays. Subsequent requests respond within 150–300ms.
* **Mitigation & Operator Protocol:**
  1. Pilot operators are instructed to perform an initial "Warm-Up Request" (visiting `https://govhelp.vercel.app` and clicking Schemes) 2 minutes before conducting user testing.
  2. **Strict Guardrail:** Automated health pings (via cron or third-party uptime monitoring) are **PROHIBITED** without explicit stakeholder budget and architectural approval.

---

### Risk RSK-02: Build-Time Dependency Advisories (10 Items)
* **Observed Reality:** `npm audit` reports 10 vulnerabilities (3 Moderate, 7 High) in `braces`, `chokidar`, `fast-glob`, `postcss-nested`, `esbuild`, `vite`, and `follow-redirects`.
* **Technical Cause:** Sub-dependency trees of `tailwindcss@3.4.x` and `vite@5.4.x` devDependencies.
* **Production Runtime Exposure:** **Zero.** The production frontend bundle consists solely of compiled static JavaScript/CSS assets served over Vercel's Edge CDN. The Express backend runtime (`server/server.js`) does not import or execute any build-time tools.
* **Mitigation & Guardrail:**
  1. Maintain strict lockfile freeze (`package.json` and `package-lock.json`).
  2. **Do NOT run `npm audit fix --force`:** Forcing updates triggers breaking migrations (`tailwindcss@4.x` and `vite@8.x`) that destroy custom styling tokens and plugin hooks.
  3. Safe patch plan scheduled for post-beta maintenance ([`beta_package/DEPENDENCY_MAINTENANCE_PLAN.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/DEPENDENCY_MAINTENANCE_PLAN.md)).

---

### Risk RSK-03: External Non-`.gov.in` Official Links
* **Observed Reality:** 14 schemes link to official portals on `.org.in`, `.com`, `.in`, or `.co.in` domains (e.g., `mudra.org.in`, `cmchistn.com`, `standupmitra.in`).
* **Technical Cause:** Government schemes managed by statutory corporations (SIDBI, LIC) or authorized contractors (Protean CRA, United India Insurance).
* **Impact on Beta:** Operators may question whether links are authentic or third-party phishing.
* **Mitigation:**
  1. Verified statutory lineage documented in [`beta_package/SCHEME_VERIFICATION_QUEUE.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/SCHEME_VERIFICATION_QUEUE.md).
  2. Scheme modal displays verified source panel and advisory notice informing users they are transitioning to an authorized external service.

---

### Risk RSK-04: Procedural Instruction Depth (34 Schemes)
* **Observed Reality:** 34 schemes provide only 2 application steps in the catalogue.
* **Impact on Beta:** CSC operators assisting rural citizens may require details on physical form submission at Taluk/Block offices.
* **Mitigation:** Operators will reference the procedural guidance specification in [`beta_package/SCHEME_VERIFICATION_QUEUE.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/SCHEME_VERIFICATION_QUEUE.md) and log gaps in [`beta_package/PILOT_ISSUE_REGISTER.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_ISSUE_REGISTER.md).

---

### Risk RSK-05: Accidental Production Data Mutation
* **Observed Reality:** Production MongoDB cluster hosts the active citizen catalogue.
* **Impact on Beta:** Running import or sync scripts against production could overwrite catalogue records.
* **Strict Guardrail:**
  1. Production database sync scripts (`sync_mongodb_75.js`, `importSchemes.js`) are strictly forbidden during the pilot.
  2. Database recovery requires dual written sign-off and a verified backup manifest ([`beta_package/FEEDBACK_AND_INCIDENT_RUNBOOK.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/FEEDBACK_AND_INCIDENT_RUNBOOK.md)).
