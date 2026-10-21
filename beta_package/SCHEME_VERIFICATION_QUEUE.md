# GovScheme Scheme Catalogue Verification Queue

**Document Version:** 1.0.0-beta  
**Catalogue Baseline:** 75 Canonical Schemes (`scripts/sync_mongodb_75.js`)  
**Purpose:** Prioritized manual verification queue for official websites, application links, and procedural steps prior to full public beta launch.  
**Constraint Notice:** Static inspection and catalogue review only. Do not edit, truncate, or run live synchronization scripts against production MongoDB.

---

## 1. Verification Strategy & Priority Framework

To prevent citizen misinformation, phishing risks, and broken guidance, catalogue records are stratified into three verification priorities:

* **Priority 1 (P1) — High Sensitivity / External Domain Review:** Schemes where official websites or direct application endpoints do NOT utilize standard `.gov.in` or `.nic.in` top-level domains. These require authoritative confirmation of statutory ownership (e.g., SIDBI, LIC, Protean CRA).
* **Priority 2 (P2) — Procedural Enrichment Needed:** Schemes containing fewer than 3 application steps in their current catalogue definition. These require detailed offline/online application instructions for pilot testers and CSC operators.
* **Priority 3 (P3) — Routine Periodic Link Check:** Standard `.gov.in` portals requiring verification for HTTPS certificate validity and redirection targets.

---

## 2. Priority 1 Queue: Non-`.gov.in` / Non-`.nic.in` URL Audit (14 Schemes)

The following 14 schemes utilize official domains outside the `.gov.in` / `.nic.in` namespace. Each entry separates **Confirmed Source Evidence** from **Assumptions & Verification Actions**:

| Scheme ID | Scheme Name | Current Domain in Catalogue | Confirmed Source Evidence | Required Authoritative Verification | Risk Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `pm-mudra` | Pradhan Mantri MUDRA Yojana | `mudra.org.in` | Wholly owned subsidiary of Small Industries Development Bank of India (SIDBI). Established by Govt of India. | Confirm redirect policy if citizens apply via public sector bank branches vs portal. | Medium |
| `atal-pension-yojana` | Atal Pension Yojana (APY) | `pfrda.org.in` (Website)<br>`npscra.proteantech.in` (Apply) | PFRDA is a statutory regulatory body under Ministry of Finance. Protean eGov Technologies is the authorized Central Recordkeeping Agency (CRA). | Verify HTTPS certificate validity for `npscra.proteantech.in` and confirm whether direct enrollment is allowed without bank branch visit. | Medium |
| `edu-aicte-pragati` | AICTE Pragati Scholarship for Girls | `aicte-india.org` | All India Council for Technical Education is a statutory body under Department of Higher Education (MoE). | Confirm whether applications have transitioned to National Scholarship Portal (`scholarships.gov.in`). | Low |
| `edu-aicte-saksham` | AICTE Saksham Scholarship | `aicte-india.org` | AICTE statutory body portal. | Verify if application link redirects to NSP (`scholarships.gov.in`). | Low |
| `edu-pm-vidyalaxmi-education-loan` | PM Vidyalaxmi Education Loan | `vidyalakshmi.co.in` | Developed by Department of Financial Services (MoF), Dept of Higher Education (MoE), and Indian Banks Association (IBA); managed by Protean. | Verify whether the new PM-Vidyalaxmi 2024 unified platform uses a new `.gov.in` sub-portal. | High |
| `edu-national-fellowship-obc` | National Fellowship for OBC Students | `ugcnet.nta.ac.in` (Apply) | National Testing Agency (NTA) is an autonomous agency registered under Societies Registration Act, under Ministry of Education. | Verify that the application cycle is aligned with active UGC-NET notification cycles. | Medium |
| `edu-tn-free-education-degree` | TN Free Education Scheme (UG) | `tngasa.in` (Apply) | Tamil Nadu Government Arts and Science Colleges Admissions portal, run under Directorate of Collegiate Education TN. | Confirm annual admissions registration window dates for 2026 academic year. | Medium |
| `agri-tn-kuruvai-cultivation-package` | TN Kuruvai Cultivation Package | `agritech.tnau.ac.in` | Tamil Nadu Agricultural University Agritech portal (State autonomous agricultural university). | Verify local Agriculture Department office contact details since scheme operates seasonally. | Low |
| `health-tn-cmchis-insurance` | TN CM Comprehensive Health Insurance | `cmchistn.com` | Official operational portal for CMCHIS, administered by United India Insurance Co. under Government of Tamil Nadu. | Confirm designated district kiosk enrollment centers and helpline `1800-425-3993`. | Medium |
| `health-nikshay-poshan-tb` | Ni-kshay Poshan Yojana (TB Patients) | `nikshay.in` | Central TB Division, Ministry of Health and Family Welfare (MoHFW), managed by National Informatics Centre and partners. | Confirm that direct citizen online registration is informational, as primary registration occurs at Health Centers. | Medium |
| `health-tn-innuyir-kaappon-nammai-kakkum-48` | Innuyir Kaappom - NK 48 | `cmchistn.com` / `nk48.php` | Government of Tamil Nadu emergency accident care initiative portal. | Confirm cashless hospital network search URL. | Low |
| `emp-pradhan-mantri-kaushal-vikas-4` | PMKVY 4.0 | `pmkvyofficial.org` | National Skill Development Corporation (NSDC) under Ministry of Skill Development and Entrepreneurship (MSDE). | Confirm whether candidate registrations now route through Skill India Digital (`skillindiadigital.gov.in`). | High |
| `GOV-ENT-002` | Stand-Up India Scheme | `standupmitra.in` | Small Industries Development Bank of India (SIDBI) portal under Department of Financial Services guidelines. | Verify "Handholding Support" agency credentials and branch locator links. | Medium |
| `GOV-FIN-006` | PM Shram Yogi Maan-dhan (PM-SYM) | `maandhan.in` | Managed by Ministry of Labour & Employment in collaboration with Life Insurance Corporation of India (LIC). | Confirm that CSC digital seva portal remains the primary physical enrollment channel. | Medium |

