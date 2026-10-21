# GovScheme Feedback & Incident Response Runbook

**Document Version:** 1.0.0-beta  
**Operational Scope:** Controlled Beta / Pilot Operations  
**Classification:** Operational Security & Incident Response  

---

## 1. Review of Existing Platform Error & Feedback Mechanisms

### Current Frontend Behavior (`src/components/ErrorBoundary.tsx`)
* **Mechanism:** React Class Component catching unhandled runtime render exceptions.
* **Current Presentation:** Renders a user-facing card: `"Something went wrong"` with raw `error.toString()` displayed in a scrollable `font-mono` box.
* **Gaps Identified for Beta:**
  1. No structured "Copy Report" button.
  2. No automated inclusion of the current active Scheme ID, current locale, or viewport dimensions.
  3. No privacy warning advising the tester NOT to paste personal citizen information.

### Current Backend Behavior (`server/server.js`)
* **Mechanism:** Global structured JSON error handling middleware:
  ```javascript
  app.use((err, req, res, next) => {
    console.error('[Global Server Error Caught]:', err.message || err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'An unexpected error occurred on the server.'
    });
  });
  ```
* **Security Strengths:** Suppresses default Express HTML stack traces in responses; returns consistent JSON.
* **Gaps Identified for Beta:** No dedicated bug intake endpoint or audit correlation ID returned in error responses.

---

## 2. Privacy-Minimizing Pilot Defect Reporting Workflow

To ensure beta testers and CSC operators can report issues quickly without compromising citizen privacy, GovScheme mandates the following **Privacy-Preserving Defect Submission Standard**.

### Strict Data Sanitization Rules
> [!CAUTION]
> **NEVER include in defect reports:**
> - Real Citizen Names or Father's Names
> - 12-digit Aadhaar Numbers or Virtual IDs (VID)
> - Bank Account Numbers, IFSC codes, or UPI IDs
> - Mobile Numbers or Personal Email Addresses
> - Scanned or photographic copies of real government certificates

### Standardized Defect Report Template

When logging an issue in the issue tracker or sending to the pilot triage desk, testers must use this template:

```markdown
### GovScheme Beta Defect Report

**Report Identifier:** DEF-202610-[Auto/TesterID]
**Severity Level:** [P0 / P1 / P2 / P3]
**Date & UTC Time:** 2026-10-XX 00:00 UTC

#### 1. Context Information
- **Scheme ID:** (e.g., `pm-kisan`, `pm-ujjwala`, `tn-pudhumai-penn`, or `GLOBAL_DISCOVERY`)
- **Active Locale:** [en / hi / ta / te / ml / mr / gu]
- **Synthetic Persona Used:** [Persona 1 (Farmer) / Persona 2 (Student) / Persona 3 (Artisan) / Persona 4 (Vendor) / Persona 5 (Visitor)]
- **Client Device & OS:** [e.g., Android 14 / Windows 11 / iOS 17.5]
- **Browser & Version:** [e.g., Chrome Mobile 128 / Edge 129 / Firefox 130]
- **Viewport Dimensions:** [e.g., 360x800px / 1440x900px]

#### 2. Defect Description
- **Summary:** Concise single-sentence summary of the defect.
- **Steps to Reproduce:**
  1. Navigate to 'Explore Schemes' page with locale set to 'hi'.
  2. Apply Category filter 'Agriculture'.
  3. Select scheme card 'PM Kisan Samman Nidhi'.
  4. Click on 'Check Detailed Eligibility' button.
- **Expected Outcome:** Wizard opens with Hindi criteria headers and explains 3 requirements.
- **Actual Outcome:** Screen flickers or displays error alert: "Cannot read property 'undefined'".

#### 3. Sanitized Logs & Technical Data
- **Console Message:** `[Error] TypeError: Cannot read properties of undefined (reading 'split')`
- **Network Response Code:** `500 Internal Server Error` (if API failed)
- **Sanitized Request Payload:**
  ```json
  {
    "schemeId": "pm-kisan",
    "persona": "synthetic-farmer-1",
    "inputs": {
      "state": "Gujarat",
      "annualIncome": 95000,
      "landHolding": 2.5
    }
  }
  ```
```

---

## 3. Incident Severity Classification & Triage Matrix

