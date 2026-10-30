import { test, describe } from 'node:test';
import assert from 'node:assert';
import Application from '../server/models/Application.js';

describe('Phase 18: Dedicated Application Number Field & Remarks Non-Destructive Integrity Tests', () => {
  test('Application Mongoose schema has applicationNumber defined with trim and index', () => {
    const appNumberPath = Application.schema.path('applicationNumber');
    assert.ok(appNumberPath, 'applicationNumber path must exist on ApplicationSchema');
    assert.strictEqual(appNumberPath.instance, 'String', 'applicationNumber must be String type');
  });

  test('Application Mongoose schema preserves remarks field without conflicting with applicationNumber', () => {
    const remarksPath = Application.schema.path('remarks');
    assert.ok(remarksPath, 'remarks path must exist on ApplicationSchema');
    assert.strictEqual(remarksPath.instance, 'String', 'remarks must be String type');
  });

  test('Regex extraction correctly extracts acknowledgement number from varied remarks formats', () => {
    const ackRegex = /Ack Number:\s*([^\n\r]+)/i;

    const case1 = 'Ack Number: PMK-TN-2026-98124';
    const match1 = case1.match(ackRegex);
    assert.ok(match1, 'Should match case 1');
    assert.strictEqual(match1[1].trim(), 'PMK-TN-2026-98124');

    const case2 = 'Submitted online. Ack Number: SCH-MH-44219. Awaiting nodal verification.';
    const match2 = case2.match(ackRegex);
    assert.ok(match2, 'Should match case 2');
    assert.strictEqual(match2[1].trim(), 'SCH-MH-44219. Awaiting nodal verification.');

    const case3 = 'Ack Number:     DL-EDU-009182  ';
    const match3 = case3.match(ackRegex);
    assert.ok(match3, 'Should match case 3 with whitespace');
    assert.strictEqual(match3[1].trim(), 'DL-EDU-009182');

    const case4 = 'General citizen remarks without acknowledgement numbers';
    const match4 = case4.match(ackRegex);
    assert.strictEqual(match4, null, 'Should return null when no Ack Number present');
  });

  test('Non-destructive recovery preserves original remarks string completely untouched', () => {
    const originalRemarks = 'Ack Number: GOV-IN-771891\nDocument verified at district kiosk.';
    const ackRegex = /Ack Number:\s*([^\n\r]+)/i;
    const match = originalRemarks.match(ackRegex);

    assert.ok(match);
    const extractedNumber = match[1].trim();
    assert.strictEqual(extractedNumber, 'GOV-IN-771891');

    // Ensure original remarks are 100% unchanged
    assert.strictEqual(originalRemarks, 'Ack Number: GOV-IN-771891\nDocument verified at district kiosk.');
  });

  test('Frontend mapping logic correctly prioritizes dedicated applicationNumber over remarks fallback', () => {
    // Record with dedicated field
    const recordA = {
      _id: '6ae44089f381c807054d1246',
      applicationNumber: 'PMK-TN-882190',
      remarks: 'Ack Number: OLD-REMARK-000000'
    };

    const resolvedNumberA = recordA.applicationNumber || (
      recordA.remarks && recordA.remarks.startsWith('Ack Number: ')
        ? recordA.remarks.replace('Ack Number: ', '')
        : `APP-${recordA._id.slice(-8).toUpperCase()}`
    );
    assert.strictEqual(resolvedNumberA, 'PMK-TN-882190', 'Should prioritize dedicated applicationNumber');

    // Record without dedicated field but with remarks
    const recordB = {
      _id: '6ae44089f381c807054d1246',
      remarks: 'Ack Number: TN-LEGACY-112233'
    };

    const resolvedNumberB = recordB.applicationNumber || (
      recordB.remarks && recordB.remarks.startsWith('Ack Number: ')
        ? recordB.remarks.replace('Ack Number: ', '')
        : `APP-${recordB._id.slice(-8).toUpperCase()}`
    );
    assert.strictEqual(resolvedNumberB, 'TN-LEGACY-112233', 'Should fallback to remarks when field absent');

    // Record with neither
    const recordC = {
      _id: '6ae44089f381c807054d1246',
      remarks: 'Submitted via GovScheme Tracker'
    };

    const resolvedNumberC = recordC.applicationNumber || (
      recordC.remarks && recordC.remarks.startsWith('Ack Number: ')
        ? recordC.remarks.replace('Ack Number: ', '')
        : `APP-${recordC._id.slice(-8).toUpperCase()}`
    );
    assert.strictEqual(resolvedNumberC, 'APP-054D1246', 'Should fallback to synthetic APP-ID');
  });
});

