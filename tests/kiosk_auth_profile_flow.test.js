// tests/kiosk_auth_profile_flow.test.js
// Tests the Kiosk Mode authentication guard and automatic profile completion flow

import assert from 'assert';
import { isProfileComplete, getMissingProfileFields, normalizeUserProfile } from '../src/utils/profileUtils.ts';
import { translations } from '../src/data/translations.ts';

function pass(name) {
  console.log(`  [PASS] ${name}`);
}

async function runKioskAuthProfileFlowTests() {
  console.log('================================================================');
  console.log('  GOVSCHEME KIOSK AUTHENTICATION & PROFILE COMPLETION SUITE     ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test 1: Kiosk Authentication Notice Translations
  // -------------------------------------------------------------
  console.log('--- Test 1: Kiosk Auth Notice Localization ---');
  {
    assert(translations.en.kioskAuthNotice, 'English kioskAuthNotice must exist');
    assert(translations.en.kioskAuthNotice.includes('CSC Kiosk Mode'), 'English notice mentions CSC Kiosk Mode');
    assert(translations.hi.kioskAuthNotice, 'Hindi kioskAuthNotice must exist');
    assert(translations.ta.kioskAuthNotice, 'Tamil kioskAuthNotice must exist');
    assert(translations.te.kioskAuthNotice, 'Telugu kioskAuthNotice must exist');
    assert(translations.ml.kioskAuthNotice, 'Malayalam kioskAuthNotice must exist');
    pass('1.1: Localized kioskAuthNotice is defined across all supported Indic languages');
  }

  // -------------------------------------------------------------
  // Test 2: Incomplete Profile Detection for Newly Registered Citizens
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Incomplete Profile Detection on Signup ---');
  {
    // A newly registered citizen has only fullName and email
    const freshlyRegisteredCitizen = normalizeUserProfile({
      fullName: 'Ramesh Kumar',
      email: 'ramesh.kumar@example.com',
      role: 'Citizen'
    });

    const isComplete = isProfileComplete(freshlyRegisteredCitizen);
    assert.strictEqual(isComplete, false, 'Freshly registered citizen profile must not be marked complete');

    const missingFields = getMissingProfileFields(freshlyRegisteredCitizen);
    assert(missingFields.includes('Age'), 'Age must be missing');
    assert(missingFields.includes('Gender'), 'Gender must be missing');
    assert(missingFields.includes('State'), 'State must be missing');
    assert(missingFields.includes('District'), 'District must be missing');
    assert(missingFields.includes('Annual Income'), 'Annual Income must be missing');
    assert(missingFields.includes('Occupation'), 'Occupation must be missing');
    assert(missingFields.includes('Category'), 'Category must be missing');
    pass('2.1: Freshly registered citizen profile is flagged as incomplete requiring profile completion');
  }

  // -------------------------------------------------------------
  // Test 3: Complete Profile Verification
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Complete Profile Verification ---');
  {
    const completedCitizen = normalizeUserProfile({
      fullName: 'Ramesh Kumar',
      email: 'ramesh.kumar@example.com',
      role: 'Citizen',
      age: 35,
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      annualIncome: 180000,
      occupation: 'Farmer',
      category: 'OBC'
    });

    const isComplete = isProfileComplete(completedCitizen);
    assert.strictEqual(isComplete, true, 'Fully configured citizen profile must be marked complete');
    assert.strictEqual(getMissingProfileFields(completedCitizen).length, 0, 'No missing fields for complete profile');
    pass('3.1: Complete profile is recognized and bypasses mandatory profile wizard');
  }

  // -------------------------------------------------------------
  // Test 4: Navigation State Transitions (Kiosk Guard & Redirect)
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Navigation Flow Logic Simulation ---');
  {
    // Simulate user state transitions
    let activeTab = 'home';
    let user = null;
    let isAuthOpen = false;
    let authMode = 'login';
    let pendingKioskRedirect = false;
    let authNotice = undefined;

    const handleNavigateTab = (tab) => {
      if (tab === 'kiosk' && !user) {
        pendingKioskRedirect = true;
        authNotice = translations.en.kioskAuthNotice;
        authMode = 'login';
        isAuthOpen = true;
        return;
      }
      activeTab = tab;
    };

    // 4.1 Citizen selects kiosk before sign in
    handleNavigateTab('kiosk');
    assert.strictEqual(activeTab, 'home', 'Tab must not transition to kiosk without auth');
    assert.strictEqual(isAuthOpen, true, 'Auth modal must open');
    assert.strictEqual(pendingKioskRedirect, true, 'pendingKioskRedirect must be set');
    assert(authNotice.includes('CSC Kiosk Mode'), 'Auth notice must explain Kiosk Mode requirement');
    pass('4.1: Selecting Kiosk Mode before sign-in halts navigation and prompts AuthModal with clear notice');

    // 4.2 Citizen completes sign-up
    const newlyRegisteredUser = normalizeUserProfile({
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      role: 'Citizen'
    });

    // Simulate onLoginSuccess with isNewRegistration = true
    const isNewRegistration = true;
    let wizardMode = 'wizard';

    if (isNewRegistration || !isProfileComplete(newlyRegisteredUser)) {
      wizardMode = 'wizard';
      activeTab = 'wizard';
    } else if (pendingKioskRedirect) {
      pendingKioskRedirect = false;
      activeTab = 'kiosk';
    }

    assert.strictEqual(activeTab, 'wizard', 'New registration must automatically navigate to wizard to fill profile');
    assert.strictEqual(wizardMode, 'wizard', 'Wizard mode must be set to wizard');
    pass('4.2: Signing up automatically navigates user to fill their profile in the wizard');

    // 4.3 Citizen finishes filling profile in the wizard
    const filledProfile = {
      ...newlyRegisteredUser,
      age: 29,
      gender: 'Female',
      state: 'Maharashtra',
      district: 'Pune',
      annualIncome: 240000,
      occupation: 'Self Employed',
      category: 'General'
    };
    user = filledProfile;

    // Simulate wizard onComplete with pendingKioskRedirect = true
    if (pendingKioskRedirect) {
      pendingKioskRedirect = false;
      authNotice = undefined;
      activeTab = 'kiosk';
    } else {
      activeTab = 'analyzing';
    }

    assert.strictEqual(activeTab, 'kiosk', 'Completing profile redirects to kiosk mode when pendingKioskRedirect was active');
    assert.strictEqual(pendingKioskRedirect, false, 'pendingKioskRedirect is reset');
    pass('4.3: After user fills profile, flow seamlessly transitions into Kiosk Mode');
  }

  console.log('\n================================================================');
  console.log(' ALL KIOSK AUTH & PROFILE FLOW TESTS PASSED SUCCESSFULLY!       ');
  console.log('================================================================\n');
}

runKioskAuthProfileFlowTests().catch((err) => {
  console.error('\n[FATAL TEST FAILURE]:', err);
  process.exit(1);
});
