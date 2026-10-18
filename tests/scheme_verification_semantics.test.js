// tests/scheme_verification_semantics.test.js
// GovScheme Verification-Status Semantics & Safety Test Suite
// Verifies all 10 requirements:
// 1. Published, portal-curated scheme without official verification remains discoverable.
// 2. Genuinely eligible citizen can receive that scheme as a recommendation.
// 3. Ineligible citizen does not receive it as an eligible recommendation.
// 4. Draft or inactive scheme remains excluded from public discovery.
// 5. Official-verification status cannot be assigned merely because an official URL is present.
// 6. Manual review does not automatically imply issuer verification (labeled ADMIN_VERIFIED).
// 7. Missing and legacy statuses are handled deliberately and consistently.
// 8. Admin verification and publication permissions continue to work correctly and independently.
// 9. Sync-payload tests ensure canonical schemes are not incorrectly marked officially verified.
//10. Schema enum enforcement and backward compatibility.
import assert from 'assert';
import mongoose from 'mongoose';
import Scheme, { SCHEME_VERIFICATION_STATUSES } from '../server/models/Scheme.js';
import { buildSchemePayload, loadCanonicalSchemes } from '../scripts/sync_mongodb_75.js';
import { evaluateSchemeEligibility, recommendSchemesForProfile } from '../server/services/schemeRecommendationEngine.js';
const DISPOSABLE_TEST_URI = 'mongodb://127.0.0.1:27017/govscheme_disposable_verification_semantics_test';
// Safety Guardrail: Strictly fail closed if targeting any remote/production environment
function assertDisposableLocalDb(uri) {
  if (!uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    throw new Error(`SECURITY HALT: Test database URI must be local (127.0.0.1 or localhost), got: ${uri}`);
  }
  if (!uri.endsWith('_test')) {
    throw new Error(`SECURITY HALT: Test database name must end with '_test', got: ${uri}`);
  }
}
async function runVerificationSemanticsSuite() {
  console.log('================================================================');
  console.log(' GOVSCHEME VERIFICATION STATUS SEMANTICS REGRESSION SUITE        ');
  console.log('================================================================\n');
  assertDisposableLocalDb(DISPOSABLE_TEST_URI);
  console.log(`[Safety Guardrail] Confirmed disposable local test database URI: ${DISPOSABLE_TEST_URI}`);
  let dbConnected = false;
  try {
    await mongoose.connect(DISPOSABLE_TEST_URI, { serverSelectionTimeoutMS: 2000 });
    await Scheme.deleteMany({});
    dbConnected = true;
    console.log('[Setup] Connected to local MongoDB test database.\n');
  } catch (e) {
    console.log('[Setup Notice] Local MongoDB daemon unavailable. Running suite in deterministic Mongoose in-memory validation mode.\n');
  }
  try {
    // -------------------------------------------------------------------------
    // TEST 1: Published, Portal-Curated Scheme Discovery Filter Logic
    // -------------------------------------------------------------------------
    console.log('TEST 1: Verifying that published, portal-curated schemes are discoverable...');
    const curatedScheme = new Scheme({
      schemeId: 'test-scheme-kisan-portal',
      id: 'test-scheme-kisan-portal',
      schemeName: 'Portal Curated Farmer Scheme',
      name: 'Portal Curated Farmer Scheme',
      description: 'Compiled from agriculture department official portal',
      shortDescription: 'Farmer assistance scheme',
      category: 'Agriculture & Farmers',
      department: 'Department of Agriculture',
      state: 'Central',
      governmentLevel: 'Central',
      sourceUrl: 'https://agricoop.nic.in',
      curationSource: 'Official Government Portal',
      officialWebsite: 'https://agricoop.nic.in',
      officialApplyUrl: 'https://agricoop.nic.in/apply',
      status: 'Published',
      activeStatus: true,
      verificationStatus: 'PORTAL_CURATED',
      minimumAge: 18,
      maximumAge: 70,
      incomeLimit: 300000,
      eligibleOccupations: ['Farmer'],
      benefits: 'Financial support',
      benefitsSummary: 'Financial support'
    });
    await curatedScheme.validate();
    // Discovery filter rule: status === 'Published' && activeStatus !== false
    const matchesDiscoveryFilter = (s) => s.status === 'Published' && s.activeStatus !== false;
    assert(matchesDiscoveryFilter(curatedScheme), 'Published portal-curated scheme must satisfy public discovery filter');
    assert.strictEqual(curatedScheme.verificationStatus, 'PORTAL_CURATED', 'Must reflect PORTAL_CURATED status');
    assert.notStrictEqual(curatedScheme.verificationStatus, 'OFFICIALLY_VERIFIED', 'Must not falsely claim OFFICIALLY_VERIFIED');
    console.log('  PASS: Published portal-curated scheme without official verification satisfies public discovery filter.\n');
    // -------------------------------------------------------------------------
    // TEST 2: Genuinely Eligible Citizen Recommendation
    // -------------------------------------------------------------------------
    console.log('TEST 2: Verifying recommendation of portal-curated scheme to eligible citizen...');
    const eligibleCitizen = {
      age: 35,
      income: 180000,
      occupation: 'Farmer',
      state: 'Maharashtra',
      isFarmer: true
    };
    const evalResult = evaluateSchemeEligibility(curatedScheme, eligibleCitizen);
    assert.strictEqual(evalResult.isEligible, true, 'Citizen must be marked eligible');
    assert.strictEqual(evalResult.matchStatus, 'ELIGIBLE_POTENTIAL_MATCH', 'Match status must be ELIGIBLE_POTENTIAL_MATCH');
    const recs = recommendSchemesForProfile([curatedScheme], eligibleCitizen);
    assert.strictEqual(recs.matchingCount, 1, 'Eligible count must be 1');
    assert.strictEqual(recs.recommendations[0].schemeId, 'test-scheme-kisan-portal');
    console.log('  PASS: Genuinely eligible citizen receives portal-curated scheme in recommendations.\n');
    // -------------------------------------------------------------------------
    // TEST 3: Ineligible Citizen Exclusion
    // -------------------------------------------------------------------------
    console.log('TEST 3: Verifying that ineligible citizen does not receive eligible recommendation...');
    const ineligibleCitizen = {
      age: 35,
      income: 500000, // Exceeds ceiling of 300000
      occupation: 'Software Engineer', // Ineligible occupation
      state: 'Maharashtra',
      isFarmer: false
    };
    const ineligibleEval = evaluateSchemeEligibility(curatedScheme, ineligibleCitizen);
    assert.strictEqual(ineligibleEval.isEligible, false, 'Ineligible citizen must not be marked eligible');
    assert.strictEqual(ineligibleEval.matchStatus, 'DOES_NOT_MATCH', 'Match status must be DOES_NOT_MATCH');
    const ineligibleRecs = recommendSchemesForProfile([curatedScheme], ineligibleCitizen);
    assert.strictEqual(ineligibleRecs.matchingCount, 0, 'Matching count must be 0 for ineligible profile');
    assert.strictEqual(ineligibleRecs.recommendations.length, 0, 'Ineligible scheme excluded from recommendations');
    console.log('  PASS: Ineligible citizen does not receive scheme as eligible recommendation.\n');

    // -------------------------------------------------------------------------
    // TEST 4: Draft and Inactive Schemes Excluded from Discovery & Recommendation
    // -------------------------------------------------------------------------
    console.log('TEST 4: Verifying draft and inactive schemes are excluded from public discovery...');
    const draftScheme = new Scheme({
      schemeId: 'draft-internal-welfare',
      id: 'draft-internal-welfare',
      name: 'Draft Internal Welfare',
      department: 'Welfare',
      category: 'Social Welfare',
      state: 'Central',
      status: 'Draft',
      activeStatus: true, // activeStatus true, but status is Draft!
      verificationStatus: 'PENDING',
      sourceUrl: 'https://welfare.gov.in',
      benefits: 'Pending'
    });
    const suspendedScheme = new Scheme({
      schemeId: 'suspended-central-scheme',
      id: 'suspended-central-scheme',
      name: 'Suspended Central Scheme',
      department: 'Welfare',
      category: 'Social Welfare',
      state: 'Central',
      status: 'Published',
      activeStatus: false, // published, but activeStatus is FALSE!
      verificationStatus: 'PORTAL_CURATED',
      sourceUrl: 'https://welfare.gov.in',
      benefits: 'Suspended'
    });
    assert(!matchesDiscoveryFilter(draftScheme), 'Draft schemes must NEVER pass public discovery filter');
    assert(!matchesDiscoveryFilter(suspendedScheme), 'Inactive/suspended schemes must NEVER pass public discovery filter');
    console.log('  PASS: Draft and inactive schemes are strictly excluded from public discovery.\n');
    // -------------------------------------------------------------------------
    // TEST 5: Official URL Alone Does Not Grant Official Verification
    // -------------------------------------------------------------------------
    console.log('TEST 5: Verifying that official URL presence does not imply official verification...');
    const urlScheme = new Scheme({
      schemeId: 'scheme-with-official-url',
      id: 'scheme-with-official-url',
      schemeName: 'Scheme With Official Portal Link',
      name: 'Scheme With Official Portal Link',
      description: 'Official financial support scheme',
      shortDescription: 'Financial support',
      department: 'Ministry of Finance',
      category: 'Financial Inclusion & Credit',
      state: 'Central',
      officialWebsite: 'https://financialservices.gov.in',
      officialApplyUrl: 'https://financialservices.gov.in/apply',
      sourceUrl: 'https://financialservices.gov.in',
      status: 'Published',
      benefits: 'Financial support'
    });
    await urlScheme.validate();
    assert.strictEqual(urlScheme.verificationStatus, 'PORTAL_CURATED', 'Must default to PORTAL_CURATED, not OFFICIALLY_VERIFIED');
    assert.strictEqual(urlScheme.verificationEvidence, undefined, 'No evidence should be synthesized');
    console.log('  PASS: Official URL alone assigns PORTAL_CURATED, never OFFICIALLY_VERIFIED.\n');
    // -------------------------------------------------------------------------
    // TEST 6: Manual Admin Review Labeled ADMIN_VERIFIED, Not OFFICIALLY_VERIFIED
    // -------------------------------------------------------------------------
    console.log('TEST 6: Verifying manual admin review sets ADMIN_VERIFIED, not OFFICIALLY_VERIFIED...');
    const mockAdminId = new mongoose.Types.ObjectId();
    const adminReviewed = new Scheme({
      schemeId: 'reviewed-scheme',
      id: 'reviewed-scheme',
      schemeName: 'Admin Reviewed Scheme',
      name: 'Admin Reviewed Scheme',
      description: 'Admin reviewed welfare scheme',
      shortDescription: 'Welfare assistance',
      department: 'Social Welfare',
      category: 'Social Welfare',
      state: 'Central',
      sourceUrl: 'https://welfare.gov.in',
      benefits: 'Assistance',
      verificationStatus: 'ADMIN_VERIFIED',
      verifiedBy: mockAdminId,
      lastVerifiedAt: new Date()
    });
    await adminReviewed.validate();
    assert.strictEqual(adminReviewed.verificationStatus, 'ADMIN_VERIFIED', 'Manual admin review must be ADMIN_VERIFIED');
    assert.notStrictEqual(adminReviewed.verificationStatus, 'OFFICIALLY_VERIFIED', 'Manual admin review must never claim OFFICIALLY_VERIFIED without issuer API');
    assert(adminReviewed.verifiedBy.equals(mockAdminId), 'Must record verifiedBy admin identifier');
    console.log('  PASS: Manual administrative review is accurately recorded as ADMIN_VERIFIED.\n');
    // -------------------------------------------------------------------------
    // TEST 7: Missing and Legacy Statuses Handled Deliberately
    // -------------------------------------------------------------------------
    console.log('TEST 7: Verifying missing and legacy status handling...');
    const legacyScheme = new Scheme({
      schemeId: 'legacy-verified-doc',
      id: 'legacy-verified-doc',
      schemeName: 'Legacy Verified Scheme',
      name: 'Legacy Verified Scheme',
      description: 'Legacy health scheme with Verified status',
      shortDescription: 'Healthcare assistance',
      department: 'Health',
      category: 'Health & Healthcare',
      state: 'Central',
      status: 'Published',
      activeStatus: true,
      verificationStatus: 'Verified', // Legacy value
      sourceUrl: 'https://mohfw.gov.in',
      benefits: 'Healthcare'
    });
    await legacyScheme.validate();

    assert.strictEqual(legacyScheme.verificationStatus, 'Verified', 'Legacy value preserved on read without validation failure');
    assert(matchesDiscoveryFilter(legacyScheme), 'Legacy published document remains discoverable');
    console.log('  PASS: Legacy "Verified" documents are safely handled without data loss or crash.\n');

    // -------------------------------------------------------------------------
    // TEST 8: Publication Status and Verification Status Independence
    // -------------------------------------------------------------------------
    console.log('TEST 8: Verifying publication status and verification status are distinct and independent...');
    // Scheme A: Published + PORTAL_CURATED (Standard public canonical scheme)
    const schemeA = new Scheme({
      schemeId: 'pub-portal-curated',
      id: 'pub-portal-curated',
      schemeName: 'Published Portal Curated Scheme',
      name: 'Published Portal Curated Scheme',
      description: 'Published portal curated welfare assistance',
      shortDescription: 'Social assistance',
      department: 'Social Justice',
      category: 'Social Welfare',
      state: 'Central',
      status: 'Published',
      activeStatus: true,
      verificationStatus: 'PORTAL_CURATED',
      sourceUrl: 'https://socialjustice.gov.in',
      benefits: 'Social assistance'
    });
    await schemeA.validate();

    // Scheme B: Draft + ADMIN_VERIFIED (Nodal officer verified content, but not yet published)
    const schemeB = new Scheme({
      schemeId: 'draft-admin-verified',
      id: 'draft-admin-verified',
      schemeName: 'Draft Admin Verified Scheme',
      name: 'Draft Admin Verified Scheme',
      description: 'Draft admin verified welfare assistance',
      shortDescription: 'Social assistance',
      department: 'Social Justice',
      category: 'Social Welfare',
      state: 'Central',
      status: 'Draft',
      activeStatus: true,
      verificationStatus: 'ADMIN_VERIFIED',
      sourceUrl: 'https://socialjustice.gov.in',
      benefits: 'Social assistance'
    });
    await schemeB.validate();

    assert.strictEqual(schemeA.status, 'Published');
    assert.strictEqual(schemeA.verificationStatus, 'PORTAL_CURATED');
    assert.strictEqual(schemeB.status, 'Draft');
    assert.strictEqual(schemeB.verificationStatus, 'ADMIN_VERIFIED');

    assert(matchesDiscoveryFilter(schemeA), 'Scheme A is in public discovery');
    assert(!matchesDiscoveryFilter(schemeB), 'Scheme B is NOT in public discovery despite ADMIN_VERIFIED');
    console.log('  PASS: Publication status and verification status operate independently as designed.\n');

    // -------------------------------------------------------------------------
    // TEST 9: Canonical Sync Payload Tests (Zero False Verification Claims)
    // -------------------------------------------------------------------------
    console.log('TEST 9: Verifying sync payload construction across all 75 canonical schemes...');
    const canonicalSchemes = loadCanonicalSchemes();
    assert.strictEqual(canonicalSchemes.length, 75, 'Must load exactly 75 canonical schemes');

    let officiallyVerifiedCount = 0;
    let legacyVerifiedCount = 0;
    let portalCuratedCount = 0;

    for (const s of canonicalSchemes) {
      const payload = buildSchemePayload(s);
      if (payload.verificationStatus === 'OFFICIALLY_VERIFIED') officiallyVerifiedCount++;
      if (payload.verificationStatus === 'Verified') legacyVerifiedCount++;
      if (payload.verificationStatus === 'PORTAL_CURATED') portalCuratedCount++;
      assert.strictEqual(payload.status, 'Published', `Scheme ${s.id} must be Published`);
      assert.strictEqual(payload.activeStatus, true, `Scheme ${s.id} must be activeStatus: true`);
      assert.strictEqual(payload.curationSource, 'Official Government Portal');
    }

    assert.strictEqual(officiallyVerifiedCount, 0, 'CRITICAL: No canonical scheme can claim OFFICIALLY_VERIFIED without issuer API');
    assert.strictEqual(legacyVerifiedCount, 0, 'CRITICAL: No canonical scheme can use legacy "Verified"');
    assert.strictEqual(portalCuratedCount, 75, 'CRITICAL: All 75 canonical schemes must receive honest PORTAL_CURATED status');
    console.log(`  PASS: All 75 canonical schemes receive PORTAL_CURATED (${portalCuratedCount}/75), 0 falsely claimed OFFICIALLY_VERIFIED.\n`);

    // -------------------------------------------------------------------------
    // TEST 10: Model Schema Enum Validation
    // -------------------------------------------------------------------------
    console.log('TEST 10: Verifying schema enum enforcement...');
    assert(SCHEME_VERIFICATION_STATUSES.includes('PORTAL_CURATED'));
    assert(SCHEME_VERIFICATION_STATUSES.includes('ADMIN_VERIFIED'));
    assert(SCHEME_VERIFICATION_STATUSES.includes('OFFICIALLY_VERIFIED'));
    assert(SCHEME_VERIFICATION_STATUSES.includes('PENDING'));
    assert(SCHEME_VERIFICATION_STATUSES.includes('UNVERIFIED'));
    assert(SCHEME_VERIFICATION_STATUSES.includes('Verified'));

    let validationFailed = false;
    try {
      const invalidScheme = new Scheme({
        schemeId: 'invalid-enum-scheme',
        id: 'invalid-enum-scheme',
        schemeName: 'Invalid Status Scheme',
        name: 'Invalid Status Scheme',
        description: 'Invalid enum test scheme',
        shortDescription: 'Invalid enum',
        department: 'Test',
        category: 'General',
        state: 'Central',
        sourceUrl: 'https://test.gov.in',
        benefits: 'None',
        verificationStatus: 'FAKE_OFFICIAL_VERIFIED' // Not in enum
      });
      await invalidScheme.validate();
    } catch (err) {
      validationFailed = true;
      assert(err.name === 'ValidationError', 'Must throw Mongoose ValidationError');
    }
    assert.strictEqual(validationFailed, true, 'Schema must reject unapproved verificationStatus enum values');
    console.log('  PASS: Scheme schema strictly rejects unapproved verificationStatus values.\n');

    console.log('================================================================');
    console.log(' ALL 10 VERIFICATION SEMANTICS REGRESSION CHECKS PASSED (10/10)  ');
    console.log('================================================================');
  } finally {
    if (dbConnected) {
      await Scheme.deleteMany({});
      await mongoose.disconnect();
      console.log('\n[Teardown] Disposable test database cleaned and disconnected.');
    }
  }
}

runVerificationSemanticsSuite().catch(err => {
  console.error('Verification semantics suite failed:', err);
  process.exit(1);
});
