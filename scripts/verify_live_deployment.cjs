const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('=== VERIFYING LIVE DEPLOYED PROJECT ===\n');

  // 1. Frontend HTML
  const frontend = await get('https://govhelp.vercel.app');
  console.log('1. Frontend (https://govhelp.vercel.app):');
  console.log('   Status:', frontend.status);
  console.log('   HTML size:', frontend.data.length, 'bytes');
  
  // Find bundle script
  const scriptMatch = frontend.data.match(/\/assets\/index-[^"']+\.js/);
  if (scriptMatch) {
    const bundleUrl = `https://govhelp.vercel.app${scriptMatch[0]}`;
    console.log('   Active JS bundle:', bundleUrl);
    const bundle = await get(bundleUrl);
    console.log('   Bundle HTTP:', bundle.status, '| Size:', bundle.data.length, 'bytes');
    console.log('   Contains i18n v=24 cache tag:', bundle.data.includes('?v=24') ? 'YES' : 'NO');
    console.log('   Contains step_1 translation key lookup:', bundle.data.includes('_step_') ? 'YES' : 'NO');
  }

  // 2. Locale JSON on Vercel
  console.log('\n2. Translation Bundles on Vercel:');
  for (const lng of ['ta', 'hi', 'te', 'ml', 'mr', 'gu', 'en']) {
    const loc = await get(`https://govhelp.vercel.app/locales/${lng}/translation.json?v=24`);
    let keys = 0;
    let kki = 'N/A';
    try {
      const parsed = JSON.parse(loc.data);
      keys = Object.keys(parsed).length;
      kki = parsed['house-tn-kalaignar-kanavu-illam_step_1'] ? 'PRESENT' : 'MISSING';
    } catch (e) {}
    console.log(`   [${lng}] Status: ${loc.status} | Total keys: ${keys} | Scheme Step: ${kki}`);
  }

  // 3. Backend Render
  console.log('\n3. Backend API (https://govscheme-api.onrender.com):');
  const beSchemes = await get('https://govscheme-api.onrender.com/api/schemes');
  console.log('   /api/schemes status:', beSchemes.status);
  try {
    const list = JSON.parse(beSchemes.data);
    console.log('   Total schemes served by backend:', Array.isArray(list) ? list.length : 'OK');
  } catch(e) {
    console.log('   Backend response preview:', beSchemes.data.slice(0, 100));
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

verify().catch(console.error);
