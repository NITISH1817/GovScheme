import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import { buildSchemePayload, loadCanonicalSchemes } from '../scripts/sync_mongodb_75.js';

describe('Phase 18: Central vs State Scheme Classification Tests', () => {
  test('Central scheme with state="Central" maps to governmentLevel="Central" and residenceRequirements="Citizen of India"', () => {
    const mockCentralScheme = {
      id: 'pm-kisan-test',
      name: 'Pradhan Mantri Kisan Samman Nidhi',
      shortDescription: 'Income support to farmer families',
      department: 'Department of Agriculture',
      category: 'Agriculture',
      state: 'Central',
      eligibilityRules: { minAge: 18, maxAge: 100 }
    };

    const payload = buildSchemePayload(mockCentralScheme);
    assert.strictEqual(payload.state, 'Central');
    assert.strictEqual(payload.governmentLevel, 'Central');
    assert.strictEqual(payload.residenceRequirements, 'Citizen of India');
  });

  test('Central scheme with state="All" maps to governmentLevel="Central" and residenceRequirements="Citizen of India"', () => {
    const mockAllScheme = {
      id: 'pan-india-scheme',
      name: 'National Digital Health Mission',
      shortDescription: 'Digital healthcare infrastructure',
      department: 'Ministry of Health',
      category: 'Healthcare',
      state: 'All',
      eligibilityRules: { minAge: 0, maxAge: 120 }
    };

    const payload = buildSchemePayload(mockAllScheme);
    assert.strictEqual(payload.governmentLevel, 'Central');
    assert.strictEqual(payload.residenceRequirements, 'Citizen of India');
  });

  test('State scheme with state="Tamil Nadu" maps to governmentLevel="State" and residenceRequirements="Resident of Tamil Nadu"', () => {
    const mockStateScheme = {
      id: 'tn-pudhumai-penn-test',
      name: 'Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme',
      shortDescription: 'Monthly financial assistance to female students',
      department: 'Social Welfare and Women Empowerment',
      category: 'Education',
      state: 'Tamil Nadu',
      eligibilityRules: { minAge: 17, maxAge: 25 }
    };

    const payload = buildSchemePayload(mockStateScheme);
    assert.strictEqual(payload.state, 'Tamil Nadu');
    assert.strictEqual(payload.governmentLevel, 'State');
    assert.strictEqual(payload.residenceRequirements, 'Resident of Tamil Nadu');
  });

  test('State scheme with state="Maharashtra" maps to governmentLevel="State" and residenceRequirements="Resident of Maharashtra"', () => {
    const mockMhScheme = {
      id: 'mh-ladki-bahin-test',
      name: 'Mukhyamantri Majhi Ladki Bahin Yojana',
      shortDescription: 'Financial empowerment for women',
      department: 'Women and Child Development',
      category: 'Women & Child',
      state: 'Maharashtra',
      eligibilityRules: { minAge: 21, maxAge: 65 }
    };

    const payload = buildSchemePayload(mockMhScheme);
    assert.strictEqual(payload.state, 'Maharashtra');
    assert.strictEqual(payload.governmentLevel, 'State');
    assert.strictEqual(payload.residenceRequirements, 'Resident of Maharashtra');
  });

  test('All 75 canonical schemes map with 100% consistent governmentLevel and statutory residence requirements', () => {
    const schemes = loadCanonicalSchemes();
    assert.strictEqual(schemes.length, 75, 'Expected 75 canonical schemes');

    let centralCount = 0;
    let stateCount = 0;

    const ruralIds = new Set(['mgnrega', 'pmay-g', 'pm-svamitva-property-card', 'house-swachh-bharat-ग्रामीण-toilet']);
    const urbanIds = new Set(['pm-svanidhi', 'deendayal-antodaya-shelter', 'affordable-rental-housing', 'house-pmay-urban-2']);
    const centrallySponsoredIds = new Set(['pmjay-ayushman', 'nsap-old-age-pension', 'post-matric-scholarship']);

    schemes.forEach(s => {
      const payload = buildSchemePayload(s);
      if (s.state === 'Central' || s.state === 'All') {
        centralCount++;
        assert.strictEqual(payload.governmentLevel, 'Central', `Scheme ${s.id} should have governmentLevel=Central`);
        
        if (ruralIds.has(s.id)) {
          assert.strictEqual(payload.residenceRequirements, 'Resident of Rural India', `Scheme ${s.id} should have residenceRequirements="Resident of Rural India"`);
        } else if (s.id === 'pm-svanidhi') {
          assert.strictEqual(payload.residenceRequirements, 'Resident of Urban / Peri-Urban Area', `Scheme ${s.id} should have urban/peri-urban residence requirement`);
        } else if (urbanIds.has(s.id)) {
          assert.strictEqual(payload.residenceRequirements, 'Resident of Urban Area', `Scheme ${s.id} should have residenceRequirements="Resident of Urban Area"`);
        } else if (centrallySponsoredIds.has(s.id)) {
          assert.strictEqual(payload.residenceRequirements, 'Citizen of India (State Domicile / Ration Card Linked)', `Scheme ${s.id} should have state domicile linked requirement`);
        } else {
          assert.strictEqual(payload.residenceRequirements, 'Citizen of India', `Scheme ${s.id} should have residenceRequirements="Citizen of India"`);
        }
      } else {
        stateCount++;
        assert.strictEqual(payload.governmentLevel, 'State', `Scheme ${s.id} should have governmentLevel=State`);
        assert.strictEqual(payload.residenceRequirements, `Resident of ${s.state}`, `Scheme ${s.id} should have residenceRequirements="Resident of ${s.state}"`);
      }
    });

    assert.strictEqual(centralCount, 54, 'Expected exactly 54 Central schemes');
    assert.strictEqual(stateCount, 21, 'Expected exactly 21 State schemes');
  });
});

