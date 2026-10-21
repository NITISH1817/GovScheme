# GovScheme Controlled Beta Pilot Approval Request

**Document Version:** 1.0.0-pilot  
**Date:** 2026-10-21  
**Target Release Candidate:** Commit `4989548`  
**Current Status:** **BLOCKED PENDING STAKEHOLDER APPROVAL**  

---

## 1. Request Context & Verification Evidence

The GovScheme web application (`https://govhelp.vercel.app` backed by `https://govscheme-api.onrender.com`) has completed Phase 10 Controlled Beta Preparation and Phase 11 Post-Push Live Verification:

* **Automated Quality:** All 14 regression test suites passed with exit code 0 (`npm test`).
* **Production Build Guard:** Strict HTTPS validation verified (8/8 checks passed); insecure HTTP and localhost rejected.
* **Type Safety & Working Tree:** Clean compilation (`npx tsc --noEmit` 0 errors); clean git status.
* **Live Deployment Reachability:** Live frontend (Vercel) and backend health probe (`/api/health`) verified operational (`200 OK`, MongoDB connected).
* **Live Smoke Test:** Verified in headless browser (search relevance, scheme details modal, Escape key modal dismiss, Hindi language switch).
* **Beta Documentation:** Beta Test Plan, Incident Runbook, Verification Queue, and Dependency Plan established in `beta_package/`.

---

## 2. Scope of Requested Authorization

Authorization is requested **strictly** for:
1. Conducting a 5-day time-boxed pilot with **designated internal testers (2)** and **approved CSC kiosk operators (3)**.
2. Executing test cases using **synthetic citizen personas (1–5)** and watermarked synthetic documents.
3. Logging test outcomes in [`beta_package/PILOT_EXECUTION_LOG.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_EXECUTION_LOG.md) and logging defects in [`beta_package/PILOT_ISSUE_REGISTER.md`](file:///c:/Users/nitishpriyanrs/OneDrive/Documents/new_miniproject/GovScheme/beta_package/PILOT_ISSUE_REGISTER.md).

---

## 3. Strict Operating Invariants During Pilot

* **Zero Real PII:** No real citizen names, Aadhaar numbers, phone numbers, or scanned documents will be entered or uploaded.
* **No Database Mutation:** No production database scripts, migrations, or sync operations will be run.
* **Zero External Outreach:** No public announcements, automated emails, or open registrations will occur.
* **Immediate Rollback Readiness:** Tier 1 (Vercel) and Tier 2 (Render) rollback procedures will remain active.

---

## 4. Formal Stakeholder Decision & Sign-Off

```
[ ] APPROVED: Proceed with Controlled Beta Pilot according to PILOT_EXECUTION_PLAN.md.
[X] HOLD / BLOCKED: Pilot onboarding remains blocked until review signatures are affixed below.
```

### Sign-Off Approvals

**Technical Lead:**  
* Decision: `[ PENDING REVIEW ]`  
* Name: ____________________________________  
* Signature: _______________________________  
* Date: ____________________________________  

**Pilot Operations Coordinator:**  
* Decision: `[ PENDING REVIEW ]`  
* Name: ____________________________________  
* Signature: _______________________________  
* Date: ____________________________________  

**Security & Data Privacy Officer:**  
* Decision: `[ PENDING REVIEW ]`  
* Name: ____________________________________  
* Signature: _______________________________  
* Date: ____________________________________  
