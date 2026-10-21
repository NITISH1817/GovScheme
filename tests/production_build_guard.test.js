// tests/production_build_guard.test.js
// GovScheme Phase 6 — Safe Production Build Guard Regression Suite
// Validates fail-closed production API URL validation in vite.config.ts

import assert from 'assert';
import viteConfigFactory, { validateProductionApiUrl, productionApiGuardPlugin } from '../vite.config.ts';

function pass(name) {
  console.log(`  [PASS] ${name}`);
}

async function runProductionBuildGuardTests() {
  console.log('================================================================');
  console.log('    GOVSCHEME PHASE 6: PRODUCTION BUILD GUARD TEST SUITE        ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test 1: Valid HTTPS Production API URLs Pass
  // -------------------------------------------------------------
  console.log('--- Test 1: Valid HTTPS Production API URLs Pass ---');
  {
    const canonicalUrl = 'https://govscheme-api.onrender.com';
    const result1 = validateProductionApiUrl(canonicalUrl);
    assert.strictEqual(result1, canonicalUrl);
    pass('1.1: Canonical production URL (https://govscheme-api.onrender.com) passes cleanly');

    const trailingSlashUrl = 'https://govscheme-api.onrender.com/';
    const result2 = validateProductionApiUrl(trailingSlashUrl);
    assert.strictEqual(result2, trailingSlashUrl);
    pass('1.2: HTTPS production URL with trailing slash passes');

    const customPortUrl = 'https://api.govhelp.gov.in:8443/api';
    const result3 = validateProductionApiUrl(customPortUrl);
    assert.strictEqual(result3, customPortUrl);
    pass('1.3: HTTPS production URL with port and path passes');

    const whitespacePaddedUrl = '  https://govscheme-api.onrender.com  ';
    const result4 = validateProductionApiUrl(whitespacePaddedUrl);
    assert.strictEqual(result4, canonicalUrl);
    pass('1.4: Whitespace-padded valid HTTPS URL is trimmed and accepted');
  }

  // -------------------------------------------------------------
  // Test 2: Missing or Empty Production API URL Fails
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Missing or Empty Production API URL Fails ---');
  {
    const missingValues = [undefined, null, '', '   ', '\t\n'];
    for (const val of missingValues) {
      assert.throws(
        () => validateProductionApiUrl(val),
        (err) => {
          assert(err instanceof Error);
          assert(err.message.includes('[Production Build Guard]'));
          assert(err.message.includes('VITE_API_URL is missing or empty'));
          assert(err.message.includes('https://govscheme-api.onrender.com'));
          return true;
        },
        `Expected missing value (${val}) to throw descriptive error`
      );
    }
    pass('2.1: Missing, undefined, null, and whitespace-only API URLs fail-closed');
  }

  // -------------------------------------------------------------
  // Test 3: Insecure HTTP Production URL Fails
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Insecure HTTP Production URL Fails ---');
  {
    const insecureUrls = [
      'http://govscheme-api.onrender.com',
      'http://api.govhelp.gov.in',
      'http://insecure-backend.internal',
    ];

    for (const url of insecureUrls) {
      assert.throws(
        () => validateProductionApiUrl(url),
        (err) => {
          assert(err instanceof Error);
          assert(err.message.includes('[Production Build Guard]'));
          assert(err.message.includes('must use the HTTPS protocol'));
          assert(err.message.includes('http:'));
          return true;
        },
        `Expected HTTP URL (${url}) to be rejected`
      );
    }
    pass('3.1: Insecure HTTP production URLs are strictly rejected with HTTPS requirement message');
  }

  // -------------------------------------------------------------
  // Test 4: Localhost and Loopback Targets Fail
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Localhost and Loopback Targets Fail ---');
  {
    const loopbackUrls = [
      'https://localhost',
      'https://localhost:5000',
      'https://api.localhost',
      'https://subdomain.localhost:8080',
      'https://127.0.0.1',
      'https://127.0.0.1:5000',
      'https://127.0.1.1:8000',
      'https://0.0.0.0:5000',
      'https://[::1]:5000',
      'https://[0:0:0:0:0:0:0:1]:5000',
      'https://internal-service.local',
      'https://myhost.local:3000',
    ];

    for (const url of loopbackUrls) {
      assert.throws(
        () => validateProductionApiUrl(url),
        (err) => {
          assert(err instanceof Error);
          assert(err.message.includes('[Production Build Guard]'));
          assert(err.message.includes('cannot target localhost or loopback'));
          return true;
        },
        `Expected loopback URL (${url}) to be rejected`
      );
    }
    pass('4.1: Localhost, IPv4/IPv6 loopback, 0.0.0.0, and .local domains are strictly rejected');
  }

  // -------------------------------------------------------------
  // Test 5: Malformed URLs Fail
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Malformed URLs Fail ---');
  {
    const malformedInputs = [
      'not-a-url',
      'htp://misspelled-scheme.com',
      '//missing-scheme.com',
      'https://',
      'ftp://govscheme-api.onrender.com',
      'javascript:alert(1)',
    ];

    for (const input of malformedInputs) {
      assert.throws(
        () => validateProductionApiUrl(input),
        (err) => {
          assert(err instanceof Error);
          assert(err.message.includes('[Production Build Guard]'));
          return true;
        },
        `Expected malformed input (${input}) to throw`
      );
    }
    pass('5.1: Malformed strings, invalid schemes, and non-URL inputs are rejected');
  }

  // -------------------------------------------------------------
  // Test 6: Ordinary Local Development Remains Unaffected
  // -------------------------------------------------------------
  console.log('\n--- Test 6: Ordinary Local Development Remains Unaffected ---');
  {
    // Simulate development serve command with no VITE_API_URL set
    const savedApiUrl = process.env.VITE_API_URL;
    delete process.env.VITE_API_URL;

    try {
      const devConfig = await viteConfigFactory({ command: 'serve', mode: 'development' });
      assert(devConfig, 'Vite dev config should resolve');
      assert.strictEqual(devConfig.server?.port, 5173);
      assert.strictEqual(devConfig.server?.proxy?.['/api']?.target, 'http://localhost:5000');
      assert(devConfig.resolve?.alias?.['@'], 'Path alias @ must be configured');
      pass('6.1: Local development config loads without throwing when VITE_API_URL is unset');

      // Test guard plugin buildStart in development mode (isProductionBuild = false)
      const devPlugin = productionApiGuardPlugin(false, undefined);
      assert.doesNotThrow(() => {
        devPlugin.buildStart?.call({});
      });
      pass('6.2: Guard plugin buildStart hook is a no-op in non-production environments');
    } finally {
      if (savedApiUrl !== undefined) {
        process.env.VITE_API_URL = savedApiUrl;
      }
    }
  }

  // -------------------------------------------------------------
  // Test 7: Vite Configuration Structure & Plugins Preserved
  // -------------------------------------------------------------
  console.log('\n--- Test 7: Vite Configuration Structure & Plugins Preserved ---');
  {
    const savedApiUrl = process.env.VITE_API_URL;
    process.env.VITE_API_URL = 'https://govscheme-api.onrender.com';

    try {
      const prodConfig = await viteConfigFactory({ command: 'build', mode: 'production' });
      assert(Array.isArray(prodConfig.plugins), 'Plugins array must be present');
      assert(prodConfig.plugins.length >= 2, 'Must include react plugin and guard plugin');

      const pluginNames = prodConfig.plugins.map((p) => (p && typeof p === 'object' && 'name' in p ? p.name : 'unknown'));
      assert(pluginNames.includes('govscheme-production-api-guard'), 'Production API guard plugin must be registered');

      // Verify rollupOptions chunks
      const manualChunks = prodConfig.build?.rollupOptions?.output?.manualChunks;
      assert(manualChunks && typeof manualChunks === 'object', 'manualChunks must be defined');
      assert(Array.isArray(manualChunks.vendor), 'vendor chunk preserved');
      assert(Array.isArray(manualChunks.charts), 'charts chunk preserved');
      assert(Array.isArray(manualChunks.icons), 'icons chunk preserved');
      assert(Array.isArray(manualChunks.motion), 'motion chunk preserved');
      pass('7.1: Existing React plugin, manualChunks, aliases, and proxy configuration remain 100% intact');
    } finally {
      if (savedApiUrl !== undefined) {
        process.env.VITE_API_URL = savedApiUrl;
      } else {
        delete process.env.VITE_API_URL;
      }
    }
  }

  // -------------------------------------------------------------
  // Test 8: Production Build Guard Plugin Enforces Invariants
  // -------------------------------------------------------------
  console.log('\n--- Test 8: Production Build Guard Plugin Enforces Invariants ---');
  {
    // Test production mode with valid API URL
    const validProdPlugin = productionApiGuardPlugin(true, 'https://govscheme-api.onrender.com');
    assert.doesNotThrow(() => {
      validProdPlugin.buildStart?.call({});
    });
    pass('8.1: Guard plugin buildStart succeeds with valid production URL');

    // Test production mode with missing API URL throws
    const invalidProdPlugin = productionApiGuardPlugin(true, undefined);
    assert.throws(
      () => {
        invalidProdPlugin.buildStart?.call({});
      },
      (err) => err instanceof Error && err.message.includes('[Production Build Guard]')
    );
    pass('8.2: Guard plugin buildStart throws fail-closed error with missing production URL');
  }

  console.log('\n================================================================');
  console.log(' ALL PHASE 6 PRODUCTION BUILD GUARD TESTS PASSED SUCCESSFULLY!  ');
  console.log('================================================================\n');
}

runProductionBuildGuardTests().catch((err) => {
  console.error('\n[FATAL TEST FAILURE]:', err);
  process.exit(1);
});