```
+----------+------------------------------------+--------------------------+---------------+
| Severity | Description                        | Example Failure          | Triage Target |
+----------+------------------------------------+--------------------------+---------------+
| P0       | System down, security breach,      | Production backend 503,  | Immediate     |
| Critical | or credential/PII exposure.        | public document leak.    | (< 15 mins)   |
+----------+------------------------------------+--------------------------+---------------+
| P1       | Major workflow blocked for all     | Search returns 0 for     | Urgent        |
| High     | users; eligibility calculation broken. all queries; auth broken. | (< 2 hours)   |
+----------+------------------------------------+--------------------------+---------------+
| P2       | Functional degradation with        | Specific locale string   | Normal        |
| Medium   | workaround; single scheme error.   | garbled; print layout.   | (< 24 hours)  |
+----------+------------------------------------+--------------------------+---------------+
| P3       | Minor cosmetic or text imperfection| Typo in disclaimer; card | Next Patch    |
| Low      | not impeding core tasks.           | border misalignment.     | Cycle         |
+----------+------------------------------------+--------------------------+---------------+
```

---

## 4. Multi-Tier Incident Response & Rollback Runbook

```
                                  INCIDENT DETECTED
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
              Frontend Malfunction                Backend / API Failure
                        │                                   │
              [Tier 1: Vercel Rollback]           [Tier 2: Render Rollback]
              Instant zero-build switch           Deploy previous image
                        │                                   │
                        └─────────────────┬─────────────────┘
                                          ▼
                               Database Inconsistency?
                                          │
                         [Tier 3: Database Recovery]
                         (Requires Explicit Authorization
                          & Verified Backup Manifest)
```

### Tier 1: Frontend Instant Rollback (Vercel)
* **Trigger:** P0/P1 visual defect, client-side script exception blocking discovery, or bundle crash.
* **Pre-conditions:** Previous production deployment was verified stable.
* **Execution Procedure:**
  1. Access the Vercel Project Dashboard (`govhelp`).
  2. Navigate to **Deployments** tab.
  3. Locate the previous healthy deployment (pre-incident commit).
  4. Click the three dots menu (`...`) on that deployment -> Select **Promote to Production**.
  5. **Verification:** Confirm within 10 seconds that `https://govhelp.vercel.app` serves the healthy build hash without building new code.

### Tier 2: Backend API Rollback (Render)
* **Trigger:** Backend crashing (`502 Bad Gateway`, crash loop), JWT signature failure, CORS rejection across all origins.
* **Execution Procedure:**
  1. Access Render Dashboard -> Service `govscheme-api`.
  2. Navigate to **Events & Deploys**.
  3. Select the deployment prior to the offending release.
  4. Click **Rollback to this deploy**.
  5. Check logs to confirm:
     * `[Database] MongoDB Connected successfully`
     * `GovScheme AI Express Backend running on port 10000`
  6. **Health Probe:** Execute HTTP GET to `https://govscheme-api.onrender.com/api/health` and verify HTTP 200:
     ```json
     {
       "status": "healthy",
       "services": { "database": "connected", "server": "online" }
     }
     ```

### Tier 3: Database Recovery Protocol (MongoDB)

> [!CAUTION]
> **CRITICAL PROTOCOL SAFETY RULE:**  
> **Database recovery MUST NEVER be executed automatically.**  
> It must require **explicit written authorization** from the Platform Lead and Database Custodian, accompanied by a cryptographically verified backup manifest.

#### Prerequisites Before Considering Database Recovery
1. **Authorization Verification:**
   * Signed change ticket with reason for recovery (e.g. verified catalogue corruption).
   * Written sign-off from:
     * Lead System Architect
     * Database Administrator / Release Lead
2. **Backup Manifest Verification:**
   * Verify the target backup directory exists in `backups/` or cold storage.
   * Run SHA256 checksum verification on the backup manifest.
   * Confirm exact document count matches expected baseline:
     * `schemes` collection: Exactly **75** canonical documents.
     * `users` collection: Preserved administrator accounts.

#### Step-by-Step Restoration Protocol (Informational Runbook)
1. **Place Application in Maintenance Mode:**
   * Set frontend notice or redirect traffic to prevent concurrent citizen writes.
2. **Execute Snapshot Dry Run:**
   * Inspect target MongoDB instance:
     ```bash
     mongosh "$MONGODB_URI" --eval "db.schemes.countDocuments()"
     ```
3. **Execute Targeted Restore with Drop Precaution:**
   * Restore ONLY the corrupted collection (e.g., `schemes`) rather than the entire database to preserve active citizen accounts:
     ```bash
     mongorestore --uri="$MONGODB_URI" --collection=schemes --db=govscheme --drop backups/verified_manifest/govscheme/schemes.bson
     ```
4. **Post-Restore Integrity Audit:**
   * Verify total scheme count equals 75:
     ```bash
     mongosh "$MONGODB_URI" --eval "db.schemes.countDocuments(); db.schemes.distinct('category')"
     ```
   * Query sample canonical records (`pm-kisan`, `atal-pension-yojana`).
5. **Resume Normal Service & Monitor:**
   * Remove maintenance mode and monitor API error rates for 30 minutes.