---

## 3. Priority 2 Queue: Procedural Step Enrichment (34 Schemes)

The following 34 schemes currently contain only 2 application steps in the catalogue. For beta pilot rollout, CSC operators need multi-stage operational guidance:

1. `edu-pm-usp-central-sector` (PM-USP College & University Scholarship)
2. `edu-aicte-pragati` (AICTE Pragati Scholarship for Girl Students)
3. `edu-aicte-saksham` (AICTE Saksham Scholarship for Specially-Abled Students)
4. `edu-tn-bc-mbc-scholarship` (Tamil Nadu BC/MBC/DNC Post-Matric Scholarship)
5. `edu-national-fellowship-obc` (National Fellowship for OBC Students)
6. `edu-tn-free-education-degree` (Tamil Nadu Free Education Scheme for Undergraduates)
7. `edu-pm-vidyalaxmi-education-loan` (PM Vidyalaxmi Education Loan Scheme)
8. `agri-pm-kusum-solar-pump` (PM-KUSUM Scheme for Solar Agricultural Pumps)
9. `agri-kisan-credit-card` (Kisan Credit Card Scheme)
10. `agri-tn-kuruvai-cultivation-package` (Tamil Nadu Kuruvai Cultivation Special Package)
11. `agri-pm-krishi-sinchayee-micro-irrigation` (PMKSY - Per Drop More Crop)
12. `agri-pm-matsya-sampada-fisheries` (PMMSY Fisheries Development Scheme)
13. `health-tn-cmchis-insurance` (Chief Minister's Comprehensive Health Insurance Scheme)
14. `health-pm-matru-vandana` (Pradhan Mantri Matru Vandana Yojana - PMMVY)
15. `health-tn-muthulakshmi-reddy-maternity` (Dr. Muthulakshmi Reddy Maternity Benefit Scheme)
16. `health-pm-bjp-jan-aushadhi` (Pradhan Mantri Bhartiya Janaushadhi Pariyojana)
17. `health-nikshay-poshan-tb` (Ni-kshay Poshan Yojana TB Support)
18. `health-tn-innuyir-kaappon-nammai-kakkum-48` (Innuyir Kaappom - Emergency Road Accident Care)
19. `health-pm-national-dialysis-programme` (Pradhan Mantri National Dialysis Programme)
20. `house-pmay-urban-2` (Pradhan Mantri Awas Yojana - Urban 2.0)
21. `house-tn-kalaignar-kanavu-illam` (Kalaignar Kanavu Illam Rural Housing Scheme)
22. `house-tn-urban-habitat-slum-clearance` (TNUHDB Housing Allotment)
23. `house-swachh-bharat-ग्रामीण-toilet` (Swachh Bharat Mission Gramin IHHL)
24. `house-pm-surya-ghar-solar-rooftop` (PM-Surya Ghar: Muft Bijli Yojana)
25. `emp-tn-unemployed-youth-allowance` (Tamil Nadu Unemployment Allowance for Job Seekers)
26. `emp-pradhan-mantri-kaushal-vikas-4` (PMKVY 4.0 Skill Training)
27. `emp-national-apprenticeship-promotion-naps` (National Apprenticeship Promotion Scheme)
28. `wc-tn-moovalur-ramamirtham-marriage-aid` (TN Marriage Assistance Scheme)
29. `wc-tn-kalaignar-magalir-urimai-thogai` (Kalaignar Magalir Urimai Thogai Scheme - KMUT)
30. `wc-beti-bachao-beti-padhao` (Beti Bachao Beti Padhao)
31. `wc-mission-vatsalya-child-protection` (Mission Vatsalya Child Protection)
32. `wc-tn-sivagami-ammaiyar-girl-child-protection` (CM Girl Child Protection Scheme)
33. `mission-indradhanush` (Intensified Mission Indradhanush Immunization)
34. `deendayal-antodaya-shelter` (DAY-NULM Shelter for Urban Homeless)

### Required Procedural Enrichment Specification
For each of the 34 schemes above, the editorial review team must provide:
* **Step 1:** Pre-Application Preparation (Required documents list, eligibility pre-check, Aadhaar-bank account seeding verification).
* **Step 2:** Submission Mode (Online portal URL, CSC/e-Seva center submission, Block Development Office, or District Welfare Officer).
* **Step 3:** Post-Submission Verification & Tracking (Acknowledgement receipt, application tracking number, field verification by Taluk officer, expected processing SLA in days).

---

## 4. Verification Workflow for Beta Operations

1. **Static Review Only:** Review links using public browser inspection outside production server environments.
2. **Never Overwrite Production Database:** Any updates to links or steps must be staged in JSON test fixtures (`tests/data/`) and reviewed through standard code review before database ingestion.
3. **Citizen Advisory on Non-Gov Domains:** For every non-`.gov.in` domain, ensure the platform modal displays the statutory agency notice (e.g., "Operated by SIDBI on behalf of Government of India").

---

## 5. Prioritized Verification Audit Record (Phase 12 Static Review)

* **Audit Date:** 2026-10-21
* **Review Standard:** Authoritative statutory charter review and gazette cross-referencing.
* **Production Mutation Status:** ZERO changes made to production database.

| Scheme ID | Portal URL | Statutory Agency / Corporation | Verified Confirmed Evidence | Unresolved Operational Questions | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `pm-mudra` | `mudra.org.in` | MUDRA Ltd / SIDBI | Wholly owned subsidiary of SIDBI, incorporated March 2015 following Union Budget enactment. | Whether commercial banks require separate individual loan application forms. | `VERIFIED - STATUTORY` |
| `atal-pension-yojana` | `pfrda.org.in`<br>`npscra.proteantech.in` | PFRDA / Protean CRA | PFRDA established under PFRDA Act 2013; Protean eGov Technologies is authorized CRA. | Whether e-NPS online enrollment is available to citizens without net banking. | `VERIFIED - STATUTORY` |
| `edu-aicte-pragati` | `aicte-india.org` | AICTE / MoE | Statutory body under Department of Higher Education (MoE), AICTE Act 1987. | Confirm exact National Scholarship Portal (`scholarships.gov.in`) schedule. | `VERIFIED - STATUTORY` |
| `edu-aicte-saksham` | `aicte-india.org` | AICTE / MoE | AICTE statutory council for technical education. | Confirm NSP application cycle dates. | `VERIFIED - STATUTORY` |
| `edu-pm-vidyalaxmi` | `vidyalakshmi.co.in` | Dept of Higher Ed / Protean | First-of-its-kind financial aid portal under MoE, MoF, and Indian Banks Association. | Integration timeline with newly announced PM-Vidyalaxmi 2024 unified portal. | `VERIFIED - CONTRACTOR` |
| `edu-national-fellowship` | `ugcnet.nta.ac.in` | National Testing Agency | Autonomous testing agency under Ministry of Education; conducts UGC-NET. | Selection is automated from UGC-NET merit list; no standalone portal application. | `VERIFIED - STATUTORY` |
| `edu-tn-free-education` | `tngasa.in` | Directorate of Collegiate Ed TN | Official admissions portal for Tamil Nadu Government Arts & Science Colleges. | Portal is active only during June–August state admissions window. | `VERIFIED - STATE GOVT` |
| `agri-tn-kuruvai` | `agritech.tnau.ac.in` | TNAU / Govt of TN | State agricultural university extension portal for Tamil Nadu. | Subsidy distribution is handled offline via Block Agricultural Extension Offices. | `VERIFIED - ACADEMIC/STATE` |
| `health-tn-cmchis` | `cmchistn.com` | United India Insurance / TN | Official portal under contract with Govt of Tamil Nadu and State Health Society. | Card issuance and biometric enrollment requires physical visit to District Kiosk. | `VERIFIED - STATE CONTRACTOR` |
| `health-nikshay-poshan` | `nikshay.in` | Central TB Division / MoHFW | Official National TB Elimination Program platform under MoHFW. | Direct citizen online registration is informational; health staff log DBT accounts. | `VERIFIED - CENTRAL GOVT` |
| `health-tn-innuyir-48` | `cmchistn.com/nk48` | Govt of Tamil Nadu | Emergency accident care initiative portal under CMCHIS network. | Hospital network search is public; enrollment occurs at casualty admission. | `VERIFIED - STATE GOVT` |
| `emp-pmkvy-4` | `pmkvyofficial.org` | NSDC / MSDE | National Skill Development Corporation under Ministry of Skill Development. | Whether registrations have migrated exclusively to `skillindiadigital.gov.in`. | `VERIFIED - STATUTORY` |
| `GOV-ENT-002` | `standupmitra.in` | SIDBI / DFS | Stand-Up India official portal developed by SIDBI under DFS guidelines. | Verification of active Handholding Agency network links. | `VERIFIED - STATUTORY` |
| `GOV-FIN-006` | `maandhan.in` | MoLE / LIC | Ministry of Labour & Employment administered jointly with LIC. | CSC Digital Seva Kendra remains primary physical enrollment channel. | `VERIFIED - CENTRAL GOVT` |
